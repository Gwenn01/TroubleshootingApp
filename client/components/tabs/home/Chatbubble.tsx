import { View, Text } from "react-native";
import { ChatAvatar } from "./Chatavatar";
import type { Message } from "../../../types/chat";

type Props = {
  message: Message;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBubble({ message }: Props) {
  const isUser = message.sender === "user";

  return (
    <View
      className={`mb-4 flex-row items-end ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <View className="mr-2">
          <ChatAvatar sender="assistant" />
        </View>
      )}

      <View className={`max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <View
          className={`rounded-3xl px-4 py-3 ${
            isUser
              ? "rounded-br-lg bg-blue-600"
              : "rounded-bl-lg border border-slate-100 bg-white"
          }`}
          style={
            !isUser
              ? {
                  shadowColor: "#0F172A",
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }
              : undefined
          }
        >
          <Text
            className={`text-base leading-6 ${
              isUser ? "text-white" : "text-slate-800"
            }`}
          >
            {message.text}
          </Text>
        </View>

        <Text className="mt-1 px-1 text-[11px] text-slate-400">
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {isUser && (
        <View className="ml-2">
          <ChatAvatar sender="user" />
        </View>
      )}
    </View>
  );
}
