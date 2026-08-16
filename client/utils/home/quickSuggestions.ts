import type { Ionicons } from "@expo/vector-icons";
import type { TroubleshootingRecord } from "../../services/general/DatasetLoader";
import type { QuickSuggestion } from "../../types/chat";

// Known dataset folder names -> icon. Anything not listed here falls back
// to DEFAULT_ICON, so new folders (e.g. an "erp/" you drop in later) still
// work without code changes — just without a tailored icon.
const CATEGORY_ICONS: Partial<Record<string, keyof typeof Ionicons.glyphMap>> =
  {
    networking: "wifi-outline",
    printer: "print-outline",
    shared_folder: "folder-open-outline",
    lotus_notes: "mail-outline",
    microsoft_office: "document-text-outline",
    hardware: "hardware-chip-outline",
    software: "apps-outline",
    system: "settings-outline",
    windows: "logo-windows",
    keyboard_mouse: "keypad-outline",
    drivers: "construct-outline",
    general: "help-circle-outline",
  };

const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = "help-circle-outline";

function iconForCategory(category: string): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[category.toLowerCase()] ?? DEFAULT_ICON;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Fisher-Yates shuffle — doesn't mutate the input array. */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Groups records by category so a random one can be picked from each
 * group. Records with an empty `problem` are dropped up front, same as
 * the previous implementation's `if (!record.problem) continue;`.
 */
function groupByCategory(
  records: TroubleshootingRecord[],
): Map<string, TroubleshootingRecord[]> {
  const grouped = new Map<string, TroubleshootingRecord[]>();

  for (const record of records) {
    if (!record.problem) continue;

    const existing = grouped.get(record.category);
    if (existing) {
      existing.push(record);
    } else {
      grouped.set(record.category, [record]);
    }
  }

  return grouped;
}

/**
 * Picks one RANDOM record per category (one chip per category, so the
 * row stays diverse rather than clustering on whichever category has the
 * most entries), capped at `limit` chips total.
 *
 * `excludeIds` — record ids currently on screen. When a category has a
 * record NOT in that set, one of those unused records is preferred, so
 * pressing Refresh avoids repeating what's already showing. If every
 * record in a category is currently excluded (e.g. it only has one
 * record total), that category falls back to picking from all of its
 * records anyway — repeating is unavoidable there, per requirement 9.
 *
 * The category iteration order is shuffled, and the final suggestion
 * list is shuffled again, so neither the categories nor the chips
 * appear in a fixed order across calls.
 */
export function buildQuickSuggestions(
  records: TroubleshootingRecord[],
  limit = 15,
  excludeIds: Set<string> = new Set(),
): QuickSuggestion[] {
  const grouped = groupByCategory(records);
  const categories = shuffle([...grouped.keys()]);

  const suggestions: QuickSuggestion[] = [];

  for (const category of categories) {
    if (suggestions.length >= limit) break;

    const categoryRecords = grouped.get(category)!;
    const unused = categoryRecords.filter((r) => !excludeIds.has(r.id));
    const pool = unused.length > 0 ? unused : categoryRecords;

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    suggestions.push({
      id: chosen.id,
      label: truncate(chosen.problem, 26),
      prompt: chosen.problem,
      icon: iconForCategory(chosen.category),
    });
  }

  return shuffle(suggestions);
}
