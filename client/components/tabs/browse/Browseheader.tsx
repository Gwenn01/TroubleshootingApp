import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { BrowseSearchBar } from "./Browsesearchbar";

type BrowseHeaderProps = {
  breadcrumbItems: Crumb[];
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  search?: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
  };
};

export function BrowseHeader({
  breadcrumbItems,
  title,
  subtitle,
  icon = "folder-open-outline",
  search,
}: BrowseHeaderProps) {
  const showBreadcrumb = breadcrumbItems.length > 0;

  return (
    <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14">
      {showBreadcrumb && (
        <View className="mb-2">
          <Breadcrumb items={breadcrumbItems} />
        </View>
      )}

      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-600">
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>

        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
            {title}
          </Text>

          {subtitle && (
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>
      </View>

      {search && (
        <View className="mt-3">
          <BrowseSearchBar
            value={search.value}
            onChangeText={search.onChangeText}
            placeholder={search.placeholder}
          />
        </View>
      )}
    </View>
  );
}
