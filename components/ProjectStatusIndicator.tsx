import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from "react-native";

import FirebaseImage from "./FirebaseImage";

import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/generation";
import { useLogoStore } from "~/store/logo-store";
import cn from "~/utils/cn";

type StatusIndicatorProps = {
  onTryAgain?: () => void;
};

export default function StatusIndicator({ onTryAgain }: StatusIndicatorProps) {
  const { currentGeneration, latestProject, resetCurrentGeneration } = useLogoStore();

  const handleTryAgain = () => {
    if (onTryAgain) {
      onTryAgain();
    } else {
      resetCurrentGeneration();
      router.replace("/");
    }
  };

  if (currentGeneration.status === "idle" && latestProject) {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.secondary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full">
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
                intensity={30}
                tint="dark"
                className={cn("flex-row ", pressed ? "opacity-70" : "opacity-100")}>
                <View className=" mr-4 h-20 w-20 items-center justify-center overflow-hidden bg-white/20">
                  {latestProject.imageUrl ? (
                    <FirebaseImage uri={latestProject.imageUrl} resizeMode="contain" />
                  ) : (
                    <Text className="font-semibold text-white">✓</Text>
                  )}
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-base font-medium text-white">Your Latest Project</Text>
                  <Text className="text-sm text-gray-300" numberOfLines={1}>
                    {latestProject.prompt}
                  </Text>
                </View>
              </BlurView>
            )}
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  if (currentGeneration.status === "processing") {
    return (
      <View className="overflow-hidden rounded-xl">
        <BlurView intensity={BLUR_INTENSITY} tint="systemThickMaterialDark" className="flex-row ">
          <ActivityIndicator size="small" color="#fff" className=" mr-4 h-20 w-20 bg-[#18181B]" />
          <View className="flex-1 justify-center">
            <Text className="text-base font-medium text-white">Creating Your Design...</Text>
            <Text className="text-sm text-gray-300">Ready in 2 minutes</Text>
          </View>
        </BlurView>
      </View>
    );
  }

  if (currentGeneration.status === "done") {
    return (
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.secondary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full">
          <Pressable
            className="w-full"
            onPress={() => {
              if (currentGeneration.projectId) {
                router.push({
                  pathname: "/output-modal",
                  params: { projectId: currentGeneration.projectId },
                });
              } else {
                router.push("/output-modal");
              }
            }}>
            {({ pressed }) => (
              <BlurView
                intensity={30}
                tint="dark"
                className={cn("flex-row ", pressed ? "opacity-70" : "opacity-100")}>
                <View className="mr-4 h-20 w-20 items-center justify-center overflow-hidden  bg-white/20">
                  {currentGeneration.logoUrl ? (
                    <FirebaseImage uri={currentGeneration.logoUrl} resizeMode="contain" />
                  ) : (
                    <Text className="font-semibold text-white">✓</Text>
                  )}
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-base font-medium text-white">Your Design is Ready!</Text>
                  <Text className="text-sm text-gray-300">Tap to see it.</Text>
                </View>
              </BlurView>
            )}
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  if (currentGeneration.status === "error") {
    return (
      <View className="overflow-hidden rounded-xl">
        <TouchableOpacity onPress={handleTryAgain} className="w-full">
          <BlurView intensity={BLUR_INTENSITY} tint="systemThickMaterialDark" className="flex-row ">
            <BlurView intensity={BLUR_INTENSITY} tint="extraLight" className="flex-row  ">
              <View className=" h-20 w-20 items-center justify-center bg-[#EF4444B2]/90">
                <Text className="text-2xl text-white">!</Text>
              </View>
            </BlurView>
            <View className="flex-1 justify-center bg-[#EF4444] pl-4">
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
