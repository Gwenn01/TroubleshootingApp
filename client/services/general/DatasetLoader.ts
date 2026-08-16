import fs from "fs";
import path from "path";

/**
 * DatasetLoader
 * -------------
 * TypeScript port of the Python DatasetLoader used by the Textual TUI app.
 * Kept as a single self-contained module (types + helpers + class) rather
 * than split across files, since this is meant to run as a Node/Termux
 * script (via ts-node/tsx) the same way the Python version does — it needs
 * real filesystem access (readdir/readFile), which React Native's runtime
 * does not have. See the bottom of this file for the RN-runtime note.
 */

// ---------------------------------------------------------------------------
// Types (equivalent to services.models)
// ---------------------------------------------------------------------------

export interface CommandEntry {
  command: string;
  purpose: string;
  expectedResult: string;
  abnormalResult: string;
}

export interface TroubleshootingStep {
  step: number;
  action: string;
  reason: string;
}

export interface TroubleshootingRecord {
  id: string;
  category: string;
  subcategory: string;
  problem: string;
  description: string;
  symptoms: string[];
  possibleCauses: string[];
  diagnosticQuestions: string[];
  commands: CommandEntry[];
  troubleshootingSteps: TroubleshootingStep[];
  possibleSolutions: string[];
  prevention: string[];
  keywords: string[];
  difficulty: string;
  estimatedFixTime: string;
  relatedProblems: string[];
  sourceFile: string;
}

interface SkippedFile {
  file: string;
  reason: string;
}

// Minimal logger shape so callers can pass console, a custom logger, or
// nothing at all (defaults to console).
export interface Logger {
  warn: (message: string) => void;
  error: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export class DatasetLoader {
  private readonly datasetPath: string;
  private readonly logger: Logger;

  /** category name -> count of records loaded, populated by loadAll(). */
  categoriesLoaded: Record<string, number> = {};

  /** Which files/items failed to parse and why. */
  skippedFiles: SkippedFile[] = [];

  constructor(datasetPath: string, logger: Logger = console) {
    this.datasetPath = datasetPath;
    this.logger = logger;
  }

  /**
   * Recursively walks datasetPath (equivalent to pathlib's rglob) and
   * parses every .json file found. Returns all successfully parsed
   * records; anything that fails is logged and skipped.
   */
  loadAll(): TroubleshootingRecord[] {
    const records: TroubleshootingRecord[] = [];
    this.skippedFiles = [];

    if (!fs.existsSync(this.datasetPath)) {
      this.logger.error(`Dataset path does not exist: ${this.datasetPath}`);
      return records;
    }

    const jsonFiles = this.findJsonFilesRecursive(this.datasetPath).sort();
    console.log(
      `Found ${jsonFiles.length} JSON file(s) in ${this.datasetPath}`,
    );

    for (const jsonFile of jsonFiles) {
      const relativePath = path.relative(this.datasetPath, jsonFile);
      const fileRecords = this.loadFile(jsonFile);
      console.log(
        `Reading: ${relativePath} -> ${fileRecords.length} record(s)`,
      );

      for (const record of fileRecords) {
        records.push(record);
        const categoryName =
          record.category || path.basename(path.dirname(jsonFile));
        this.categoriesLoaded[categoryName] =
          (this.categoriesLoaded[categoryName] ?? 0) + 1;
      }
    }

    console.log(
      `Loaded ${records.length} records from ${jsonFiles.length} files`,
    );
    if (this.skippedFiles.length > 0) {
      console.log(`${this.skippedFiles.length} error(s):`);
      for (const entry of this.skippedFiles) {
        console.log(`  ${entry.file}: ${entry.reason}`);
      }
    }

    return records;
  }

  /**
   * Loads every .json file directly inside a single top-level dataset
   * folder (non-recursive - one level, e.g. dataset/networking/).
   * Used by Browse.
   */
  loadFolder(folder: string): TroubleshootingRecord[] {
    const records: TroubleshootingRecord[] = [];

    if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
      this.logger.warn(`Folder does not exist: ${folder}`);
      return records;
    }

    const jsonFiles = fs
      .readdirSync(folder)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => path.join(folder, name));

    for (const jsonFile of jsonFiles) {
      records.push(...this.loadFile(jsonFile));
    }

