import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import Container from "~/components/Container";

import FirebaseImage from "~/components/FirebaseImage";
import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/generation";
import { useProjects } from "~/hooks/useProjects";

// Define project type to match what comes from useProjects
type Project = {
  id: string;
  prompt?: string;
  imageUrl?: string;
  createdAt?: {
    toDate?: () => Date;
  };
  // Add other possible fields
  [key: string]: any;
};

export default function ProjectsScreen() {
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();

  const renderProject = useCallback(({ item, index }: { item: Project; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="w-1/2 p-2">
        <ProjectCard project={item} />
      </Animated.View>
    );
  }, []);

  if (isProjectsLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (projects.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-2 text-center text-lg font-medium text-white">No projects yet</Text>
        <Text className="text-center text-gray-400">Create your first logo to see it here!</Text>
      </View>
    );
  }

  return (
    <Container>
      <Animated.View entering={FadeInRight.springify()} className="mb-4">
        <Text className="text-2xl font-bold text-white">My Projects</Text>
        <Text className="text-gray-400">All your generated logos in one place</Text>
      </Animated.View>

      <FlatList
        data={projects as Project[]}
        renderItem={renderProject}
        keyExtractor={(item: Project) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const handlePress = useCallback(() => {
    router.push({
      pathname: "/output-modal",
      params: { projectId: project.id },
    });
  }, [project.id]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="overflow-hidden rounded-xl"
      activeOpacity={0.8}>
      <LinearGradient
        colors={GRADIENT_COLORS.secondary as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="absolute h-full w-full"
      />
      <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-3">
        <View className="mb-2 aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-black/20">
          {project.imageUrl ? (
            <FirebaseImage uri={project.imageUrl} resizeMode="contain" className="h-full w-full" />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-700">
              <Text className="text-xl font-bold text-white">?</Text>
            </View>
          )}
        </View>
        <Text className="text-sm font-medium text-white" numberOfLines={1}>
          {project.prompt || "Untitled Project"}
        </Text>
        <Text className="text-xs text-gray-400">
          {new Date(project.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}
