import { ScrollView } from "react-native";
import type { PropsWithChildren } from "react";

export function BrowseScrollView({ children }: PropsWithChildren) {
  return (
    <ScrollView
      className="flex-1 px-5"
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
