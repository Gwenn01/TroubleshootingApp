import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type ConfigStep = {
  id: number;
  title: string;
  description: string;
  command?: string;
  note?: string;
};

type ConfigurationTask = {
  id: number;
  title: string;
  description: string;
  steps: ConfigStep[];
};

type ConfigurationCategory = {
  id: number;
  title: string;
  icon: string;
  tasks: ConfigurationTask[];
};

const configurationData: ConfigurationCategory[] = [
  {
    id: 1,
    title: "Networking",
    icon: "🌐",
    tasks: [
      {
        id: 1,
        title: "Configure IPv4 Address",
        description: "Configure a static IPv4 address on a Windows computer.",
        steps: [
          {
            id: 1,
            title: "Open Network Settings",
            description: "Open Windows Settings and go to Network & Internet.",
            note: "You can also right-click the network icon and open Network Settings.",
          },
          {
            id: 2,
            title: "Open Adapter Options",
            description:
              "Open Advanced Network Settings and select More Network Adapter Options.",
          },
          {
            id: 3,
            title: "Open Ethernet Properties",
            description:
              "Right-click your Ethernet adapter and select Properties.",
          },
          {
            id: 4,
            title: "Open IPv4 Properties",
            description:
              "Select Internet Protocol Version 4 (TCP/IPv4), then click Properties.",
          },
          {
            id: 5,
            title: "Enter IP Information",
            description:
              "Select Use the following IP address and enter the required network information.",
            command:
              "IP Address: 192.168.1.100\nSubnet Mask: 255.255.255.0\nGateway: 192.168.1.1\nDNS: 8.8.8.8",
          },
          {
            id: 6,
            title: "Test the Connection",
            description: "Open Command Prompt and test the gateway.",
            command: "ping 192.168.1.1",
            note: "A successful reply indicates that the computer can reach the gateway.",
          },
        ],
      },

      {
        id: 2,
        title: "Configure DNS",
        description: "Configure a DNS server on a Windows network adapter.",
        steps: [
          {
            id: 1,
            title: "Open Network Adapter Properties",
            description:
              "Open the properties of your Ethernet or Wi-Fi adapter.",
          },
          {
            id: 2,
            title: "Open IPv4 Properties",
            description:
              "Select Internet Protocol Version 4 (TCP/IPv4) and click Properties.",
          },
          {
            id: 3,
            title: "Enter DNS Server",
            description: "Select Use the following DNS server addresses.",
            command: "Preferred DNS: 8.8.8.8\nAlternate DNS: 1.1.1.1",
          },
          {
            id: 4,
            title: "Test DNS",
            description: "Open Command Prompt and test DNS resolution.",
            command: "nslookup google.com",
          },
        ],
      },
    ],
  },

  {
    id: 2,
    title: "Windows",
    icon: "🪟",
    tasks: [
      {
        id: 3,
        title: "Create a Shared Folder",
        description:
          "Create and share a folder with other computers on the network.",
        steps: [
          {
            id: 1,
            title: "Create the Folder",
            description: "Create a new folder that you want to share.",
            command: "C:\\SharedFiles",
          },
          {
            id: 2,
            title: "Open Folder Properties",
            description: "Right-click the folder and select Properties.",
          },
          {
            id: 3,
            title: "Open Sharing",
            description: "Select the Sharing tab and click Advanced Sharing.",
          },
          {
            id: 4,
            title: "Enable Sharing",
            description: "Enable Share this folder and give the share a name.",
            command: "Share name: SharedFiles",
          },
          {
            id: 5,
            title: "Configure Permissions",
            description:
              "Open Permissions and configure which users can access the folder.",
            note: "Use the minimum permissions required for the task.",
          },
          {
            id: 6,
            title: "Test the Shared Folder",
            description:
              "From another computer, open the shared folder using its network path.",
            command: "\\\\PC-NAME\\SharedFiles",
          },
        ],
      },
    ],
  },

  {
    id: 3,
    title: "Active Directory",
    icon: "👥",
    tasks: [
      {
        id: 4,
        title: "Create a User Account",
        description: "Create a new user account in Active Directory.",
        steps: [
          {
            id: 1,
            title: "Open Active Directory Users and Computers",
            description:
              "Open Server Manager or search for Active Directory Users and Computers.",
          },
          {
            id: 2,
            title: "Select the Organizational Unit",
            description:
              "Navigate to the Organizational Unit where the user should be created.",
          },
          {
            id: 3,
            title: "Create the User",
            description:
              "Right-click the Organizational Unit and select New → User.",
          },
          {
            id: 4,
            title: "Enter User Information",
            description:
              "Enter the user's first name, last name, username, and other required information.",
          },
          {
            id: 5,
            title: "Set the Password",
            description:
              "Set the initial password and configure the required password options.",
          },
          {
            id: 6,
            title: "Verify the Account",
            description:
              "Confirm that the new user appears in the correct Organizational Unit.",
          },
        ],
      },
    ],
  },
];

