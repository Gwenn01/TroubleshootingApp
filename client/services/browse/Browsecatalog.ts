import type { TroubleshootingRecord } from "../general/DatasetLoader";

export type BrowseCatalog = Map<string, Map<string, TroubleshootingRecord[]>>;

export type CategorySummary = {
  name: string;
  guideCount: number;
};

export type SubcategorySummary = {
  name: string;
  guideCount: number;
};

/**
 * Groups the already-loaded records array into category -> subcategory
 * -> records. Mirrors what services/DatasetCatalog.ts does — but that
 * one needs Node's `fs` to walk your dataset folders, so it can only run
 * as a build-time/Termux script, never inside the app itself. This is
 * the RN-safe equivalent for the Browse screen: pure in-memory grouping
 * over the records you've already bundled via buildDataset.ts, using
 * exactly the category/subcategory fields DatasetLoader already parsed.
 *
 * Nothing here is hardcoded — any category or subcategory value present
 * in the dataset shows up automatically, including ones added later.
 */
export function buildBrowseCatalog(
  records: TroubleshootingRecord[],
): BrowseCatalog {
  const catalog: BrowseCatalog = new Map();

  for (const record of records) {
    const category = (record.category || "Uncategorized").trim();
    const subcategory = (record.subcategory || "General").trim();

    if (!catalog.has(category)) catalog.set(category, new Map());
    const subMap = catalog.get(category)!;

    if (!subMap.has(subcategory)) subMap.set(subcategory, []);
    subMap.get(subcategory)!.push(record);
  }

  return catalog;
}

export function listCategories(catalog: BrowseCatalog): CategorySummary[] {
  return [...catalog.entries()]
    .map(([name, subMap]) => ({
      name,
      guideCount: [...subMap.values()].reduce(
        (sum, records) => sum + records.length,
        0,
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listSubcategories(
  catalog: BrowseCatalog,
  category: string,
): SubcategorySummary[] {
  const subMap = catalog.get(category);
  if (!subMap) return [];

  return [...subMap.entries()]
    .map(([name, records]) => ({ name, guideCount: records.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listProblems(
  catalog: BrowseCatalog,
  category: string,
  subcategory: string,
): TroubleshootingRecord[] {
  return catalog.get(category)?.get(subcategory) ?? [];
}

/**
 * Case-insensitive substring filters for the Browse search bar. This is
 * intentionally NOT SearchEngine's fuzzy token-set scoring — that's for
 * "find the best answer to a natural-language question" in chat. This
 * is a plain list filter, the same job a Ctrl+F would do while browsing.
 */
export function filterCategories(
  categories: CategorySummary[],
  query: string,
): CategorySummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter((c) => c.name.toLowerCase().includes(q));
}

export function filterSubcategories(
  subcategories: SubcategorySummary[],
  query: string,
): SubcategorySummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return subcategories;
  return subcategories.filter((s) => s.name.toLowerCase().includes(q));
}

export function filterProblems(
  records: TroubleshootingRecord[],
  query: string,
): TroubleshootingRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return records;
  return records.filter(
    (r) =>
      r.problem.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}
