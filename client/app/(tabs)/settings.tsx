import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  const handleImportData = () => {
    Alert.alert(
      "Import Data",
      "The data import feature will be added here. You will be able to select and import your troubleshooting dataset.",
    );
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Export functionality will be added later.");
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Data",
      "This will remove imported troubleshooting data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Data Cleared", "Your data has been cleared.");
          },
        },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "IT Troubleshooting Assistant",
      "Version 1.0.0\n\nAn application for troubleshooting and IT configuration guides.",
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <View className="border-b border-gray-200 bg-white px-5 pb-5 pt-14">
        <Text className="text-3xl font-bold text-gray-900">Settings</Text>

        <Text className="mt-1 text-sm text-gray-500">
          Manage your application and troubleshooting data.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* ================================= */}
        {/* DATA */}
        {/* ================================= */}

        <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Data
        </Text>

        <View className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Import Data */}

          <Pressable
            onPress={handleImportData}
            className="flex-row items-center border-b border-gray-100 p-5"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Text className="text-xl">↓</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Import Data
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Import troubleshooting data from a file.
              </Text>
            </View>

            <Text className="text-xl text-gray-400">›</Text>
          </Pressable>

          {/* Export Data */}

          <Pressable
            onPress={handleExportData}
            className="flex-row items-center border-b border-gray-100 p-5"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Text className="text-xl">↑</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Export Data
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Export your troubleshooting data.
              </Text>
            </View>

            <Text className="text-xl text-gray-400">›</Text>
          </Pressable>

          {/* Clear Data */}

          <Pressable
            onPress={handleClearData}
            className="flex-row items-center p-5"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <Text className="text-xl">×</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-red-600">
                Clear Data
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Remove imported troubleshooting data.
              </Text>
            </View>

            <Text className="text-xl text-gray-400">›</Text>
          </Pressable>
        </View>

        {/* ================================= */}
        {/* DATA STATUS */}
        {/* ================================= */}

        <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Data Status
        </Text>

        <View className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base text-gray-700">Dataset</Text>

            <Text className="font-semibold text-gray-400">Not imported</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-base text-gray-700">
              Troubleshooting Topics
            </Text>

            <Text className="font-semibold text-gray-400">0</Text>
          </View>
        </View>

        {/* ================================= */}
        {/* APPEARANCE */}
        {/* ================================= */}

        <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Appearance
        </Text>

        <View className="mb-6 rounded-2xl border border-gray-200 bg-white">
          <Pressable className="flex-row items-center p-5">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Text className="text-xl">☀</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Theme
              </Text>

              <Text className="mt-1 text-sm text-gray-500">System default</Text>
            </View>

            <Text className="text-xl text-gray-400">›</Text>
          </Pressable>
        </View>

        {/* ================================= */}
        {/* ABOUT */}
        {/* ================================= */}

        <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          About
        </Text>

        <View className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <Pressable
            onPress={handleAbout}
            className="flex-row items-center p-5"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Text className="text-xl">ⓘ</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                About
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                IT Troubleshooting Assistant
              </Text>
            </View>

            <Text className="text-xl text-gray-400">›</Text>
          </Pressable>
        </View>

        {/* Version */}

        <Text className="text-center text-xs text-gray-400">
          IT Troubleshooting Assistant
        </Text>

        <Text className="mt-1 text-center text-xs text-gray-400">
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
