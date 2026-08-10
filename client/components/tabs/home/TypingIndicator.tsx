import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { ChatAvatar } from "./Chatavatar";

function Dot({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -4,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [delay, translateY]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="mx-0.5 h-2 w-2 rounded-full bg-slate-400"
    />
  );
}

type Props = {
  /** e.g. "Searching troubleshooting knowledge base…" — omit for just dots. */
  label?: string;
};

export function TypingIndicator({ label }: Props) {
  // Entrance animation: fades and slides the whole bubble up on mount,
  // instead of it just popping into place when isAssistantTyping flips
  // to true. Runs once — this component unmounts/remounts each time it
  // shows since MessageList only renders it conditionally, so a fresh
  // "mount" animation happens every time it appears.
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className="mb-4 flex-row items-end justify-start"
    >
      <View className="mr-2">
        <ChatAvatar sender="assistant" />
      </View>

      <View
        className="flex-row items-center gap-2 rounded-3xl rounded-bl-lg border border-slate-100 bg-white px-4 py-3"
        style={{
          shadowColor: "#0F172A",
          shadowOpacity: 0.05,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <View className="flex-row items-center">
          <Dot delay={0} />
          <Dot delay={120} />
          <Dot delay={240} />
        </View>

        {label && <Text className="text-xs text-slate-400">{label}</Text>}
      </View>
    </Animated.View>
  );
}
