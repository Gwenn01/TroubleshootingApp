/**
 * DatasetCatalog.ts
 * ------------------
 * TypeScript port of the Python category.py. Responsible ONLY for
 * scanning the dataset directory and organizing TroubleshootingRecords
 * into a navigable tree:
 *
 *     Folder -> Category -> Subcategory -> Records[]
 *
 * No hardcoded folder/category names anywhere. Whatever exists on disk
 * under dataset/ is what shows up. Drop in a new "erp/" folder full of
 * JSON files tomorrow and it appears in Browse automatically.
 *
 * Actual JSON parsing is fully delegated to DatasetLoader (via
 * loadFolder), so this module never touches raw JSON - it only groups
 * already-parsed TroubleshootingRecord objects.
 *
 * Like DatasetLoader, this reads real directories (fs.readdirSync), so
 * it's a Node/Termux-side module, not something that runs inside the
 * React Native runtime as-is.
 */

import fs from "fs";
import path from "path";
import {
  DatasetLoader,
  Logger,
  TroubleshootingRecord,
} from "../general/DatasetLoader";

// folder -> category -> subcategory -> records
type CatalogTree = Record<
  string,
  Record<string, Record<string, TroubleshootingRecord[]>>
>;

export class DatasetCatalog {
  private readonly datasetDir: string;
  private readonly loader: DatasetLoader;
  private readonly logger?: Logger;

  /** folder -> category -> subcategory -> [records] */
  tree: CatalogTree = {};

  /**
   * @param datasetDir path to the top-level "dataset" folder.
   * @param loader your existing DatasetLoader. Reused here for all JSON
   *   parsing (loader.loadFolder) so parsing logic lives in exactly one
   *   place in the codebase.
   * @param logger optional logger, reused for consistency.
   */
  constructor(datasetDir: string, loader: DatasetLoader, logger?: Logger) {
    this.datasetDir = datasetDir;
    this.loader = loader;
    this.logger = logger;

    this.build();
  }

  // ---------------------------------------------------------------------
  // Building the tree
  // ---------------------------------------------------------------------

  /**
   * Scan every folder directly under dataset/ and build the tree. Any
   * directory found here becomes a top-level Browse entry.
   */
  private build(): void {
    if (!fs.existsSync(this.datasetDir)) {
      this.logger?.warn(`Dataset dir not found: ${this.datasetDir}`);
      return;
    }

    const folders = fs
      .readdirSync(this.datasetDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const folderName of folders) {
      const folderPath = path.join(this.datasetDir, folderName);
      const records = this.loader.loadFolder(folderPath);
      if (records.length > 0) {
        this.tree[folderName] = DatasetCatalog.groupRecords(records);
      }
    }
  }

  /** Group a flat list of records into category -> subcategory -> [records]. */
  private static groupRecords(
    records: TroubleshootingRecord[],
  ): Record<string, Record<string, TroubleshootingRecord[]>> {
    const grouped: Record<string, Record<string, TroubleshootingRecord[]>> = {};

    for (const record of records) {
      const category = (record.category || "Uncategorized").trim();
      const subcategory = (record.subcategory || "").trim();

      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][subcategory]) grouped[category][subcategory] = [];

      grouped[category][subcategory].push(record);
    }

    return grouped;
  }

  // ---------------------------------------------------------------------
  // Public accessors used by Browse
  // ---------------------------------------------------------------------

  /** Top-level Browse entries (raw folder names, e.g. 'keyboard_mouse'). */
  folderNames(): string[] {
    return Object.keys(this.tree).sort();
  }

  categories(folder: string): string[] {
    return Object.keys(this.tree[folder] ?? {}).sort();
  }

  subcategories(folder: string, category: string): string[] {
    return Object.keys(this.tree[folder]?.[category] ?? {})
      .filter((subcategory) => subcategory !== "")
      .sort();
  }

  records(
    folder: string,
    category: string,
    subcategory: string,
  ): TroubleshootingRecord[] {
    return this.tree[folder]?.[category]?.[subcategory] ?? [];
  }
}
