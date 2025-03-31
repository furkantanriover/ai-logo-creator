import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
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
import ImageLoadingIndicator from "~/components/ImageLoadingIndicator";
import ProjectStatusIndicator from "~/components/ProjectStatusIndicator";
import SparkleIcon from "~/components/SparkleIcon";
import {
  BLUR_INTENSITY,
  DEFAULT_PROMPT,
  GRADIENT_COLORS,
  LOGO_STYLES,
  MAX_PROMPT_LENGTH,
} from "~/constants/logo";
import { useAuthContext } from "~/context/AuthContext";
import { useGenerateLogo } from "~/hooks/useGenerateLogo";
import { useGeneratePrompt } from "~/hooks/useGeneratePrompt";
import { useProjects } from "~/hooks/useProjects";
import {
  Generation,
  GenerationStatus,
  LogoFormValues,
  LogoStyle,
  LogoStylesSectionProps,
  PreviousProjectsSectionProps,
  ProjectStatusIndicatorSectionProps,
  PromptInputSectionProps,
} from "~/types/generation";
import cn from "~/utils/cn";

export default function LogoGenerator() {
  const { control, handleSubmit, setValue, watch } = useForm<LogoFormValues>({
    defaultValues: {
      prompt: DEFAULT_PROMPT,
      style: "none" as LogoStyle,
    },
  });
  const { user } = useAuthContext();
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();

  const selectedStyle = watch("style");
  const currentPrompt = watch("prompt");

  const { mutate: generatePrompt, isPending: isPromptGenerating } = useGeneratePrompt();
  const {
    mutate: generateLogo,
    isPending: isLogoGenerating,
    isError,
    isSuccess,
    data: logoData,
    reset: resetLogoGeneration,
  } = useGenerateLogo();

  const logoInfo = {
    url: typeof logoData === "object" ? logoData.imageUrl : logoData,
    prompt: typeof logoData === "object" ? logoData.prompt : currentPrompt,
    style: typeof logoData === "object" ? logoData.style : selectedStyle,
  };

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

  const generationStatus: GenerationStatus | undefined = isLogoGenerating
    ? "processing"
    : isSuccess && logoData
      ? "done"
      : isError
        ? "error"
        : undefined;

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
          <ProjectStatusIndicatorSection
            status={generationStatus}
            logoUrl={logoInfo.url}
            onTryAgain={resetLogoGeneration}
          />

          <PreviousProjectsSection
            projects={projects}
            isLoading={isProjectsLoading}
            isGenerating={isLogoGenerating}
            status={generationStatus}
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
            disabled={isLogoGenerating || isPromptGenerating}
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

function LogoStylesSection({ control, selectedStyle }: LogoStylesSectionProps) {
  const renderStyleItem = (style: (typeof LOGO_STYLES)[0]) => (
    <Controller
      key={style.id}
      control={control}
      name="style"
      render={({ field: { onChange } }) => (
        <TouchableOpacity
          className={cn(
            "mr-4 items-center",
            selectedStyle === style.id ? "opacity-100" : "opacity-80"
          )}
          onPress={() => onChange(style.id)}>
          <View
            className={cn(
              "h-[100px] w-[100px] overflow-hidden rounded-3xl",
              selectedStyle === style.id ? "border-2 border-white" : "border border-gray-600",
              style.id === "none" ? "bg-[#1E1836]" : "bg-[#2A2542]"
            )}>
            <Image source={style.image} className="h-full w-full" resizeMode="cover" />
          </View>
          <Text
            className={cn(
              "mt-1 text-center text-[13px]",
              selectedStyle === style.id ? "font-[700px] text-white" : "font-[400px] text-gray-400"
            )}>
            {style.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View className="mb-6">
      <Text className="mb-2 text-[20px] font-[600px] text-white">Logo Styles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {LOGO_STYLES.map(renderStyleItem)}
      </ScrollView>
    </View>
  );
}

function ProjectStatusIndicatorSection({
  status,
  logoUrl,
  onTryAgain,
}: ProjectStatusIndicatorSectionProps) {
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const latestProject = projects.length > 0 ? projects[0] : null;

  if (isProjectsLoading) {
    return (
      <View className="mb-4">
        <View className="overflow-hidden rounded-xl">
          <LinearGradient
            colors={GRADIENT_COLORS.primary as readonly [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute h-full w-full"
          />
          <BlurView intensity={BLUR_INTENSITY} tint="dark" className="flex-row p-4">
            <View className="mr-2 h-10 w-10 animate-pulse rounded-lg bg-white/20" />
            <View className="flex-1">
              <View className="mb-2 h-4 w-36 animate-pulse rounded-md bg-white/20" />
              <View className="h-3 w-24 animate-pulse rounded-md bg-white/20" />
            </View>
          </BlurView>
        </View>
      </View>
    );
  }

  if (!status && !latestProject) {
    return null;
  }

  return (
    <View className="mb-4">
      <ProjectStatusIndicator
        status={status}
        logoUrl={logoUrl}
        onTryAgain={onTryAgain}
        latestProject={latestProject}
      />
    </View>
  );
}

function PreviousProjectsSection({
  projects,
  isLoading,
  isGenerating,
  status,
  onProjectClick,
}: PreviousProjectsSectionProps) {
  if (isGenerating || status === "done" || status === "error") {
    return null;
  }

  if (!projects.length && !isLoading) {
    return null;
  }

  const renderProjectItem = (project: Generation) => (
    <TouchableOpacity
      key={project.id}
      onPress={() => onProjectClick(project)}
      className="mr-3 h-[100px] w-[100px] overflow-hidden rounded-xl">
      <View className="relative h-full w-full">
        <ImageLoadingIndicator uri={project.imageUrl} />
        <View className="absolute bottom-0 w-full bg-black/50 p-2">
          <Text className="text-xs text-white" numberOfLines={1}>
            {project.prompt}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[20px] font-[600px] text-white">Your Projects</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {isLoading
          ? [1, 2, 3, 4].map((item) => (
              <View
                key={item}
                className="mr-3 h-[100px] w-[100px] animate-pulse overflow-hidden rounded-xl bg-gray-800/50"
              />
            ))
          : projects.map(renderProjectItem)}
      </ScrollView>
    </View>
  );
}
