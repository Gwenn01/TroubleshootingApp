import type { TroubleshootingRecord } from "../../../services/DatasetLoader";

export type DatasetStats = {
  totalRecords: number;
  categoriesLoaded: Record<string, number>;
};

/**
 * Mirrors what DatasetLoader.categoriesLoaded already tracks during
 * loadAll(), but computed from a records array — useful in the RN app,
 * where records arrive pre-loaded (bundled JSON) rather than via a live
 * filesystem walk.
 */
export function computeDatasetStats(
  records: TroubleshootingRecord[],
): DatasetStats {
  const categoriesLoaded: Record<string, number> = {};

  for (const record of records) {
    const category = record.category || "Uncategorized";
    categoriesLoaded[category] = (categoriesLoaded[category] ?? 0) + 1;
  }

  return { totalRecords: records.length, categoriesLoaded };
}
