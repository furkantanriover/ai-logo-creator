import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from "react-native";

import FirebaseImage from "./FirebaseImage";

import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/generation";
import { useProjects } from "~/hooks/useProjects";
import { useLogoStore } from "~/store/logo-store";
import cn from "~/utils/cn";

type StatusIndicatorProps = {
  onTryAgain?: () => void;
};

// Define types for better type safety
type Project = {
  id: string;
  prompt: string;
  imageUrl?: string;
};

type Generation = {
  status: "idle" | "processing" | "done" | "error";
  projectId?: string;
  logoUrl?: string;
};

export default function ProjectStatusIndicator({ onTryAgain }: StatusIndicatorProps) {
  const { currentGeneration, latestProject, resetCurrentGeneration } = useLogoStore();
  const { isLoading: isProjectsLoading } = useProjects();

  const handleTryAgain = useCallback(() => {
    if (onTryAgain) {
      onTryAgain();
    } else {
      resetCurrentGeneration();
      router.replace("/");
    }
  }, [onTryAgain, resetCurrentGeneration]);

  // Use useMemo to determine which component to render
  const statusComponent = useMemo(() => {
    if (isProjectsLoading) {
      return <LoadingIndicator />;
    }

    if (currentGeneration.status === "idle" && latestProject && "id" in latestProject) {
      return <LatestProject project={latestProject as Project} />;
    }

    if (currentGeneration.status === "processing") {
      return <ProcessingIndicator />;
    }

    if (currentGeneration.status === "done") {
      return <CompletedProject generation={currentGeneration} />;
    }

    if (currentGeneration.status === "error") {
      return <ErrorIndicator onTryAgain={handleTryAgain} />;
    }

    return null;
  }, [isProjectsLoading, currentGeneration, latestProject, handleTryAgain]);

  return statusComponent;
}

type StatusContainerProps = {
  gradientColors?: readonly [string, string] | [string, string, ...string[]];
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  onPress?: () => void;
  blurIntensity?: number;
  blurTint?: "dark" | "light" | "default" | "systemThickMaterialDark" | "extraLight";
  customBackground?: string;
};

const defaultGradientConfig = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

const StatusContainer = React.memo(function StatusContainer({
  gradientColors,
  leftContent,
  title,
  subtitle,
  onPress,
  blurIntensity = BLUR_INTENSITY,
  blurTint = "dark",
  customBackground,
}: StatusContainerProps) {
  const content = useMemo(
    () => (
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        className={cn("flex-row", onPress ? "w-full" : "")}>
        <View className={cn("mr-4 h-20 w-20 items-center justify-center", customBackground || "")}>
          {leftContent}
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-base font-medium text-white">{title}</Text>
          <Text className="text-sm text-gray-300" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </BlurView>
    ),
    [blurIntensity, blurTint, onPress, customBackground, leftContent, title, subtitle]
  );

  const renderPressableContent = useCallback(
    ({ pressed }: { pressed: boolean }) => (
      <View className={cn(pressed ? "opacity-70" : "opacity-100")}>{content}</View>
    ),
    [content]
  );

  return (
    <View className="mb-4 overflow-hidden rounded-xl">
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          {...defaultGradientConfig}
          className="absolute h-full w-full">
          {onPress ? (
            <Pressable className="w-full" onPress={onPress}>
              {renderPressableContent}
            </Pressable>
          ) : (
            content
          )}
        </LinearGradient>
      ) : onPress ? (
        <TouchableOpacity onPress={onPress} className="w-full">
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
});

// Memoize individual indicator components
const LoadingIndicator = React.memo(function LoadingIndicator() {
  return (
    <StatusContainer
      gradientColors={GRADIENT_COLORS.primary as readonly [string, string]}
      leftContent={<View className="mr-2 h-10 w-10 animate-pulse rounded-lg bg-white/20" />}
      title={<View className="mb-2 h-4 w-36 animate-pulse rounded-md bg-white/20" />}
      subtitle={<View className="h-3 w-24 animate-pulse rounded-md bg-white/20" />}
    />
  );
});

const LatestProject = React.memo(function LatestProject({ project }: { project: Project }) {
  const handlePress = useCallback(() => {
    router.push({
      pathname: "/output-modal",
      params: { projectId: project.id },
    });
  }, [project.id]);

  return (
    <StatusContainer
      gradientColors={GRADIENT_COLORS.secondary as [string, string, ...string[]]}
      leftContent={
        project.imageUrl ? (
          <FirebaseImage uri={project.imageUrl} resizeMode="contain" />
        ) : (
          <Text className="font-semibold text-white">✓</Text>
        )
      }
      title="Your Latest Project"
      subtitle={project.prompt}
      onPress={handlePress}
      blurIntensity={30}
    />
  );
});

const ProcessingIndicator = React.memo(function ProcessingIndicator() {
  return (
    <StatusContainer
      leftContent={<ActivityIndicator size="small" color="#fff" />}
      title="Creating Your Design..."
      subtitle="Ready in 2 minutes"
      blurTint="systemThickMaterialDark"
      customBackground="bg-[#18181B]"
    />
  );
});

const CompletedProject = React.memo(function CompletedProject({
  generation,
}: {
  generation: Generation;
}) {
  const handlePress = useCallback(() => {
    if (generation.projectId) {
      router.push({
        pathname: "/output-modal",
        params: { projectId: generation.projectId },
      });
    } else {
      router.push("/output-modal");
    }
  }, [generation.projectId]);

  return (
    <StatusContainer
      gradientColors={GRADIENT_COLORS.secondary as [string, string, ...string[]]}
      leftContent={
        generation.logoUrl ? (
          <FirebaseImage uri={generation.logoUrl} resizeMode="contain" />
        ) : (
          <Text className="font-semibold text-white">✓</Text>
        )
      }
      title="Your Design is Ready!"
      subtitle="Tap to see it."
      onPress={handlePress}
      blurIntensity={30}
    />
  );
});

const ErrorIndicator = React.memo(function ErrorIndicator({
  onTryAgain,
}: {
  onTryAgain: () => void;
}) {
  return (
    <StatusContainer
      leftContent={<Text className="text-2xl text-white">!</Text>}
      title="Oops, something went wrong!"
      subtitle="Click to try again."
      onPress={onTryAgain}
      blurTint="systemThickMaterialDark"
      customBackground="bg-[#EF4444B2]/90"
    />
  );
});
