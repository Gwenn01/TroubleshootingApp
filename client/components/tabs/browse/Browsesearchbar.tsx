import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function BrowseSearchBar({
  value,
  onChangeText,
  placeholder = "Search",
}: Props) {
  return (
    <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
      <Ionicons name="search-outline" size={16} color="#94A3B8" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="ml-2 flex-1 text-sm text-slate-900"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color="#CBD5E1" />
        </Pressable>
      )}
    </View>
  );
}
