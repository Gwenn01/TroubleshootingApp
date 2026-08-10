"""
search_engine.py
-----------------
Fuzzy-matches a user's natural-language problem description against every
loaded TroubleshootingRecord using RapidFuzz.

Design note (future AI integration):
This module's entire public contract is `search(query) -> List[SearchResult]`.
It has no idea how results get displayed. Later, when Phi-3 Mini is
introduced, it will sit *between* this module and display.py: it will
take the top SearchResult(s) as grounding context and generate a
natural-language response. Because this file doesn't know or care about
Rich, the console, or presentation at all, none of this code needs to
change when that happens.
"""

import re
from typing import Dict, List, Set, Tuple

from rapidfuzz import fuzz

from services.models import SearchResult, TroubleshootingRecord
from utils.utils import normalize_text, strip_search_stopwords

FIELD_WEIGHTS = {
    "problem": 1.0,
    "keywords": 1.0,
    "symptoms": 0.8,
    "description": 0.6,
    "related_problems": 0.5,
}

_ID_PATTERN = re.compile(r"^[A-Za-z]{2,6}-\d{2,4}$")


def _looks_like_id(value: str) -> bool:
    return bool(_ID_PATTERN.fullmatch(value.strip()))


class SearchEngine:
    """Performs fuzzy searches across all loaded troubleshooting records."""

    def __init__(self, records: List[TroubleshootingRecord]):
        self.records = records
       
        self._record_tokens: Dict[int, Set[str]] = {
            id(record): self._build_token_set(record) for record in records
        }

    @staticmethod
    def _build_token_set(record: TroubleshootingRecord) -> Set[str]:
        parts = [record.problem, record.description] + list(record.keywords) + list(record.symptoms)
        combined = " ".join(parts)
        return set(strip_search_stopwords(normalize_text(combined)).split())

    def search(self, query: str, top_n: int = 5, min_score: float = 50.0) -> List[SearchResult]:
        """
        Compares the query against every record's problem, keywords,
        symptoms, description, and related_problems fields, keeps the
        single best-scoring (weighted) field per record, and returns the
        top_n records ranked by that score, descending. Records that tie
        on score are broken by which one shares more of the query's actual
        words overall (see _build_token_set).

        min_score filters out weak/irrelevant matches so the user isn't
        shown something unrelated just because it was the "best" of a
        bad set of candidates. It is compared against the RAW (unweighted)
        match percentage, so it means the same thing regardless of which
        field produced the best match.
        """
        normalized_query = strip_search_stopwords(normalize_text(query))
        if not normalized_query:
            return []

        query_tokens = set(normalized_query.split())
        scored: List[Tuple[SearchResult, int]] = []

        for record in self.records:
            best_weighted, best_raw, best_field = self._best_field_score(normalized_query, record)
            if best_raw >= min_score:
                overlap = len(query_tokens & self._record_tokens.get(id(record), set()))
                result = SearchResult(record=record, score=best_weighted, matched_field=best_field)
                scored.append((result, overlap))

        scored.sort(key=lambda pair: (pair[0].score, pair[1]), reverse=True)
        return [result for result, _overlap in scored[:top_n]]

    def _best_field_score(
        self, normalized_query: str, record: TroubleshootingRecord
    ) -> Tuple[float, float, str]:
        """
        Scores the query against each candidate field of a single record
        and returns (best_weighted_score, best_raw_score, field_name) for
        the strongest weighted match found on that record.

        best_raw_score is what should be checked against min_score.
        best_weighted_score is what should be used for ranking/display.
        """
        candidates = {
            "problem": [record.problem],
            "keywords": record.keywords,
            "symptoms": record.symptoms,
            "description": [record.description],
            "related_problems": record.related_problems,
        }

        best_weighted = 0.0
        best_raw = 0.0
        best_field = "problem"

        for field_name, values in candidates.items():
            weight = FIELD_WEIGHTS.get(field_name, 0.5)
            for value in values:
                if field_name == "related_problems" and _looks_like_id(value):
                    continue

                normalized_value = strip_search_stopwords(normalize_text(value))
                if not normalized_value:
                    continue

                # token_set_ratio handles word-order differences and partial
                # phrase overlap well, e.g. "wifi won't connect" scoring
                # highly against "cannot connect to wifi network".
                raw_score = fuzz.token_set_ratio(normalized_query, normalized_value)
                weighted_score = raw_score * weight

                if weighted_score > best_weighted:
                    best_weighted = weighted_score
                    best_raw = raw_score
                    best_field = field_name

        return best_weighted, best_raw, best_field