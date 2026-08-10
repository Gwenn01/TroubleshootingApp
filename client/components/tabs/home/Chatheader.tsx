import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function ChatHeader() {
  return (
    <View className="flex-row items-center gap-3 border-b border-slate-100 bg-white px-5 pb-4 pt-14">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-600">
        <Ionicons name="hardware-chip-outline" size={22} color="#FFFFFF" />
      </View>

      <View className="flex-1">
        <Text className="text-xl font-bold text-slate-900">IT Assistant</Text>

        <View className="mt-0.5 flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-emerald-500" />
          <Text className="text-xs text-slate-500">
            Troubleshooting Assistant · Online
          </Text>
        </View>
      </View>
    </View>
  );
}
