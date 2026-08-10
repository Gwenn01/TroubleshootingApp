export type MessageSender = "user" | "assistant";

export type Message = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: number;
};

export type QuickSuggestion = {
  id: string;
  label: string;
  prompt: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
};
