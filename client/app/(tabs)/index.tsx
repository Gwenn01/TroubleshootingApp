import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ChatHeader } from "../../components/tabs/home/Chatheader";
import { MessageList } from "../../components/tabs/home/Messagelist";
import { QuickSuggestions } from "../../components/tabs/home/Quicksuggestions";
import { ChatInput } from "../../components/tabs/home/Chatinput";
import type { Message } from "../../types/chat";

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

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsAssistantTyping(true);

    // TODO: replace with a call into your SearchEngine / AIEngine backend
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        sender: "assistant",
        text: "I understand. Let me help you troubleshoot that problem.",
        timestamp: Date.now(),
      };

      setMessages((current) => [...current, assistantMessage]);
      setIsAssistantTyping(false);
    }, 900);
  };

  const handleSuggestionSelect = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ChatHeader />

      <MessageList messages={messages} isAssistantTyping={isAssistantTyping} />

      <QuickSuggestions onSelect={handleSuggestionSelect} />

      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={handleSend}
        disabled={isAssistantTyping}
      />
    </KeyboardAvoidingView>
  );
}
