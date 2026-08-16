import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { ChatAvatar } from "./Chatavatar";
import type { Message, MessageOption } from "../../../types/chat";

type Props = {
  message: Message;
  /** Called when the user taps one of an assistant message's options. */
  onSelectOption?: (option: MessageOption) => void;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBubble({ message, onSelectOption }: Props) {
  const isUser = message.sender === "user";
  const hasOptions = !isUser && !!message.options && message.options.length > 0;

  // Entrance animation state
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 90,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 90,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale }],
      }}
      className={`mb-4 flex-row items-end ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <View className="mr-2.5">
          <ChatAvatar sender="assistant" />
        </View>
      )}

      <View className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Main Message Bubble */}
        <View
          className={`px-4 py-3 ${
            isUser
              ? "rounded-3xl rounded-br-sm bg-indigo-600"
              : "rounded-3xl rounded-bl-sm border border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-900"
          }`}
          style={
            !isUser
              ? {
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                }
              : undefined
          }
        >
          <Text
            className={`text-sm leading-6 ${
              isUser
                ? "font-medium text-white"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {message.text}
          </Text>
        </View>

        {/* Options / Action Pills */}
        {hasOptions && (
          <View className="mt-2.5 w-full gap-1.5">
            {message.options!.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => onSelectOption?.(option)}
                className="flex-row items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 active:scale-[0.98] active:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:active:bg-indigo-900/50"
              >
                <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {option.label}
                </Text>
                <ChevronRight
                  size={14}
                  className="text-indigo-500"
                  color="#6366f1"
                />
              </Pressable>
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text className="mt-1 px-1 text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {isUser && (
        <View className="ml-2.5">
          <ChatAvatar sender="user" />
        </View>
      )}
    </Animated.View>
  );
}
