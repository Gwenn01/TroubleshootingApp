import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

export type Crumb = {
  label: string;
  onPress?: () => void;
};

type Props = {
  items: Crumb[];
};

export function Breadcrumb({ items }: Props) {
  return (
    <View className="flex-row flex-wrap items-center">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={`${item.label}-${index}`}>
            {item.onPress ? (
              <Pressable onPress={item.onPress} hitSlop={6}>
                <Text className="text-xs font-medium text-blue-600">
                  {item.label}
                </Text>
              </Pressable>
            ) : (
              <Text
                className={`text-xs font-medium ${
                  isLast ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {item.label}
              </Text>
            )}
            {!isLast && (
              <Text className="mx-1.5 text-xs text-slate-300">/</Text>
            )}
          </Fragment>
        );
      })}
    </View>
  );
}
