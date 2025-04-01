import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import ImageLoadingIndicator from "./ImageLoadingIndicator";

import { BLUR_INTENSITY } from "~/constants/generation";
import { useLogoStore } from "~/store/logo-store";
import cn from "~/utils/cn";

export default function LatestProjectCard() {
  const { latestProject } = useLogoStore();

  if (!latestProject) {
    return null;
  }

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