    return records;
  }

  /**
   * Parses a single JSON file into a list of TroubleshootingRecords.
   * A file can contain either a JSON array of record objects, or a
   * single JSON object. Any individual bad record is skipped without
   * losing the rest of the file. Returns [] (and logs) if the file
   * can't be read or isn't valid JSON.
   */
  loadFile(jsonFile: string): TroubleshootingRecord[] {
    let rawText: string;
    try {
      rawText = fs.readFileSync(jsonFile, "utf-8");
    } catch (exc) {
      const reason = `read error: ${errorMessage(exc)}`;
      this.logger.warn(`Could not read ${jsonFile}: ${errorMessage(exc)}`);
      this.skippedFiles.push({ file: jsonFile, reason });
      return [];
    }

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch (exc) {
      const reason = `invalid JSON: ${errorMessage(exc)}`;
      this.logger.warn(
        `Skipping corrupted JSON ${jsonFile}: ${errorMessage(exc)}`,
      );
      this.skippedFiles.push({ file: jsonFile, reason });
      return [];
    }

    let rawItems: unknown[];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (isPlainObject(data)) {
      rawItems = [data];
    } else {
      this.logger.warn(
        `Skipping ${jsonFile}: root JSON element is neither an object nor an array`,
      );
      this.skippedFiles.push({
        file: jsonFile,
        reason: "root element is not an object or array",
      });
      return [];
    }

    const records: TroubleshootingRecord[] = [];
    rawItems.forEach((item, index) => {
      if (!isPlainObject(item)) {
        this.logger.warn(
          `Skipping item ${index} in ${jsonFile}: not a JSON object`,
        );
        this.skippedFiles.push({
          file: `${jsonFile} [item ${index}]`,
          reason: "item is not an object",
        });
        return;
      }

      try {
        records.push(this.parseRecord(item, jsonFile));
      } catch (exc) {
        const reason = `parse error: ${errorMessage(exc)}`;
        this.logger.warn(
          `Skipping malformed item ${index} in ${jsonFile}: ${errorMessage(exc)}`,
        );
        this.skippedFiles.push({ file: `${jsonFile} [item ${index}]`, reason });
      }
    });

    return records;
  }

  // -------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------

  private findJsonFilesRecursive(root: string): string[] {
    const results: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
          results.push(fullPath);
        }
      }
    };

    walk(root);
    return results;
  }

  private parseRecord(
    data: Record<string, unknown>,
    sourceFile: string,
  ): TroubleshootingRecord {
    const defaultCategory = path.basename(path.dirname(sourceFile));

    const commandsRaw = Array.isArray(data.commands) ? data.commands : [];
    const commands: CommandEntry[] = commandsRaw
      .filter(isPlainObject)
      .map((cmd) => ({
        command: safeGet(cmd, "command", ""),
        purpose: safeGet(cmd, "purpose", ""),
        expectedResult: safeGet(cmd, "expected_result", ""),
        abnormalResult: safeGet(cmd, "abnormal_result", ""),
      }));

    const stepsRaw = Array.isArray(data.troubleshooting_steps)
      ? data.troubleshooting_steps
      : [];
    const steps: TroubleshootingStep[] = stepsRaw.map((rawStep, index) => {
      const stepObj = isPlainObject(rawStep) ? rawStep : null;
      return {
        step:
          stepObj && typeof stepObj.step === "number"
            ? stepObj.step
            : index + 1,
        action: stepObj ? safeGet(stepObj, "action", "") : "",
        reason: stepObj ? safeGet(stepObj, "reason", "") : "",
      };
    });

    return {
      id: safeGet(data, "id", path.basename(sourceFile, ".json")),
      category: safeGet(data, "category", defaultCategory),
      subcategory: safeGet(data, "subcategory", ""),
      problem: safeGet(data, "problem", ""),
      description: safeGet(data, "description", ""),
      symptoms: flattenListField(data.symptoms),
      possibleCauses: flattenListField(data.possible_causes),
      diagnosticQuestions: flattenListField(data.diagnostic_questions),
      commands,
      troubleshootingSteps: steps,
      possibleSolutions: flattenListField(data.possible_solutions),
      prevention: flattenListField(data.prevention),
      keywords: flattenListField(data.keywords),
      difficulty: safeGet(data, "difficulty", ""),
      estimatedFixTime: safeGet(data, "estimated_fix_time", ""),
      relatedProblems: flattenListField(data.related_problems),
      sourceFile,
    };
  }
}

// ---------------------------------------------------------------------------
// Local helpers (equivalent to utils.utils.safe_get / flatten_list_field).
// Kept inline so this stays a single, drop-in file.
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorMessage(exc: unknown): string {
  return exc instanceof Error ? exc.message : String(exc);
}

/**
 * Mirrors safe_get(dict, key, default): returns the field as a string if
 * present, otherwise the fallback. Non-string scalars are coerced to string
 * rather than dropped, matching the Python version's tolerance for loosely
 * typed source JSON.
 */
function safeGet(
  obj: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = obj[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string") return value;
  return String(value);
}

/**
 * Mirrors flatten_list_field: normalizes a field that's supposed to be a
 * list of strings but might have been authored as a single string, a
 * nested array, or left out entirely.
 */
function flattenListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      Array.isArray(item) ? flattenListField(item) : String(item),
    );
  }
  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [String(value)];
}

// ---------------------------------------------------------------------------
// Example CLI usage (run with: npx tsx services/DatasetLoader.ts <path>)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const datasetPath = process.argv[2] ?? "./dataset";
  const loader = new DatasetLoader(path.resolve(datasetPath));
  const records = loader.loadAll();
  console.log(
    `\nCategories: ${JSON.stringify(loader.categoriesLoaded, null, 2)}`,
  );
  console.log(`Total records: ${records.length}`);
}
