import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
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

export function TypingIndicator() {
  return (
    <View className="mb-4 flex-row items-end justify-start">
      <View className="mr-2">
        <ChatAvatar sender="assistant" />
      </View>

      <View
        className="flex-row items-center rounded-3xl rounded-bl-lg border border-slate-100 bg-white px-4 py-3"
        style={{
          shadowColor: "#0F172A",
          shadowOpacity: 0.05,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <Dot delay={0} />
        <Dot delay={120} />
        <Dot delay={240} />
      </View>
    </View>
  );
}
