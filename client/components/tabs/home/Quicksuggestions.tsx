import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TroubleshootingRecord } from "../../../services/general/DatasetLoader";
import { buildQuickSuggestions } from "../../../utils/home/quickSuggestions";
import type { QuickSuggestion } from "../../../types/chat";

type Props = {
  records: TroubleshootingRecord[];
  onSelect: (prompt: string) => void;
};

export function QuickSuggestions({ records, onSelect }: Props) {
  // Suggestions now live in state (not useMemo) because refreshSuggestions()
  // needs to imperatively regenerate them on button press, not just react
  // to a prop change.
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>(() =>
    buildQuickSuggestions(records),
  );

  // If the underlying dataset changes (e.g. dataset.json reloads with new
  // records), regenerate from scratch with no exclusions.
  useEffect(() => {
    setSuggestions(buildQuickSuggestions(records));
  }, [records]);

  const refreshSuggestions = () => {
    const currentlyShownIds = new Set(suggestions.map((s) => s.id));
    setSuggestions(
      buildQuickSuggestions(records, undefined, currentlyShownIds),
    );
  };

  // Nothing loaded yet (e.g. dataset.json is empty/missing) — hide the
  // whole row rather than show an empty "Common problems" header.
  if (suggestions.length === 0) return null;

  return (
    <View className="border-t border-slate-100 bg-white px-4 pb-2 pt-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Common problems
        </Text>

        <Pressable
          onPress={refreshSuggestions}
          className="h-6 w-6 items-center justify-center rounded-full active:bg-slate-100"
        >
          <Ionicons name="refresh-outline" size={14} color="#475569" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            onPress={() => onSelect(suggestion.prompt)}
            className="flex-row items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 active:bg-slate-100"
          >
            <Ionicons name={suggestion.icon} size={14} color="#475569" />
            <Text className="text-sm font-medium text-slate-600">
              {suggestion.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
