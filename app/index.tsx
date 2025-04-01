import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
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

import Button from "~/components/Button";
import Container from "~/components/Container";
import LogoStylesSection from "~/components/LogoStylesSection";
import PreviousProjects from "~/components/PreviousProjects";
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

  return (
    <Container padded>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "AI Logo",
          headerTitleStyle: { color: "white" },
          headerTintColor: "white",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1">
        <Text className="mb-4 text-center text-xl font-semibold text-white">AI Logo</Text>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProjectStatusIndicator onTryAgain={handleTryAgain} />
          <PreviousProjects
            projects={projects}
            isLoading={isProjectsLoading}
            isGenerating={isLogoGenerating}
            onProjectClick={(project) => {
              router.push({
                pathname: "/output-modal",
                params: { projectId: project.id },
              });
            }}
          />

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
