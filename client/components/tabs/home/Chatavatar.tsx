import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MessageSender } from "../../../types/chat";

type Props = {
  sender: MessageSender;
};

export function ChatAvatar({ sender }: Props) {
  const isUser = sender === "user";

  return (
    <View
      className={`h-8 w-8 items-center justify-center rounded-full ${
        isUser ? "bg-indigo-100" : "bg-blue-600"
      }`}
    >
      <Ionicons
        name={isUser ? "person" : "hardware-chip-outline"}
        size={16}
        color={isUser ? "#4338CA" : "#FFFFFF"}
      />
    </View>
  );
}
