/**
 * SearchEngine.ts
 * ----------------
 * TypeScript port of the Python search_engine.py. Fuzzy-matches a user's
 * natural-language problem description against every loaded
 * TroubleshootingRecord, using `fuzzball` (a JS implementation of the same
 * token_set_ratio algorithm RapidFuzz/FuzzyWuzzy use).
 *
 * Design note (future AI integration):
 * This module's entire public contract is `search(query) -> SearchResult[]`.
 * It has no idea how results get displayed. When an on-device model is
 * introduced, it will sit between this module and the UI: it will take the
 * top SearchResult(s) as grounding context and generate a natural-language
 * response. Because this file doesn't know or care about rendering, none
 * of this code needs to change when that happens.
 *
 * Install: npm install fuzzball
 */

import * as fuzzball from "fuzzball";
import type { TroubleshootingRecord } from "./DatasetLoader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  record: TroubleshootingRecord;
  score: number;
  matchedField: string;
}

type CandidateField =
  "problem" | "keywords" | "symptoms" | "description" | "relatedProblems";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FIELD_WEIGHTS: Record<CandidateField, number> = {
  problem: 1.0,
  keywords: 1.0,
  symptoms: 0.8,
  description: 0.6,
  relatedProblems: 0.5,
};

const ID_PATTERN = /^[A-Za-z]{2,6}-\d{2,4}$/;

function looksLikeId(value: string): boolean {
  return ID_PATTERN.test(value.trim());
}

// ---------------------------------------------------------------------------
// Text normalization helpers
// (inferred equivalents of utils.utils.normalize_text / strip_search_stopwords
// — swap these for your real implementations if they differ)
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "my",
  "i",
  "im",
  "it",
  "its",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "and",
  "or",
  "but",
  "not",
  "no",
  "do",
  "does",
  "did",
  "can",
  "cant",
  "cannot",
  "could",
  "will",
  "wont",
  "would",
  "should",
  "this",
  "that",
  "these",
  "those",
  "please",
  "help",
  "me",
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripSearchStopwords(value: string): string {
  return value
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Search engine
// ---------------------------------------------------------------------------

export class SearchEngine {
  private readonly records: TroubleshootingRecord[];
  private readonly recordTokens: Map<TroubleshootingRecord, Set<string>>;

  constructor(records: TroubleshootingRecord[]) {
    this.records = records;

    // JS Map keys objects by reference, same role Python's id(record)
    // plays as a stand-in for a hashable-but-unique record identifier.
    this.recordTokens = new Map(
      records.map((record) => [record, SearchEngine.buildTokenSet(record)]),
    );
  }

  private static buildTokenSet(record: TroubleshootingRecord): Set<string> {
    const parts = [
      record.problem,
      record.description,
      ...record.keywords,
      ...record.symptoms,
    ];
    const combined = parts.join(" ");
    const cleaned = stripSearchStopwords(normalizeText(combined));
    return new Set(cleaned.split(" ").filter(Boolean));
  }

  /**
   * Compares the query against every record's problem, keywords, symptoms,
   * description, and relatedProblems fields, keeps the single
   * best-scoring (weighted) field per record, and returns the topN
   * records ranked by that score, descending. Ties are broken by which
   * record shares more of the query's actual words overall (see
   * buildTokenSet).
   *
   * minScore filters out weak/irrelevant matches so the user isn't shown
   * something unrelated just because it was the "best" of a bad set of
   * candidates. It's compared against the RAW (unweighted) match
   * percentage, so it means the same thing regardless of which field
   * produced the best match.
   */
  search(query: string, topN = 5, minScore = 50.0): SearchResult[] {
    const normalizedQuery = stripSearchStopwords(normalizeText(query));
    if (!normalizedQuery) return [];

    const queryTokens = new Set(normalizedQuery.split(" ").filter(Boolean));
    const scored: Array<{ result: SearchResult; overlap: number }> = [];

    for (const record of this.records) {
      const { bestWeighted, bestRaw, bestField } = this.bestFieldScore(
        normalizedQuery,
        record,
      );

      if (bestRaw >= minScore) {
        const tokens = this.recordTokens.get(record) ?? new Set<string>();
        const overlap = [...queryTokens].filter((token) =>
          tokens.has(token),
        ).length;

        scored.push({
          result: { record, score: bestWeighted, matchedField: bestField },
          overlap,
        });
      }
    }

    scored.sort((a, b) => {
      if (b.result.score !== a.result.score)
        return b.result.score - a.result.score;
      return b.overlap - a.overlap;
    });

    return scored.slice(0, topN).map((entry) => entry.result);
  }

  /**
   * Scores the query against each candidate field of a single record and
   * returns the strongest weighted match found on that record.
   *
   * bestRaw is what should be checked against minScore.
   * bestWeighted is what should be used for ranking/display.
   */
  private bestFieldScore(
    normalizedQuery: string,
    record: TroubleshootingRecord,
  ): { bestWeighted: number; bestRaw: number; bestField: string } {
    const candidates: Record<CandidateField, string[]> = {
      problem: [record.problem],
      keywords: record.keywords,
      symptoms: record.symptoms,
      description: [record.description],
      relatedProblems: record.relatedProblems,
    };

    let bestWeighted = 0;
    let bestRaw = 0;
    let bestField: string = "problem";

    for (const fieldName of Object.keys(candidates) as CandidateField[]) {
      const weight = FIELD_WEIGHTS[fieldName] ?? 0.5;

      for (const value of candidates[fieldName]) {
        if (fieldName === "relatedProblems" && looksLikeId(value)) {
          continue;
        }

        const normalizedValue = stripSearchStopwords(normalizeText(value));
        if (!normalizedValue) continue;

        // token_set_ratio handles word-order differences and partial
        // phrase overlap well, e.g. "wifi won't connect" scoring highly
        // against "cannot connect to wifi network".
        const rawScore = fuzzball.token_set_ratio(
          normalizedQuery,
          normalizedValue,
        );
        const weightedScore = rawScore * weight;

        if (weightedScore > bestWeighted) {
          bestWeighted = weightedScore;
          bestRaw = rawScore;
          bestField = fieldName;
        }
      }
    }

    return { bestWeighted, bestRaw, bestField };
  }
}