export default function ConfigurationScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<ConfigurationCategory | null>(null);

  const [selectedTask, setSelectedTask] = useState<ConfigurationTask | null>(
    null,
  );

  const [currentStep, setCurrentStep] = useState(0);

  // ==========================================
  // STEP VIEW
  // ==========================================

  if (selectedTask) {
    const step = selectedTask.steps[currentStep];

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === selectedTask.steps.length - 1;

    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}

        <View className="border-b border-gray-200 bg-white px-5 pb-4 pt-14">
          <Pressable
            onPress={() => {
              setSelectedTask(null);
              setCurrentStep(0);
            }}
          >
            <Text className="mb-3 text-base font-semibold text-blue-600">
              ← Back
            </Text>
          </Pressable>

          <Text className="text-2xl font-bold text-gray-900">
            {selectedTask.title}
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            Step {currentStep + 1} of {selectedTask.steps.length}
          </Text>
        </View>

        {/* Progress */}

        <View className="bg-white px-5 pb-4 pt-3">
          <View className="h-2 overflow-hidden rounded-full bg-gray-200">
            <View
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${
                  ((currentStep + 1) / selectedTask.steps.length) * 100
                }%`,
              }}
            />
          </View>
        </View>

        {/* Step Content */}

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 30,
          }}
        >
          {/* Step Number */}

          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
            <Text className="text-xl font-bold text-white">
              {currentStep + 1}
            </Text>
          </View>

          {/* Step Title */}

          <Text className="mb-3 text-2xl font-bold text-gray-900">
            {step.title}
          </Text>

          {/* Description */}

          <View className="mb-5 rounded-2xl bg-white p-5">
            <Text className="text-base leading-6 text-gray-700">
              {step.description}
            </Text>
          </View>

          {/* Command */}

          {step.command && (
            <View className="mb-5 rounded-2xl bg-gray-900 p-5">
              <Text className="mb-2 text-xs font-semibold uppercase text-gray-400">
                Command / Example
              </Text>

              <Text className="font-mono text-sm leading-6 text-green-400">
                {step.command}
              </Text>
            </View>
          )}

          {/* Note */}

          {step.note && (
            <View className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <Text className="mb-1 font-semibold text-yellow-800">Note</Text>

              <Text className="text-sm leading-5 text-yellow-700">
                {step.note}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Navigation */}

        <View className="flex-row gap-3 border-t border-gray-200 bg-white px-5 pb-5 pt-3">
          {!isFirstStep && (
            <Pressable
              onPress={() => setCurrentStep((step) => step - 1)}
              className="flex-1 items-center justify-center rounded-2xl border border-gray-300 py-4"
            >
              <Text className="font-semibold text-gray-700">Previous</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              if (isLastStep) {
                setSelectedTask(null);
                setCurrentStep(0);
              } else {
                setCurrentStep((step) => step + 1);
              }
            }}
            className="flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4"
          >
            <Text className="font-semibold text-white">
              {isLastStep ? "Finish" : "Next Step"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==========================================
  // TASK VIEW
  // ==========================================

  if (selectedCategory) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}

        <View className="border-b border-gray-200 bg-white px-5 pb-5 pt-14">
          <Pressable onPress={() => setSelectedCategory(null)}>
            <Text className="mb-3 text-base font-semibold text-blue-600">
              ← Back
            </Text>
          </Pressable>

          <Text className="text-2xl font-bold text-gray-900">
            {selectedCategory.icon} {selectedCategory.title}
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            Select a configuration task.
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {selectedCategory.tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => {
                setSelectedTask(task);
                setCurrentStep(0);
              }}
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <Text className="text-lg font-bold text-gray-900">
                {task.title}
              </Text>

              <Text className="mt-2 text-sm leading-5 text-gray-500">
                {task.description}
              </Text>

              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-sm text-gray-400">
                  {task.steps.length} steps
                </Text>

                <Text className="font-semibold text-blue-600">Start →</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // CATEGORY VIEW
  // ==========================================

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <View className="border-b border-gray-200 bg-white px-5 pb-5 pt-14">
        <Text className="text-3xl font-bold text-gray-900">Configuration</Text>

        <Text className="mt-1 text-sm text-gray-500">
          Follow step-by-step guides to configure IT systems.
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
        {configurationData.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategory(category)}
            className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white p-5"
          >
            {/* Icon */}

            <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Text className="text-2xl">{category.icon}</Text>
            </View>

            {/* Information */}

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {category.title}
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                {category.tasks.length} configuration task
                {category.tasks.length !== 1 ? "s" : ""}
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
