import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Topic = {
  id: number;
  title: string;
  description: string;
  steps: string[];
};

type Category = {
  id: number;
  name: string;
  icon: string;
  topics: Topic[];
};

const categories: Category[] = [
  {
    id: 1,
    name: "Hardware",
    icon: "💻",
    topics: [
      {
        id: 1,
        title: "Computer won't turn on",
        description:
          "The computer does not power on when you press the power button.",
        steps: [
          "Check if the power cable is connected.",
          "Check the power outlet.",
          "Check the power supply switch.",
          "Try another power cable if available.",
        ],
      },
      {
        id: 2,
        title: "No display",
        description:
          "The computer turns on, but nothing appears on the monitor.",
        steps: [
          "Check the monitor power.",
          "Check the HDMI or DisplayPort cable.",
          "Make sure the monitor is using the correct input.",
          "Try another display cable.",
        ],
      },
    ],
  },

  {
    id: 2,
    name: "Networking",
    icon: "🌐",
    topics: [
      {
        id: 3,
        title: "No internet connection",
        description:
          "The computer is connected to the network but cannot access the internet.",
        steps: [
          "Check the Ethernet or Wi-Fi connection.",
          "Check the IP address using ipconfig.",
          "Try pinging the default gateway.",
          "Try pinging a public IP address.",
          "Check the DNS configuration.",
        ],
      },
      {
        id: 4,
        title: "DNS problem",
        description: "Websites cannot be accessed using their domain names.",
        steps: [
          "Check the DNS server configuration.",
          "Run nslookup.",
          "Try another DNS server.",
          "Flush the DNS cache.",
        ],
      },
    ],
  },

  {
    id: 3,
    name: "Windows",
    icon: "🪟",
    topics: [
      {
        id: 5,
        title: "Windows is slow",
        description:
          "The computer takes a long time to open applications or respond.",
        steps: [
          "Check CPU and RAM usage.",
          "Check available disk space.",
          "Disable unnecessary startup applications.",
          "Check for Windows updates.",
          "Check for malware.",
        ],
      },
    ],
  },

  {
    id: 4,
    name: "Printers",
    icon: "🖨️",
    topics: [
      {
        id: 6,
        title: "Printer is offline",
        description:
          "The printer appears offline and cannot receive print jobs.",
        steps: [
          "Check if the printer is powered on.",
          "Check the network or USB connection.",
          "Check the selected printer.",
          "Restart the printer.",
          "Restart the print spooler if necessary.",
        ],
      },
    ],
  },
];

export default function BrowseScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // --------------------------------
  // INFORMATION PAGE
  // --------------------------------

  if (selectedTopic) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-5 pb-4 pt-14">
          <Pressable onPress={() => setSelectedTopic(null)} className="mb-3">
            <Text className="text-base font-semibold text-blue-600">
              ← Back
            </Text>
          </Pressable>

          <Text className="text-2xl font-bold text-gray-900">
            {selectedTopic.title}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {/* Description */}

          <View className="mb-5 rounded-2xl bg-white p-5">
            <Text className="mb-2 text-sm font-semibold uppercase text-gray-400">
              Problem
            </Text>

            <Text className="text-base leading-6 text-gray-700">
              {selectedTopic.description}
            </Text>
          </View>

          {/* Troubleshooting Steps */}

          <Text className="mb-3 text-lg font-bold text-gray-900">
            Troubleshooting Steps
          </Text>

          {selectedTopic.steps.map((step, index) => (
            <View
              key={index}
              className="mb-3 flex-row rounded-2xl bg-white p-4"
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Text className="font-bold text-blue-600">{index + 1}</Text>
              </View>

              <Text className="flex-1 text-base leading-6 text-gray-700">
                {step}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // --------------------------------
  // TOPIC LIST
  // --------------------------------

  if (selectedCategory) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}

        <View className="border-b border-gray-200 bg-white px-5 pb-4 pt-14">
          <Pressable onPress={() => setSelectedCategory(null)} className="mb-3">
            <Text className="text-base font-semibold text-blue-600">
              ← Back
            </Text>
          </Pressable>

          <Text className="text-2xl font-bold text-gray-900">
            {selectedCategory.icon} {selectedCategory.name}
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            Select a troubleshooting topic
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {selectedCategory.topics.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => setSelectedTopic(topic)}
              className="mb-3 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <Text className="text-base font-bold text-gray-900">
                {topic.title}
              </Text>

              <Text className="mt-2 text-sm leading-5 text-gray-500">
                {topic.description}
              </Text>

              <Text className="mt-3 text-sm font-semibold text-blue-600">
                View troubleshooting →
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // --------------------------------
  // CATEGORY PAGE
  // --------------------------------

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <View className="border-b border-gray-200 bg-white px-5 pb-5 pt-14">
        <Text className="text-3xl font-bold text-gray-900">Browse</Text>

        <Text className="mt-1 text-sm text-gray-500">
          Select a category to find troubleshooting guides.
        </Text>
      </View>

      {/* Categories */}

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategory(category)}
            className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white p-5"
          >
            {/* Icon */}

            <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Text className="text-2xl">{category.icon}</Text>
            </View>

            {/* Text */}

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {category.name}
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                {category.topics.length} troubleshooting topic
                {category.topics.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {/* Arrow */}

            <Text className="text-xl text-gray-400">›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
