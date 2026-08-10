import { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChatHeader } from "../../components/tabs/home/Chatheader";
import { MessageList } from "../../components/tabs/home/MessageList";
import { QuickSuggestions } from "../../components/tabs/home/Quicksuggestions";
import { ChatInput } from "../../components/tabs/home/Chatinput";
import { computeDatasetStats } from "../../utils/Datasetstats";
import { SearchEngine } from "../../services/SearchEngine";
import {
  buildAssistantMessage,
  buildRecordDetailMessage,
  resolveSearch,
} from "../../services/Troubleshootingchat";
import type { TroubleshootingRecord } from "../../services/DatasetLoader";
import type { Message, MessageOption } from "../../types/chat";

// Built by `npx tsx scripts/buildDataset.ts` — re-run after editing the KB.
// Requires "resolveJsonModule": true in tsconfig (on by default in Expo).
// run this to generate dataset
// npx tsx scripts/buildDataset.ts ./Dataset ./assets/dataset.json
import datasetRecords from "../../assets/dataset.json";

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    sender: "assistant",
    text: "Hello! I'm your IT Troubleshooting Assistant.",
    timestamp: Date.now(),
  },
  {
    id: 2,
    sender: "assistant",
    text: "Tell me what problem you're experiencing and I'll help you troubleshoot it.",
    timestamp: Date.now(),
  },
];
const SEARCHING_LABEL = "Searching troubleshooting knowledge base…";

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [suggestionRefreshKey, setSuggestionRefreshKey] = useState(0);

  const records = datasetRecords as TroubleshootingRecord[];

  // Built once, not on every render/keystroke — SearchEngine does its own
  // token-set indexing work in the constructor (see SearchEngine.ts),
  // and the dataset itself doesn't change at runtime.
  const searchEngine = useMemo(() => new SearchEngine(records), [records]);

  // Lets handleOptionSelect look up the full record for whichever option
  // the user taps, without re-searching.
  const recordsById = useMemo(() => {
    const map = new Map<string, TroubleshootingRecord>();
    for (const record of records) {
      map.set(record.id, record);
    }
    return map;
  }, [records]);

  const datasetStats = useMemo(() => computeDatasetStats(records), [records]);

  // Re-pick quick suggestions every time this screen regains focus (e.g.
  // navigating back to it from another tab/page), instead of only once
  // on first mount.
  useFocusEffect(
    useCallback(() => {
      setSuggestionRefreshKey((key) => key + 1);
    }, []),
  );

  const handleSend = () => {
    const trimmed = input.trim();
    // Empty/whitespace-only input, and a duplicate-submission guard —
    // ChatInput's own `disabled` prop already blocks this visually, this
    // is the belt-and-suspenders check at the controller level.
    if (!trimmed || isAssistantTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsAssistantTyping(true);

    // The search itself is synchronous, in-memory fuzzy matching — this
    // delay exists purely so the "Searching…" state is visible rather
    // than the response appearing instantly, not because search is
    // actually async.
    setTimeout(() => {
      const outcome = resolveSearch(searchEngine, trimmed);
      const assistantMessage = buildAssistantMessage(outcome);
      setMessages((current) => [...current, assistantMessage]);
      setIsAssistantTyping(false);
    }, 400);
  };

  const handleSuggestionSelect = (prompt: string) => {
    setInput(prompt);
  };

  // Fires when the user taps one of the options under an "I found
  // several possible problems" assistant message.
  const handleOptionSelect = (option: MessageOption) => {
    const record = recordsById.get(option.recordId);
    if (!record) return;

    const userChoiceMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: option.label,
      timestamp: Date.now(),
    };
    const detailMessage = buildRecordDetailMessage(record);

    setMessages((current) => [...current, userChoiceMessage, detailMessage]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ChatHeader
        totalRecords={datasetStats.totalRecords}
        categoriesLoaded={datasetStats.categoriesLoaded}
      />

      <MessageList
        messages={messages}
        isAssistantTyping={isAssistantTyping}
        typingLabel={SEARCHING_LABEL}
        onSelectOption={handleOptionSelect}
      />

      <QuickSuggestions records={records} onSelect={handleSuggestionSelect} />

      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={handleSend}
        disabled={isAssistantTyping}
      />
    </KeyboardAvoidingView>
  );
}
