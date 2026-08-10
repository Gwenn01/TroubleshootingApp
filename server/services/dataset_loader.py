import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

from services.models import CommandEntry, TroubleshootingRecord, TroubleshootingStep
from utils.utils import flatten_list_field, safe_get


class DatasetLoader:
    """Loads all troubleshooting JSON records from the dataset directory."""

    def __init__(self, dataset_path: Path, logger: Optional[logging.Logger] = None):
        self.dataset_path = dataset_path
        self.logger = logger or logging.getLogger("helpdesk")

        # category_name -> count of records loaded, populated by load_all().
        # Used to build the "Loaded:" list on the welcome screen.
        self.categories_loaded: Dict[str, int] = {}

        # Debug bookkeeping: which files failed to load and why, so you
        # can see at a glance if something silently didn't make it in.
        self.skipped_files: List[Dict[str, str]] = []

    def load_all(self) -> List[TroubleshootingRecord]:
        """
        Walks dataset_path recursively (using pathlib's rglob) and attempts
        to parse every .json file found. Returns the list of successfully
        parsed records; anything that fails is logged and skipped.
        """
        records: List[TroubleshootingRecord] = []
        self.skipped_files = []

        if not self.dataset_path.exists():
            self.logger.error(f"Dataset path does not exist: {self.dataset_path}")
            return records

        json_files = sorted(self.dataset_path.rglob("*.json"))
        print(f"Found {len(json_files)} JSON file(s) in {self.dataset_path}")

        for json_file in json_files:
            relative_path = json_file.relative_to(self.dataset_path)
            file_records = self.load_file(json_file)
            print(f"Reading: {relative_path} -> {len(file_records)} record(s)")

            for record in file_records:
                records.append(record)
                category_name = record.category or json_file.parent.name
                self.categories_loaded[category_name] = (
                    self.categories_loaded.get(category_name, 0) + 1
                )

        print(f"Loaded {len(records)} records from {len(json_files)} files")
        if self.skipped_files:
            print(f"{len(self.skipped_files)} error(s):")
            for entry in self.skipped_files:
                print(f"  {entry['file']}: {entry['reason']}")

        return records

    # ------------------------------------------------------------------
    # Folder-aware loading, used by Browse (category.py -> DatasetCatalog).
    # ------------------------------------------------------------------
    def load_folder(self, folder: Path) -> List[TroubleshootingRecord]:
        """
        Loads every .json file directly inside a single top-level dataset
        folder (non-recursive - one level, e.g. dataset/networking/).
        Reuses load_file() per file so parsing logic stays in one place,
        and records the same skipped-file bookkeeping load_all() uses.
        """
        records: List[TroubleshootingRecord] = []

        if not folder.exists() or not folder.is_dir():
            self.logger.warning(f"Folder does not exist: {folder}")
            return records

        for json_file in sorted(folder.glob("*.json")):
            records.extend(self.load_file(json_file))

        return records

    def load_file(self, json_file: Path) -> List[TroubleshootingRecord]:
        """
        Public entry point for parsing a single JSON file into a list of
        TroubleshootingRecords. This is the same logic load_all() uses
        per-file, just exposed so other parts of the app (Browse) can
        parse one file/folder at a time without re-walking the whole
        dataset.

        A file can contain either:
          - a JSON array of record objects, e.g. [ {...}, {...}, ... ]
          - a single JSON object, e.g. { ... }
        Any individual bad record inside an array is skipped without
        losing the rest of the file. Returns an empty list (and logs a
        warning) if the file can't be read or isn't valid JSON.
        """
        try:
            raw_text = json_file.read_text(encoding="utf-8")
        except OSError as exc:
            self.logger.warning(f"Could not read {json_file}: {exc}")
            self.skipped_files.append({"file": str(json_file), "reason": f"read error: {exc}"})
            return []

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            self.logger.warning(f"Skipping corrupted JSON {json_file}: {exc}")
            self.skipped_files.append({"file": str(json_file), "reason": f"invalid JSON: {exc}"})
            return []

        # Normalize to a list of dicts, whether the file held a single
        # object or an array of objects.
        if isinstance(data, dict):
            raw_items = [data]
        elif isinstance(data, list):
            raw_items = data
        else:
            self.logger.warning(
                f"Skipping {json_file}: root JSON element is neither an object nor an array"
            )
            self.skipped_files.append(
                {"file": str(json_file), "reason": "root element is not an object or array"}
            )
            return []

        records: List[TroubleshootingRecord] = []
        for index, item in enumerate(raw_items):
            if not isinstance(item, dict):
                self.logger.warning(
                    f"Skipping item {index} in {json_file}: not a JSON object"
                )
                self.skipped_files.append(
                    {"file": f"{json_file} [item {index}]", "reason": "item is not an object"}
                )
                continue

            try:
                records.append(self._parse_record(item, json_file))
            except Exception as exc:  # noqa: BLE001 - one bad record must never crash the app
                self.logger.warning(f"Skipping malformed item {index} in {json_file}: {exc}")
                self.skipped_files.append(
                    {"file": f"{json_file} [item {index}]", "reason": f"parse error: {exc}"}
                )

        return records

    # Kept as a thin alias so any existing internal callers of the old
    # private name still work without edits elsewhere in the codebase.
    def _load_single_file(self, json_file: Path) -> List[TroubleshootingRecord]:
        return self.load_file(json_file)

    def _parse_record(self, data: dict, source_file: Path) -> TroubleshootingRecord:
        """
        Converts a raw JSON dict into a TroubleshootingRecord. Falls back
        to the parent folder name for 'category' if it's missing, and
        coerces malformed fields to safe defaults rather than raising -
        e.g. if 'symptoms' was written as a string instead of a list.
        """
        default_category = source_file.parent.name

        commands = [
            CommandEntry(
                command=safe_get(cmd, "command", ""),
                purpose=safe_get(cmd, "purpose", ""),
                expected_result=safe_get(cmd, "expected_result", ""),
                abnormal_result=safe_get(cmd, "abnormal_result", ""),
            )
            for cmd in data.get("commands", [])
            if isinstance(cmd, dict)
        ]

        steps = [
            TroubleshootingStep(
                step=step.get("step", index + 1) if isinstance(step, dict) else index + 1,
                action=safe_get(step, "action", "") if isinstance(step, dict) else "",
                reason=safe_get(step, "reason", "") if isinstance(step, dict) else "",
            )
            for index, step in enumerate(data.get("troubleshooting_steps", []))
        ]

        record = TroubleshootingRecord(
            id=safe_get(data, "id", source_file.stem),
            category=safe_get(data, "category", default_category),
            subcategory=safe_get(data, "subcategory", ""),
            problem=safe_get(data, "problem", ""),
            description=safe_get(data, "description", ""),
            symptoms=flatten_list_field(data.get("symptoms", [])),
            possible_causes=flatten_list_field(data.get("possible_causes", [])),
            diagnostic_questions=flatten_list_field(data.get("diagnostic_questions", [])),
            commands=commands,
            troubleshooting_steps=steps,
            possible_solutions=flatten_list_field(data.get("possible_solutions", [])),
            prevention=flatten_list_field(data.get("prevention", [])),
            keywords=flatten_list_field(data.get("keywords", [])),
            difficulty=safe_get(data, "difficulty", ""),
            estimated_fix_time=safe_get(data, "estimated_fix_time", ""),
            related_problems=flatten_list_field(data.get("related_problems", [])),
            source_file=source_file,
        )

        return record