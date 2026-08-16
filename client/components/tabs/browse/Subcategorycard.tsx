import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { displayCategoryName } from "../../../utils/browse/Categorymeta";

type Props = {
  subcategory: string;
  guideCount: number;
  onPress: () => void;
};

export function SubcategoryCard({ subcategory, guideCount, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3.5 active:bg-slate-50"
    >
      <View className="flex-1 pr-3">
        <Text className="text-sm font-semibold text-slate-800">
          {displayCategoryName(subcategory)}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-400">
          {guideCount} {guideCount === 1 ? "guide" : "guides"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </Pressable>
  );
}
