import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import {
  blurbForCategory,
  displayCategoryName,
  iconForCategory,
} from "../../../utils/browse/Categorymeta";

type Props = {
  category: string;
  guideCount: number;
  onPress: () => void;
};

export function CategoryCard({ category, guideCount, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4 active:bg-slate-50"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
        <Ionicons name={iconForCategory(category)} size={22} color="#2563EB" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">
          {displayCategoryName(category)}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-400" numberOfLines={1}>
          {blurbForCategory(category)}
        </Text>
        <Text className="mt-1.5 text-xs font-medium text-blue-600">
          {guideCount} {guideCount === 1 ? "guide" : "guides"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </Pressable>
  );
}
