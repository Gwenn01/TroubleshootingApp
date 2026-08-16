/**
 * scripts/buildDataset.ts
 * ------------------------
 * Run this in Termux/Node BEFORE building the app — it walks your JSON
 * knowledge base with the existing DatasetLoader and writes one combined
 * file the React Native app can `import` directly (RN has no filesystem
 * access to walk your dataset/ folder at runtime).
 *
 * Usage:
 *   npx tsx scripts/buildDataset.ts ./dataset ./assets/dataset.json
 *
 * Re-run any time you add/edit KB entries, then reload the app.
 */

import fs from "fs";
import path from "path";
import { DatasetLoader } from "../services/general/DatasetLoader";

const datasetDir = path.resolve(process.argv[2] ?? "./dataset");
const outputFile = path.resolve(process.argv[3] ?? "./assets/dataset.json");

const loader = new DatasetLoader(datasetDir);
const records = loader.loadAll();

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(records, null, 2), "utf-8");

console.log(`\nWrote ${records.length} records to ${outputFile}`);
console.log(`Categories: ${JSON.stringify(loader.categoriesLoaded, null, 2)}`);
