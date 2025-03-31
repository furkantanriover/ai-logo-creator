import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, Image, Text, TouchableOpacity, View, Pressable } from "react-native";

import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/logo";
import { useProjectStore } from "~/store/projectStore";
import cn from "~/utils/cn";

type StatusIndicatorProps = {
  status?: "processing" | "done" | "error";
  logoUrl?: string;
  prompt?: string;
  style?: string;
  onTryAgain?: () => void;
};

export default function StatusIndicator({
  status,
  logoUrl,
  prompt,
  style,
  onTryAgain,
}: StatusIndicatorProps) {
  const { activeProject } = useProjectStore();

  const handleTryAgain = () => {
    if (onTryAgain) {
      onTryAgain();
    } else {
      // Default behavior - navigate back to the input screen
      router.replace("/");
    }
  };

  // If no status is provided but we have an active project, show it
  if (!status && activeProject) {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={["#3D4CE4", "#9A53F8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <Pressable className="w-full" onPress={() => router.push("/output-modal")}>
          {({ pressed }) => (
            <BlurView
              intensity={BLUR_INTENSITY}
              tint="dark"
              className={cn("flex-row p-4", pressed ? "opacity-70" : "opacity-100")}>
              <View className="mr-2 h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/20">
                {activeProject.imageUrl ? (
                  <Image
                    source={{ uri: activeProject.imageUrl }}
                    className="h-full w-full"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="font-semibold text-white">✓</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-white">Your Latest Project</Text>
                <Text className="text-sm text-gray-300" numberOfLines={1}>
                  {activeProject.prompt}
                </Text>
              </View>
            </BlurView>
          )}
        </Pressable>
      </View>
    );
  }

  if (status === "processing") {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.primary as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <BlurView intensity={BLUR_INTENSITY} tint="dark" className="flex-row p-4">
          <ActivityIndicator size="small" color="#fff" className="ml-2 mr-4" />
          <View>
            <Text className="text-base font-medium text-white">Creating Your Design...</Text>
            <Text className="text-sm text-gray-300">Ready in 2 minutes</Text>
          </View>
        </BlurView>
      </View>
    );
  }

  if (status === "done") {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={["#3D4CE4", "#9A53F8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <Pressable className="w-full" onPress={() => router.push("/output-modal")}>
          {({ pressed }) => (
            <BlurView
              intensity={BLUR_INTENSITY}
              tint="dark"
              className={cn("flex-row p-4", pressed ? "opacity-70" : "opacity-100")}>
              <View className="mr-2 h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/20">
                {logoUrl ? (
                  <Image source={{ uri: logoUrl }} className="h-full w-full" resizeMode="contain" />
                ) : (
                  <Text className="font-semibold text-white">✓</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-white">Your Design is Ready!</Text>
                <Text className="text-sm text-gray-300">Tap to see it.</Text>
              </View>
            </BlurView>
          )}
        </Pressable>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={["#E43D3D", "#F85353"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <TouchableOpacity onPress={handleTryAgain} className="w-full">
          <BlurView intensity={BLUR_INTENSITY} tint="dark" className="flex-row p-4">
            <View className="mr-4 h-8 w-8 items-center justify-center">
              <Text className="text-2xl text-white">!</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-white">Oops, something went wrong!</Text>
              <Text className="text-sm text-gray-300">Click to try again.</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
