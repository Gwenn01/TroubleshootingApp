import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Message = {
  id: number;
  text: string;
  sender: "user" | "assistant";
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Hello! I'm your IT Troubleshooting Assistant.",
    },
    {
      id: 2,
      sender: "assistant",
      text: "Tell me what problem you're experiencing and I'll help you troubleshoot it.",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    // Static response for now
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        sender: "assistant",
        text: "I understand. Let me help you troubleshoot that problem.",
      };

      setMessages((current) => [...current, assistantMessage]);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-5 pb-4 pt-14">
        <Text className="text-2xl font-bold text-gray-900">IT Assistant</Text>

        <Text className="mt-1 text-sm text-gray-500">
          Troubleshooting Assistant
        </Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => {
          const isUser = message.sender === "user";

          return (
            <View
              key={message.id}
              className={`mb-4 flex-row ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <View
                className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "rounded-br-md bg-blue-600"
                    : "rounded-bl-md bg-white"
                }`}
              >
                <Text
                  className={`text-base leading-6 ${
                    isUser ? "text-white" : "text-gray-800"
                  }`}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Suggestions */}
      <View className="border-t border-gray-200 bg-white px-4 pb-2 pt-3">
        <Text className="mb-2 text-xs font-semibold uppercase text-gray-400">
          Common problems
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
            onPress={() => setInput("My computer has no internet connection")}
          >
            <Text className="text-sm text-gray-700">No Internet</Text>
          </Pressable>

          <Pressable
            className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
            onPress={() => setInput("My printer is not working")}
          >
            <Text className="text-sm text-gray-700">Printer Problem</Text>
          </Pressable>

          <Pressable
            className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
            onPress={() => setInput("I cannot access the shared folder")}
          >
            <Text className="text-sm text-gray-700">Shared Folder</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Input */}
      <View className="flex-row items-end gap-2 bg-white px-4 pb-5 pt-2">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Describe your problem..."
          placeholderTextColor="#9CA3AF"
          multiline
          className="max-h-28 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
        />

        <Pressable
          onPress={handleSend}
          className={`h-12 w-12 items-center justify-center rounded-full ${
            input.trim() ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <Text className="text-lg font-bold text-white">↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
