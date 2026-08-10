"""
services/dataset_manager.py
----------------------------
Backend for the "Import Knowledge" feature: lists category folders,
validates an incoming JSON troubleshooting record, assigns a safe ID
and filename (never overwriting existing data), writes the file into
the right category folder, then refreshes the dataset.

This module does NOT modify DatasetLoader, SearchEngine, or AIEngine.
It only calls DatasetLoader's existing public API (load_all, via the
loader instance passed in) and optionally rebuilds a SearchEngine
using a factory function supplied by app.py - it never touches those
classes' internals.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, List, Optional

# Fields a troubleshooting record must have to be importable at all.
REQUIRED_FIELDS = ["id", "category", "problem"]


@dataclass
class ValidationResult:
    valid: bool
    errors: List[str] = field(default_factory=list)
    data: Optional[dict] = None  # parsed JSON dict, set even on failure if syntax was OK


@dataclass
class ImportResult:
    problem: str
    category: str
    assigned_id: str
    filename: str


class DatasetManager:
    """Stateless-ish helper around the dataset directory. Holds no
    dataset copy of its own - it reads from disk each call and defers
    to the app's existing loader/search engine for anything dataset-wide.
    """

    def __init__(
        self,
        dataset_dir: Path,
        loader,
        search_engine_factory: Optional[Callable[[list], object]] = None,
        logger=None,
    ):
        """
        dataset_dir           : the dataset/ root folder.
        loader                : the app's existing DatasetLoader instance.
                                 Only its public load_all() is called here.
        search_engine_factory : optional callable(records) -> SearchEngine.
                                 Used by reload_dataset() to rebuild search
                                 after an import (e.g. pass SearchEngine
                                 itself, since SearchEngine(records) is its
                                 constructor). If omitted, only records are
                                 refreshed.
        logger                : optional logger, reused for consistency.
        """
        self.dataset_dir = Path(dataset_dir)
        self.loader = loader
        self.search_engine_factory = search_engine_factory
        self.logger = logger

    # ------------------------------------------------------------------
    # Category folder listing
    # ------------------------------------------------------------------
    def get_categories(self) -> List[str]:
        """Every folder directly under dataset/, auto-detected - never
        hardcoded. Add a new folder and it shows up here automatically."""
        if not self.dataset_dir.exists():
            return []
        return sorted(p.name for p in self.dataset_dir.iterdir() if p.is_dir())

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------
    def validate_json(self, json_path: Path, selected_category: str) -> ValidationResult:
        """Runs the required checks in order:
        1. JSON syntax
        2. Required fields present
        3. Category matches the folder the user selected
        (Duplicate-ID and filename collisions are handled by
        get_next_id/generate_filename at import time rather than as a
        hard validation failure, since both are auto-resolved rather
        than rejected.)
        """
        # 1. JSON syntax / readability
        try:
            raw_text = json_path.read_text(encoding="utf-8")
        except OSError as exc:
            return ValidationResult(False, [f"Could not read file: {exc}"])

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            return ValidationResult(False, ["Invalid JSON format."])

        if isinstance(data, list):
            if not data:
                return ValidationResult(False, ["JSON file contains an empty list."])
            data = data[0]  # import one record at a time - first record in the file

        if not isinstance(data, dict):
            return ValidationResult(False, ["Invalid JSON format."])

        errors: List[str] = []

        # 2. Required fields
        for field_name in REQUIRED_FIELDS:
            if not data.get(field_name):
                errors.append(f"Missing required field: {field_name}")

        # 3. Category match - only enforced if the JSON specifies one
        json_category = str(data.get("category", "")).strip()
        if json_category and selected_category and json_category.lower() != selected_category.lower():
            errors.append("Selected category does not match imported category.")

        return ValidationResult(valid=not errors, errors=errors, data=data)

    # ------------------------------------------------------------------
    # ID generation
    # ------------------------------------------------------------------
    def get_next_id(self, category: str, incoming_id: str = "") -> str:
        """Always (highest existing number in the category folder) + 1.
        The incoming record's own number is ignored entirely - only its
        prefix letters might be reused if the folder is currently empty.
        Never reuses/overwrites an existing id.
        """
        folder = self.dataset_dir / category
        prefix = self._existing_prefix(folder) or self._derive_prefix(category, incoming_id)
        highest = self._highest_number(folder, prefix)
        return f"{prefix}-{highest + 1:03d}"

    @staticmethod
    def _derive_prefix(category: str, incoming_id: str) -> str:
        """Only used when the category folder has no existing ids to
        infer a prefix from. Prefers the incoming id's own prefix (e.g.
        'NET-001' -> 'NET'); falls back to the category name's letters."""
        match = re.match(r"^([A-Za-z]+)-\d+$", incoming_id or "")
        if match:
            return match.group(1).upper()
        letters = re.sub(r"[^A-Za-z]", "", category)
        return (letters[:3] or "GEN").upper()

    def _existing_prefix(self, folder: Path) -> str:
        """Find the id prefix already in use in this category folder
        (e.g. 'NET') by scanning existing JSON files' ids."""
        if not folder.exists():
            return ""
        for json_file in sorted(folder.glob("*.json")):
            for item in self._read_records(json_file):
                match = re.match(r"^([A-Za-z]+)-\d+$", str(item.get("id", "")))
                if match:
                    return match.group(1).upper()
        return ""

    def _highest_number(self, folder: Path, prefix: str) -> int:
        """Highest numeric suffix currently used for this prefix in the
        category folder. 0 if the folder/prefix has no records yet."""
        highest = 0
        if not folder.exists():
            return highest
        pattern = re.compile(rf"^{re.escape(prefix)}-(\d+)$", re.IGNORECASE)
        for json_file in sorted(folder.glob("*.json")):
            for item in self._read_records(json_file):
                match = pattern.match(str(item.get("id", "")))
                if match:
                    highest = max(highest, int(match.group(1)))
        return highest

    @staticmethod
    def _read_records(json_file: Path) -> List[dict]:
        """Read a JSON file and normalize it to a list of dicts,
        tolerating both single-object and array-format files, and
        silently skipping unreadable/corrupt files (they simply don't
        contribute to the id/number scan)."""
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return []
        items = data if isinstance(data, list) else [data]
        return [item for item in items if isinstance(item, dict)]

    # ------------------------------------------------------------------
    # Filename generation
    # ------------------------------------------------------------------
    def generate_filename(self, category: str, source_filename: str) -> str:
        """Never overwrites an existing file:
        printer_offline.json -> printer_offline_2.json -> ..._3.json
        """
        folder = self.dataset_dir / category
        stem = Path(source_filename).stem
        candidate = f"{stem}.json"
        if not (folder / candidate).exists():
            return candidate

        counter = 2
        while (folder / f"{stem}_{counter}.json").exists():
            counter += 1
        return f"{stem}_{counter}.json"

    # ------------------------------------------------------------------
    # Import
    # ------------------------------------------------------------------
    def import_dataset(self, json_path: Path, category: str) -> ImportResult:
        """Full import pipeline:
        1. Re-validate (defensive, even though the screen validates first)
        2. Assign a safe id (highest existing + 1, never overwrite)
        3. Assign a safe filename (never overwrite an existing file)
        4. Write into the category folder
        5. Refresh the dataset (reload_dataset)
        """
        result = self.validate_json(json_path, category)
        if not result.valid:
            raise ValueError("; ".join(result.errors) or "Invalid JSON format.")

        data = dict(result.data)  # copy - never mutate the source file's parsed dict in place
        incoming_id = str(data.get("id", ""))
        new_id = self.get_next_id(category, incoming_id)
        data["id"] = new_id
        data["category"] = category

        folder = self.dataset_dir / category
        folder.mkdir(parents=True, exist_ok=True)

        filename = self.generate_filename(category, json_path.name)
        destination = folder / filename
        destination.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

        if self.logger:
            self.logger.info(f"Imported {json_path.name} -> {destination} (id={new_id})")

        return ImportResult(
            problem=str(data.get("problem", "")),
            category=category,
            assigned_id=new_id,
            filename=filename,
        )

    # ------------------------------------------------------------------
    # Refresh - calls DatasetLoader/SearchEngine's existing public API
    # ------------------------------------------------------------------
    def reload_dataset(self):
        """Re-runs the existing DatasetLoader.load_all() and, if a
        search_engine_factory was supplied, rebuilds SearchEngine from
        the fresh records. Returns (records, search_engine_or_None) so
        the caller (ImportDatasetScreen) can update app-level state."""
        records = self.loader.load_all()
        search_engine = self.search_engine_factory(records) if self.search_engine_factory else None
        return records, search_engine