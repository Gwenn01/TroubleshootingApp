import { SearchEngine } from "./SearchEngine";
import type { TroubleshootingRecord } from "./DatasetLoader";
import type { Message } from "../types/chat";
import { formatTroubleshootingRecord } from "../utils/formattroubleshootingrecord";

/**
 * How close (in weighted score points) a second-best match needs to be
 * to the best match before the result counts as ambiguous and the user
 * gets asked to pick, instead of just being answered with the top hit.
 *
 * SearchEngine itself has no notion of ambiguity — that's intentionally
 * kept out of SearchEngine.ts so the search algorithm stays a general
 * "give me ranked matches" utility, reusable by other screens later
 * (e.g. Browse) without this chat-specific behavior baked in.
 */
const AMBIGUITY_SCORE_MARGIN = 10;

export type SearchOutcome =
  | { kind: "no-match" }
  | { kind: "single"; record: TroubleshootingRecord }
  | { kind: "ambiguous"; records: TroubleshootingRecord[] };

/**
 * Runs the user's query through the existing SearchEngine and classifies
 * the result. Never throws — a search error is treated the same as "no
 * match" rather than crashing the chat.
 */
export function resolveSearch(
  engine: SearchEngine,
  query: string,
): SearchOutcome {
  const trimmed = query.trim();
  if (!trimmed) return { kind: "no-match" };

  let results;
  try {
    results = engine.search(trimmed);
  } catch (error) {
    console.warn("SearchEngine.search failed:", error);
    return { kind: "no-match" };
  }

  if (results.length === 0) {
    return { kind: "no-match" };
  }

  const [best, second] = results;
  const isAmbiguous =
    !!second && best.score - second.score < AMBIGUITY_SCORE_MARGIN;

  if (isAmbiguous) {
    return {
      kind: "ambiguous",
      records: results.map((result) => result.record),
    };
  }

  return { kind: "single", record: best.record };
}

let messageCounter = 0;
function nextMessageId(): number {
  messageCounter += 1;
  return Date.now() * 1000 + messageCounter;
}

const NO_MATCH_TEXT =
  "I couldn't find a close match in the troubleshooting knowledge base.\n\n" +
  "Try describing the problem with more detail, for example:\n" +
  '• "Printer is offline"\n' +
  '• "Windows shows a blue screen"\n' +
  '• "Cannot access shared folder"\n' +
  '• "Excel crashes when opening"';

/** Turns a SearchOutcome into the assistant Message to append to the chat. */
export function buildAssistantMessage(outcome: SearchOutcome): Message {
  const timestamp = Date.now();

  if (outcome.kind === "no-match") {
    return {
      id: nextMessageId(),
      sender: "assistant",
      timestamp,
      text: NO_MATCH_TEXT,
    };
  }

  if (outcome.kind === "ambiguous") {
    return {
      id: nextMessageId(),
      sender: "assistant",
      timestamp,
      text: "I found several possible problems. Tap the one that matches best:",
      options: outcome.records.map((record) => ({
        id: record.id,
        label: record.problem || record.id,
        recordId: record.id,
      })),
    };
  }

  return {
    id: nextMessageId(),
    sender: "assistant",
    timestamp,
    text: formatTroubleshootingRecord(outcome.record),
  };
}

/** Builds the full-detail assistant message after the user picks one option. */
export function buildRecordDetailMessage(
  record: TroubleshootingRecord,
): Message {
  return {
    id: nextMessageId(),
    sender: "assistant",
    timestamp: Date.now(),
    text: formatTroubleshootingRecord(record),
  };
}
