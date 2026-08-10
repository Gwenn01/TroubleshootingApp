import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  totalRecords: number;
  categoriesLoaded: Record<string, number>;
};

export function DatasetStatusBadge({ totalRecords, categoriesLoaded }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const categoryEntries = Object.entries(categoriesLoaded).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="mt-2 flex-row items-center self-start gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 active:bg-blue-100"
      >
        <Ionicons name="server-outline" size={13} color="#2563EB" />
        <Text className="text-xs font-semibold text-blue-700">
          {String(totalRecords)} entries loaded
        </Text>
        <Ionicons name="chevron-down" size={12} color="#2563EB" />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            style={StyleSheet.absoluteFillObject}
            className="bg-black/40"
            onPress={() => setIsOpen(false)}
          />

          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            {/* Header */}
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900">
                Knowledge Base
              </Text>

              <Pressable
                onPress={() => setIsOpen(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons name="close" size={16} color="#475569" />
              </Pressable>
            </View>

            {/* Summary */}
            <Text className="mb-4 text-sm text-slate-500">
              {String(totalRecords)} entries across {categoryEntries.length}{" "}
              categories
            </Text>

            {/* Category list */}
            <ScrollView
              style={{ maxHeight: 450 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              bounces
            >
              {categoryEntries.map(([category, count]) => (
                <View
                  key={category}
                  className="mb-2 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <Text className="text-sm font-medium text-slate-700">
                    {category}
                  </Text>

                  <View className="rounded-full bg-white px-2.5 py-1">
                    <Text className="text-xs font-semibold text-slate-500">
                      {count}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
