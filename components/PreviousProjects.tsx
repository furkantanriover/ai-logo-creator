import { FlashList } from "@shopify/flash-list";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import FirebaseImage from "./FirebaseImage";

import { useLogoStore } from "~/store/logo-store";
import { Generation } from "~/types/generation";

const ProjectItem = memo(({ project, onPress }: { project: Generation; onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 h-[100px] w-[100px] overflow-hidden rounded-xl">
      <View className="relative h-full w-full">
        <FirebaseImage uri={project.imageUrl} />
        <View className="absolute bottom-0 w-full bg-black/50 p-2">
          <Text className="text-xs text-white" numberOfLines={1}>
            {project.prompt}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const LoadingPlaceholder = memo(() => (
  <View className="mr-3 h-[100px] w-[100px] animate-pulse overflow-hidden rounded-xl bg-gray-800/50" />
));

type PreviousProjectsProps = {
  projects: Generation[];
  isLoading: boolean;
  isGenerating: boolean;
  onProjectClick: (project: Generation) => void;
};

export default function PreviousProjects({
  projects,
  isLoading,
  isGenerating,
  onProjectClick,
}: PreviousProjectsProps) {
  const { currentGeneration } = useLogoStore();

  if (isGenerating || currentGeneration.status === "processing") {
    return null;
  }

  if (!projects.length && !isLoading) {
    return null;
  }

  const renderItem = ({ item }: { item: Generation }) => (
    <ProjectItem project={item} onPress={() => onProjectClick(item)} />
  );

  const renderLoadingItem = ({ index }: { index: number }) => <LoadingPlaceholder />;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[20px] font-[600px] text-white">Your Projects</Text>

      {isLoading ? (
        <View style={{ height: 100 }}>
          <FlashList
            data={[1, 2, 3, 4]}
            renderItem={renderLoadingItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={100}
          />
        </View>
      ) : (
        <View style={{ height: 100 }}>
          <FlashList
            data={projects}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={100}
          />
        </View>
      )}
    </View>
  );
}
