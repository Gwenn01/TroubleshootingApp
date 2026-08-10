import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { QuickSuggestion } from "../../../types/chat";

const SUGGESTIONS: QuickSuggestion[] = [
  {
    id: "no-internet",
    label: "No Internet",
    prompt: "My computer has no internet connection",
    icon: "wifi-outline",
  },
  {
    id: "printer",
    label: "Printer Problem",
    prompt: "My printer is not working",
    icon: "print-outline",
  },
  {
    id: "shared-folder",
    label: "Shared Folder",
    prompt: "I cannot access the shared folder",
    icon: "folder-open-outline",
  },
  {
    id: "lotus-notes",
    label: "Lotus Notes",
    prompt: "Lotus Notes won't open or keeps crashing",
    icon: "mail-outline",
  },
];

type Props = {
  onSelect: (prompt: string) => void;
};

export function QuickSuggestions({ onSelect }: Props) {
  return (
    <View className="border-t border-slate-100 bg-white px-4 pb-2 pt-3">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Common problems
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {SUGGESTIONS.map((suggestion) => (
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
