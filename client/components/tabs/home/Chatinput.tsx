import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChangeText, onSend, disabled }: Props) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View className="flex-row items-end gap-2 border-t border-slate-100 bg-white px-4 pb-5 pt-3">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Describe your problem..."
        placeholderTextColor="#94A3B8"
        multiline
        editable={!disabled}
        className="max-h-28 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
      />

      <Pressable
        onPress={onSend}
        disabled={!canSend}
        className={`h-12 w-12 items-center justify-center rounded-full ${
          canSend ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <Ionicons
          name="arrow-up"
          size={20}
          color={canSend ? "#FFFFFF" : "#94A3B8"}
        />
      </Pressable>
    </View>
  );
}
