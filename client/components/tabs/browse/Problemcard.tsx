import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { TroubleshootingRecord } from "../../../services/general/DatasetLoader";

type Props = {
  record: TroubleshootingRecord;
  onPress: () => void;
};

export function ProblemCard({ record, onPress }: Props) {
  const hasMeta = !!record.difficulty || !!record.estimatedFixTime;

  return (
    <Pressable
      onPress={onPress}
      className="mb-2.5 rounded-2xl border border-slate-100 bg-white p-4 active:bg-slate-50"
    >
      <Text className="text-sm font-bold text-slate-900">{record.problem}</Text>

      {!!record.description && (
        <Text
          className="mt-1 text-xs leading-5 text-slate-500"
          numberOfLines={2}
        >
          {record.description}
        </Text>
      )}

      <View className="mt-2.5 flex-row items-center justify-between">
        {hasMeta ? (
          <View className="flex-row items-center gap-3">
            {!!record.difficulty && (
              <Text className="text-xs font-medium text-slate-400">
                Difficulty: {record.difficulty}
              </Text>
            )}
            {!!record.estimatedFixTime && (
              <Text className="text-xs font-medium text-slate-400">
                {record.estimatedFixTime}
              </Text>
            )}
          </View>
        ) : (
          <View />
        )}

        <View className="flex-row items-center">
          <Text className="mr-1 text-xs font-semibold text-blue-600">
            Open guide
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#2563EB" />
        </View>
      </View>
    </Pressable>
  );
}
