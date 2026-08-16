import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
};

export function EmptyState({
  icon = "file-tray-outline",
  title,
  description,
}: Props) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Ionicons name={icon} size={24} color="#94A3B8" />
      </View>
      <Text className="text-center text-base font-semibold text-slate-700">
        {title}
      </Text>
      {description && (
        <Text className="mt-1 text-center text-sm text-slate-400">
          {description}
        </Text>
      )}
    </View>
  );
}
