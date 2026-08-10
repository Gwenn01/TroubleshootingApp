"""
category.py
------------
Responsible ONLY for scanning the dataset directory and organizing
TroubleshootingRecords into a navigable tree:

    Folder -> Category -> Subcategory -> [Records]

No hardcoded folder/category names anywhere. Whatever exists on disk
under dataset/ is what shows up. Drop in a new "erp/" folder full of
JSON files tomorrow and it appears in Browse automatically.

Actual JSON parsing is fully delegated to DatasetLoader (via
load_folder), so this module never touches raw JSON - it only groups
already-parsed TroubleshootingRecord objects.
"""

from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Dict, List

from services.dataset_loader import DatasetLoader
from services.models import TroubleshootingRecord


class DatasetCatalog:
    """Builds and holds the folder -> category -> subcategory -> records tree."""

    def __init__(self, dataset_dir: Path, loader: DatasetLoader, logger=None):
        """
        dataset_dir : path to the top-level "dataset" folder.
        loader      : your existing DatasetLoader. Reused here for all
                      JSON parsing (loader.load_folder) so parsing logic
                      lives in exactly one place in the codebase.
        logger      : optional logger, reused for consistency.
        """
        self.dataset_dir = Path(dataset_dir)
        self.loader = loader
        self.logger = logger or getattr(loader, "logger", None)

        # folder_name -> category -> subcategory -> [records]
        self.tree: Dict[str, Dict[str, Dict[str, List[TroubleshootingRecord]]]] = {}

        self._build()

    # ------------------------------------------------------------------
    # Building the tree
    # ------------------------------------------------------------------
    def _build(self) -> None:
        """Scan every folder directly under dataset/ and build the tree.
        Any directory found here becomes a top-level Browse entry."""
        if not self.dataset_dir.exists():
            if self.logger:
                self.logger.warning(f"Dataset dir not found: {self.dataset_dir}")
            return

        for folder in sorted(p for p in self.dataset_dir.iterdir() if p.is_dir()):
            records = self.loader.load_folder(folder)
            if records:
                self.tree[folder.name] = self._group_records(records)

    @staticmethod
    def _group_records(
        records: List[TroubleshootingRecord],
    ) -> Dict[str, Dict[str, List[TroubleshootingRecord]]]:
        """Group a flat list of records into category -> subcategory -> [records]."""
        grouped: Dict[str, Dict[str, List[TroubleshootingRecord]]] = defaultdict(
            lambda: defaultdict(list)
        )
        for record in records:
            category = (record.category or "Uncategorized").strip()
            subcategory = (record.subcategory or "").strip()
            grouped[category][subcategory].append(record)
        return {cat: dict(subs) for cat, subs in grouped.items()}

    # ------------------------------------------------------------------
    # Public accessors used by browse.py
    # ------------------------------------------------------------------
    def folder_names(self) -> List[str]:
        """Top-level Browse entries (raw folder names, e.g. 'keyboard_mouse')."""
        return sorted(self.tree.keys())

    def categories(self, folder: str) -> List[str]:
        return sorted(self.tree.get(folder, {}).keys())

    def subcategories(self, folder: str, category: str) -> List[str]:
        return sorted(s for s in self.tree.get(folder, {}).get(category, {}).keys() if s)

    def records(self, folder: str, category: str, subcategory: str) -> List[TroubleshootingRecord]:
        return self.tree.get(folder, {}).get(category, {}).get(subcategory, [])