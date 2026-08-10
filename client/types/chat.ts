export type MessageSender = "user" | "assistant";

/** One tappable choice offered when a search is ambiguous. */
export type MessageOption = {
  id: string;
  label: string;
  recordId: string;
};

export type Message = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: number;
  /** Present on assistant messages that offer the user a pick-one list. */
  options?: MessageOption[];
};

export type QuickSuggestion = {
  id: string;
  label: string;
  prompt: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
};
