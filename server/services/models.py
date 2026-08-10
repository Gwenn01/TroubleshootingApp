"""
models.py
---------
Defines the data structures (dataclasses) used throughout the IT Help Desk
Assistant. Keeping these definitions centralized guarantees that the
dataset loader, search engine, and display layer all agree on the exact
same shape of data - which matters a lot once the AI layer (Phi-3 Mini)
is plugged in later and needs to consume the same objects without any
of this code changing.
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional


@dataclass
class CommandEntry:
    """Represents a single diagnostic/fix command associated with a record."""
    command: str = ""
    purpose: str = ""
    expected_result: str = ""
    abnormal_result: str = ""


@dataclass
class TroubleshootingStep:
    """Represents one ordered step in a troubleshooting procedure."""
    step: int = 0
    action: str = ""
    reason: str = ""


@dataclass
class TroubleshootingRecord:
    """
    Represents a single troubleshooting topic loaded from one JSON file
    in the dataset/ folder (e.g. dataset/windows/WIN-001.json).
    """
    id: str = ""
    category: str = ""
    subcategory: str = ""
    problem: str = ""
    description: str = ""

    symptoms: List[str] = field(default_factory=list)
    possible_causes: List[str] = field(default_factory=list)
    diagnostic_questions: List[str] = field(default_factory=list)
    commands: List[CommandEntry] = field(default_factory=list)
    troubleshooting_steps: List[TroubleshootingStep] = field(default_factory=list)
    possible_solutions: List[str] = field(default_factory=list)
    prevention: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)

    difficulty: str = ""
    estimated_fix_time: str = ""
    related_problems: List[str] = field(default_factory=list)

    # Not part of the JSON schema itself - populated by the loader so that
    # log messages and future debugging can trace a record back to disk.
    source_file: Optional[Path] = None


@dataclass
class SearchResult:
    """
    Wraps a TroubleshootingRecord together with the fuzzy-match score that
    produced it, plus which field contributed the best match. This is the
    object that flows from SearchEngine -> (future AI layer) -> Display,
    so it is the "contract" between search and presentation.
    """
    record: TroubleshootingRecord
    score: float
    matched_field: str
