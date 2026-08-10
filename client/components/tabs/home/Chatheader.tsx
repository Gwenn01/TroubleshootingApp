import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DatasetStatusBadge } from "./DatasetStatusBadge";

type Props = {
  /** Omit both while the dataset hasn't loaded yet — badge just won't render. */
  totalRecords?: number;
  categoriesLoaded?: Record<string, number>;
};

export function ChatHeader({ totalRecords, categoriesLoaded }: Props) {
  const hasDatasetStats =
    typeof totalRecords === "number" && !!categoriesLoaded;

  return (
    <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14">
      <View className="flex-row items-center gap-3">
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

      {hasDatasetStats && (
        <DatasetStatusBadge
          totalRecords={totalRecords!}
          categoriesLoaded={categoriesLoaded!}
        />
      )}
    </View>
  );
}
