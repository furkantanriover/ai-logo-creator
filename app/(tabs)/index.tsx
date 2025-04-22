import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

import Button from "~/components/Button";
import Container from "~/components/Container";
import FirebaseImage from "~/components/FirebaseImage";
import LogoStylesSection from "~/components/LogoStylesSection";
import ProjectStatusIndicator from "~/components/ProjectStatusIndicator";
import SparkleIcon from "~/components/SparkleIcon";
import {
  BLUR_INTENSITY,
  DEFAULT_PROMPT,
  GRADIENT_COLORS,
  MAX_PROMPT_LENGTH,
} from "~/constants/generation";
import { useAuthContext } from "~/context/AuthContext";
import { useGenerateLogo } from "~/hooks/useGenerateLogo";
import { useGeneratePrompt } from "~/hooks/useGeneratePrompt";
import { useProjects } from "~/hooks/useProjects";
import { useLogoStore } from "~/store/logo-store";
import { LogoFormValues, LogoStyle, PromptInputSectionProps } from "~/types/generation";

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

export default function LogoGenerator() {
  const { control, handleSubmit, setValue, watch } = useForm<LogoFormValues>({
    defaultValues: {
      prompt: DEFAULT_PROMPT,
      style: "none" as LogoStyle,
    },
  });
  const { user } = useAuthContext();
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { currentGeneration, resetCurrentGeneration } = useLogoStore();

  const selectedStyle = watch("style");

  const { mutate: generatePrompt, isPending: isPromptGenerating } = useGeneratePrompt();
  const {
    mutate: generateLogo,
    isPending: isLogoGenerating,
    reset: resetLogoGeneration,
  } = useGenerateLogo();

  const handleSurpriseMe = () => {
    generatePrompt(selectedStyle, {
      onSuccess: (aiPrompt) => aiPrompt && setValue("prompt", aiPrompt),
      onError: (error) => console.error("Error generating prompt:", error),
    });
  };

  const handleCreate = (data: LogoFormValues) => {
    if (!user?.uid) {
      console.error("User not authenticated");
      return;
    }

    generateLogo({
      ...data,
      userId: user.uid,
    });
  };

  const handleTryAgain = () => {
    resetLogoGeneration();
    resetCurrentGeneration();
  };

  const recentProjects = projects.slice(0, 3); // Get most recent 3 projects

  return (
    <Container padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1">
        <Text className="mb-4 text-center text-xl font-semibold text-white">AI Logo Creator</Text>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProjectStatusIndicator onTryAgain={handleTryAgain} />

          {/* Recent Projects Section */}
          {recentProjects.length > 0 && (
            <Animated.View entering={FadeInRight.delay(300).springify()} className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-white">Recent Projects</Text>
                <TouchableOpacity
                  onPress={() => {
                    const tabBarRoute = "projects";
                    // @ts-ignore - Using a direct approach to tab navigation
                    router.navigate({ screen: tabBarRoute });
                  }}
                  className="rounded-full bg-indigo-500/20 px-3 py-1">
                  <Text className="text-xs font-medium text-indigo-400">See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-2 flex-row">
                {recentProjects.map((project, index) => (
                  <Animated.View
                    key={project.id}
                    entering={FadeIn.delay(index * 100)}
                    className="w-40 px-2">
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/output-modal",
                          params: { projectId: project.id },
                        })
                      }
                      activeOpacity={0.8}
                      className="overflow-hidden rounded-xl">
                      <LinearGradient
                        colors={GRADIENT_COLORS.secondary as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="absolute h-full w-full"
                      />
                      <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-3">
                        <View className="mb-2 aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-black/20">
                          {project.imageUrl ? (
                            <View className="h-full w-full overflow-hidden rounded-lg">
                              <View className="h-full w-full bg-black/20" />
                              <View className="absolute h-full w-full items-center justify-center">
                                <View className="h-4/5 w-4/5">
                                  <FirebaseImage
                                    uri={project.imageUrl}
                                    resizeMode="contain"
                                    className="h-full w-full"
                                  />
                                </View>
                              </View>
                            </View>
                          ) : (
                            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                              <Text className="text-lg font-bold text-white">?</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs font-medium text-white" numberOfLines={1}>
                          {project.prompt || "Untitled"}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          <View>
            <PromptInputSection
              control={control}
              onSurpriseMe={handleSurpriseMe}
              isGenerating={isPromptGenerating}
            />

            <LogoStylesSection control={control} selectedStyle={selectedStyle} />
          </View>
        </ScrollView>

        <View className="mt-4">
          <Button
            title={
              <View className="flex-row items-center justify-center">
                {isLogoGenerating ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" className="mr-2" />
                    <Text className="text-lg font-semibold text-white">Loading...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-lg font-semibold text-white">Create</Text>
                    <SparkleIcon size={18} className="ml-2" />
                  </>
                )}
              </View>
            }
            onPress={handleSubmit(handleCreate)}
            disabled={
              isLogoGenerating || isPromptGenerating || currentGeneration.status === "processing"
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

function PromptInputSection({ control, onSurpriseMe, isGenerating }: PromptInputSectionProps) {
  const renderButton = () => (
    <TouchableOpacity
      onPress={onSurpriseMe}
      disabled={isGenerating}
      className="flex-row items-center px-3 py-2">
      {isGenerating ? (
        <ActivityIndicator size="small" color="#fff" className="mr-2" />
      ) : (
        <Text className="mr-2 text-lg">🎲</Text>
      )}
      <Text className="text-sm text-white">{isGenerating ? "Generating..." : "Surprise me"}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[20px] font-[600px] text-white">Enter Your Prompt</Text>
        {renderButton()}
      </View>

      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.primary as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-4">
          <Controller
            control={control}
            name="prompt"
            rules={{
              required: "Prompt is required",
              maxLength: {
                value: MAX_PROMPT_LENGTH,
                message: `Prompt cannot exceed ${MAX_PROMPT_LENGTH} characters`,
              },
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  className="min-h-[100px] text-base text-white"
                  placeholder="Describe your logo idea..."
                  placeholderTextColor="#6b7280"
                  multiline
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {error && <Text className="mt-1 text-red-500">{error.message}</Text>}
                <Text className="mt-2 text-right text-gray-400">
                  {value?.length || 0}/{MAX_PROMPT_LENGTH}
                </Text>
              </>
            )}
          />
        </BlurView>
      </View>
    </View>
  );
}
