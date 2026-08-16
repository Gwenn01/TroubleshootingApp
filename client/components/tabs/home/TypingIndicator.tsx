import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { ChatAvatar } from "./Chatavatar";

function Dot({ animValue }: { animValue: Animated.Value }) {
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1.15, 0.85],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale }],
        opacity,
      }}
      className="mx-0.5 h-2 w-2 rounded-full bg-indigo-500"
    />
  );
}

type Props = {
  /** e.g. "Searching troubleshooting knowledge base…" — omit for just dots. */
  label?: string;
};

export function TypingIndicator({ label }: Props) {
  // Container entrance animation
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerTranslateY = useRef(new Animated.Value(6)).current;

  // Continuous dot bounce state values
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(containerTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Each dot gets its OWN independent loop, started after a one-time
    // delay (140ms apart). This is the key change: the previous version
    // wrapped all three dots in a single Animated.stagger() inside one
    // Animated.loop() — that resets and restarts ALL three together
    // every cycle, so the whole group has to wait for dot3 to finish
    // before dot1 can start again, which reads as a stutter/pause every
    // ~1s instead of a smooth continuous wave. Giving each dot its own
    // loop means they run independently forever, with no shared reset
    // point, so the wave never "catches its breath."
    const singleBounce = (anim: Animated.Value) =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]);

    const loops = [dot1, dot2, dot3].map((dot, index) =>
      Animated.sequence([
        Animated.delay(index * 140), // one-time stagger, not repeated
        Animated.loop(singleBounce(dot)),
      ]),
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [containerOpacity, containerTranslateY, dot1, dot2, dot3]);

  return (
    <Animated.View
      style={{
        opacity: containerOpacity,
        transform: [{ translateY: containerTranslateY }],
      }}
      className="mb-4 flex-row items-end justify-start"
    >
      <View className="mr-2.5">
        <ChatAvatar sender="assistant" />
      </View>

      <View
        className="flex-row items-center gap-2.5 rounded-2xl rounded-bl-sm border border-slate-200/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      >
        <View className="flex-row items-center py-0.5">
          <Dot animValue={dot1} />
          <Dot animValue={dot2} />
          <Dot animValue={dot3} />
        </View>

        {label && (
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
