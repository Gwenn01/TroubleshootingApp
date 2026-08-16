import { Text, View } from "react-native";
import type { TroubleshootingStep } from "../../../services/general/DatasetLoader";

type Props = {
  step: TroubleshootingStep;
  index: number;
};

export function TroubleshootingStepItem({ step, index }: Props) {
  return (
    <View className="mb-2.5 flex-row rounded-2xl border border-slate-100 bg-white p-4">
      <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-blue-100">
        <Text className="text-xs font-bold text-blue-600">{index + 1}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm leading-6 text-slate-800">{step.action}</Text>
        {!!step.reason && (
          <Text className="mt-1 text-xs leading-5 text-slate-400">
            {step.reason}
          </Text>
        )}
      </View>
    </View>
  );
}
