import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from "react-native";

import ImageLoadingIndicator from "./ImageLoadingIndicator";

import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/logo";
import { Generation } from "~/types/generation";
import cn from "~/utils/cn";

type StatusIndicatorProps = {
  status?: "processing" | "done" | "error";
  logoUrl?: string;
  onTryAgain?: () => void;
  latestProject?: Generation | null;
};

export default function StatusIndicator({
  status,
  logoUrl,
  onTryAgain,
  latestProject,
}: StatusIndicatorProps) {
  const handleTryAgain = () => {
    if (onTryAgain) {
      onTryAgain();
    } else {
      router.replace("/");
    }
  };

  if (!status && latestProject) {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={["#3D4CE4", "#9A53F8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <Pressable
          className="w-full"
          onPress={() =>
            router.push({
              pathname: "/output-modal",
              params: { projectId: latestProject.id },
            })
          }>
          {({ pressed }) => (
            <BlurView
              intensity={BLUR_INTENSITY}
              tint="dark"
              className={cn("flex-row p-4", pressed ? "opacity-70" : "opacity-100")}>
              <View className="mr-2 h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/20">
                {latestProject.imageUrl ? (
                  <ImageLoadingIndicator uri={latestProject.imageUrl} resizeMode="contain" />
                ) : (
                  <Text className="font-semibold text-white">✓</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-white">Your Latest Project</Text>
                <Text className="text-sm text-gray-300" numberOfLines={1}>
                  {latestProject.prompt}
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
        <Pressable
          className="w-full"
          onPress={() => {
            if (latestProject?.id) {
              router.push({
                pathname: "/output-modal",
                params: { projectId: latestProject.id },
              });
            } else {
              router.push("/output-modal");
            }
          }}>
          {({ pressed }) => (
            <BlurView
              intensity={BLUR_INTENSITY}
              tint="dark"
              className={cn("flex-row p-4", pressed ? "opacity-70" : "opacity-100")}>
              <View className="mr-2 h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/20">
                {logoUrl ? (
                  <ImageLoadingIndicator uri={logoUrl} resizeMode="contain" />
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
