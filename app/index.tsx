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
import { useProjectStore } from "~/store/projectStore";
import {
  LogoFormValues,
  LogoStyle,
  PromptInputSectionProps,
  LogoStylesSectionProps,
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
  const { projects, setActiveProject } = useProjectStore();

  const selectedStyle = watch("style");

  const { mutate: generatePrompt, isPending: isPromptGenerating } = useGeneratePrompt();
  const {
    mutate: generateLogo,
    isPending: isLogoGenerating,
    isError,
    isSuccess,
    data: logoUrl,
    reset: resetLogoGeneration,
  } = useGenerateLogo();

  const handleSurpriseMe = () => {
    generatePrompt(selectedStyle, {
      onSuccess: (aiPrompt) => {
        if (aiPrompt) {
          setValue("prompt", aiPrompt);
        }
      },
      onError: (error) => {
        console.error("Error generating prompt:", error);
      },
    });
  };

  const handleCreate = (data: LogoFormValues) => {
    console.log("Form submitted with:", data);

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
  };

  let generationStatus: "processing" | "done" | "error" | undefined = undefined;
  if (isLogoGenerating) {
    generationStatus = "processing";
  } else if (isSuccess && logoUrl) {
    generationStatus = "done";
  } else if (isError) {
    generationStatus = "error";
  }

  const handleProjectClick = (project: any) => {
    setActiveProject(project);
    router.push("/output-modal");
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
        <ScrollView className="flex-1">
          <ProjectStatusIndicatorSection
            status={generationStatus}
            logoUrl={typeof logoUrl === "object" ? logoUrl.imageUrl : logoUrl}
            prompt={typeof logoUrl === "object" ? logoUrl.prompt : watch("prompt")}
            style={typeof logoUrl === "object" ? logoUrl.style : watch("style")}
            onTryAgain={handleTryAgain}
          />
          <PreviousProjectsSection
            projects={projects}
            isGenerating={isLogoGenerating}
            status={generationStatus}
            onProjectClick={handleProjectClick}
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

        <View>
          {!isLogoGenerating && (
            <Button
              title={
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-white">Create</Text>
                  <SparkleIcon size={18} className="ml-2" />
                </View>
              }
              onPress={handleSubmit(handleCreate)}
              disabled={isPromptGenerating}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

function PromptInputSection({ control, onSurpriseMe, isGenerating }: PromptInputSectionProps) {
  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-semibold text-white">Enter Your Prompt</Text>
        <TouchableOpacity
          onPress={onSurpriseMe}
          disabled={isGenerating}
          className="flex-row items-center px-3 py-2">
          {isGenerating ? (
            <ActivityIndicator size="small" color="#fff" className="mr-2" />
          ) : (
            <Text className="mr-2 text-lg">🎲</Text>
          )}
          <Text className="text-sm text-white">
            {isGenerating ? "Generating..." : "Surprise me"}
          </Text>
        </TouchableOpacity>
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
  return (
    <View className="mb-6">
      <Text className="mb-2 text-xl font-semibold text-white">Logo Styles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        <Controller
          control={control}
          name="style"
          render={({ field: { onChange } }) => (
            <>
              {LOGO_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  className={cn(
                    "mr-4 items-center",
                    selectedStyle === style.id ? "opacity-100" : "opacity-80"
                  )}
                  onPress={() => onChange(style.id)}>
                  <View
                    className={cn(
                      "h-[100px] w-[100px] overflow-hidden rounded-3xl",
                      selectedStyle === style.id
                        ? "border-2 border-white"
                        : "border border-gray-600",
                      style.id === "none" ? "bg-[#1E1836]" : "bg-[#2A2542]"
                    )}>
                    <Image source={style.image} className="h-full w-full" resizeMode="cover" />
                  </View>
                  <Text
                    className={cn(
                      "mt-1 text-center text-[13px]",
                      selectedStyle === style.id
                        ? "font-[700px] text-white"
                        : "font-[400px] text-gray-400"
                    )}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        />
      </ScrollView>
    </View>
  );
}

type ProjectStatusIndicatorSectionProps = {
  status?: "processing" | "done" | "error";
  logoUrl?: string;
  prompt?: string;
  style?: string;
  onTryAgain?: () => void;
};

function ProjectStatusIndicatorSection({
  status,
  logoUrl,
  prompt,
  style,
  onTryAgain,
}: ProjectStatusIndicatorSectionProps) {
  return (
    <View className="mb-4">
      <ProjectStatusIndicator
        status={status}
        logoUrl={logoUrl}
        prompt={prompt}
        style={style}
        onTryAgain={onTryAgain}
      />
    </View>
  );
}

type PreviousProjectsSectionProps = {
  projects: any[];
  isGenerating?: boolean;
  status?: "processing" | "done" | "error";
  onProjectClick: (project: any) => void;
};

function PreviousProjectsSection({
  projects,
  isGenerating,
  status,
  onProjectClick,
}: PreviousProjectsSectionProps) {
  if (projects.length === 0 || isGenerating || status === "done" || status === "error") {
    return null;
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold text-white">Your Projects</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            onPress={() => onProjectClick(project)}
            className="mr-3 h-[120px] w-[120px] overflow-hidden rounded-xl">
            <View className="relative h-full w-full">
              <Image
                source={{ uri: project.imageUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 w-full bg-black/50 p-2">
                <Text className="text-xs text-white" numberOfLines={1}>
                  {project.prompt}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
