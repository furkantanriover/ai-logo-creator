import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Container from "~/components/Container";
import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/logo";
import { useProjectStore } from "~/store/projectStore";

export default function OutputModal() {
  const [copied, setCopied] = useState(false);
  const { activeProject } = useProjectStore();

  if (!activeProject) {
    router.replace("/");
    return null;
  }

  const handleClose = () => {
    router.back();
  };

  const copyToClipboard = async () => {
    if (activeProject.prompt) {
      await Clipboard.setStringAsync(activeProject.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Output Modal" }} />
      <Container padded>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        <SafeAreaView className="flex-1">
          <View className="flex-1">
            {/* Header with title and close button */}
            <View className="flex-row items-center justify-between py-4">
              <Text className="text-2xl font-semibold text-white">Your Design</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="mb-5 overflow-hidden rounded-3xl">
              {activeProject.imageUrl ? (
                <Image
                  source={{ uri: activeProject.imageUrl }}
                  className="h-[400px] w-full"
                  resizeMode="contain"
                />
              ) : (
                <View className="h-[300px] w-full items-center justify-center">
                  <Text className="text-gray-400">No image available</Text>
                </View>
              )}
            </View>

            <View className="mb-4">
              <View className="overflow-hidden rounded-xl">
                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute h-full w-full"
                />
                <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-lg font-medium text-white">Prompt</Text>
                    <TouchableOpacity onPress={copyToClipboard} className="flex-row items-center">
                      <Ionicons name="copy-outline" size={18} color="#9ca3af" />
                      <Text className="ml-1 text-gray-400">{copied ? "Copied!" : "Copy"}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-base text-white">{activeProject.prompt}</Text>

                  <View className="mt-3 self-start rounded-full bg-[#FAFAFA]/10 px-4 py-1">
                    <Text className="text-white">{activeProject.style}</Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Container>
    </>
  );
}
