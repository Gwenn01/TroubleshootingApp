import type { TroubleshootingRecord } from "../services/DatasetLoader";

function bulletList(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

function numberedList(items: string[]): string {
  return items
    .filter((item) => item.trim().length > 0)
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");
}

/**
 * Formats a TroubleshootingRecord into the multi-section response shown
 * in chat (Problem / Category / Symptoms / Possible Cause / Solution /
 * Prevention). Each section is only included when the underlying field
 * actually has data — DatasetLoader already guarantees array fields
 * default to [] and string fields default to "" for missing JSON keys,
 * so this never crashes on a record missing an optional field; it just
 * omits that section, per the "don't display fields that don't exist"
 * requirement.
 */
export function formatTroubleshootingRecord(
  record: TroubleshootingRecord,
): string {
  const sections: string[] = [];

  sections.push(`Problem\n${record.problem || "Untitled issue"}`);

  if (record.category) {
    sections.push(`Category\n${record.category}`);
  }

  if (record.symptoms.length > 0) {
    sections.push(`Symptoms\n${bulletList(record.symptoms)}`);
  }

  if (record.possibleCauses.length > 0) {
    sections.push(`Possible Cause\n${bulletList(record.possibleCauses)}`);
  }

  // Prefer the structured step-by-step actions if present; fall back to
  // the flatter possibleSolutions list otherwise. Both come straight
  // from the existing dataset — nothing invented here.
  const stepActions = record.troubleshootingSteps
    .map((step) => step.action)
    .filter((action) => action.trim().length > 0);

  if (stepActions.length > 0) {
    sections.push(`Solution\n${numberedList(stepActions)}`);
  } else if (record.possibleSolutions.length > 0) {
    sections.push(`Solution\n${numberedList(record.possibleSolutions)}`);
  }

  if (record.prevention.length > 0) {
    sections.push(`Prevention\n${bulletList(record.prevention)}`);
  }

  return sections.join("\n\n");
}
