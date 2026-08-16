import { Text, View } from "react-native";

type Props = {
  title: string;
  items?: string[];
  bodyText?: string;
};

/**
 * Labeled section card used throughout the Problem Details screen
 * (Description / Symptoms / Possible causes / Solution / Prevention /
 * Related problems). Renders nothing if there's no data for this
 * section — "don't display fields that don't exist" per the spec.
 */
export function ProblemSection({ title, items, bodyText }: Props) {
  const hasItems = !!items && items.length > 0;
  const hasBody = !!bodyText && bodyText.trim().length > 0;

  if (!hasItems && !hasBody) return null;

  return (
    <View className="mb-4 rounded-2xl border border-slate-100 bg-white p-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </Text>

      {hasBody && (
        <Text className="text-sm leading-6 text-slate-700">{bodyText}</Text>
      )}

      {hasItems && (
        <View className="gap-1.5">
          {items!.map((item, index) => (
            <View key={index} className="flex-row">
              <Text className="mr-2 text-sm text-slate-400">•</Text>
              <Text className="flex-1 text-sm leading-6 text-slate-700">
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
