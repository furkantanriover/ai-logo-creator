import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useState } from "react";
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from "react-native";

import Container from "~/components/Container";
import ImageLoadingIndicator from "~/components/ImageLoadingIndicator";
import { BLUR_INTENSITY, GRADIENT_COLORS } from "~/constants/logo";
import { useProjectById } from "~/hooks/useProjectById";

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View className="flex-row items-center justify-between pb-4 pt-2">
      <Text className="text-2xl font-semibold text-white">{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

function ModalLayout({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <Container>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      <View className="flex-1">
        <Header title="Your Design" onClose={onClose} />
        {children}
      </View>
    </Container>
  );
}

export default function OutputModal() {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { data: project, isLoading, isError } = useProjectById(projectId);

  const handleClose = () => {
    router.back();
  };

  const copyToClipboard = async () => {
    if (project?.prompt) {
      await Clipboard.setStringAsync(project.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadLogo = async () => {
    if (!project?.imageUrl) {
      Alert.alert("Error", "No image available to download");
      return;
    }

    try {
      setDownloading(true);

      // Request permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== MediaLibrary.PermissionStatus.GRANTED) {
        Alert.alert("Permission Denied", "We need permission to save images to your device.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            onPress: () => MediaLibrary.requestPermissionsAsync(),
          },
        ]);
        setDownloading(false);
        return;
      }

      // Create a unique filename based on the timestamp and project ID
      const filename = `ai-logo-${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(project.imageUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error("Failed to download image");
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);

      // Create an album if it doesn't exist
      const album = await MediaLibrary.getAlbumAsync("AI Logo Creator");
      if (album === null) {
        await MediaLibrary.createAlbumAsync("AI Logo Creator", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Delete the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });

      Alert.alert("Success", "Logo saved to your device in the 'AI Logo Creator' album");
    } catch (error) {
      console.error("Error downloading logo:", error);
      Alert.alert("Error", "Failed to download logo. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <ModalLayout onClose={handleClose}>
        <View className="mb-5 overflow-hidden rounded-3xl bg-gray-800/50">
          <View className="h-[400px] w-full items-center justify-center">
            <View className="h-20 w-20 items-center justify-center">
              <ActivityIndicator size="large" color="#fff" />
            </View>
          </View>
        </View>

        <PromptSkeleton />
      </ModalLayout>
    );
  }

  if (isError || !project) {
    return (
      <ModalLayout onClose={handleClose}>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={48} color="#ff4d4d" />
          <Text className="mt-4 text-lg text-white">Error loading project</Text>
          <TouchableOpacity onPress={handleClose} className="mt-4 rounded-lg bg-white/10 px-4 py-2">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ModalLayout>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <ModalLayout onClose={handleClose}>
        <View className="mb-5 overflow-hidden rounded-3xl">
          {project.imageUrl ? (
            <View className="relative h-[400px] w-full">
              <ImageLoadingIndicator
                uri={project.imageUrl}
                resizeMode="contain"
                className="h-full w-full"
              />

              {/* Bottom action bar with blur effect */}
              <BlurView
                intensity={BLUR_INTENSITY}
                tint="dark"
                className="absolute bottom-0 left-0 right-0 overflow-hidden"
                style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
                <TouchableOpacity
                  onPress={downloadLogo}
                  disabled={downloading}
                  className="flex-row items-center justify-center p-4"
                  activeOpacity={0.7}>
                  <View className="flex-row items-center">
                    {downloading ? (
                      <ActivityIndicator size="small" color="#fff" className="mr-3" />
                    ) : (
                      <View className="mr-3 rounded-full bg-white/20 p-2">
                        <Ionicons name="download-outline" size={20} color="#fff" />
                      </View>
                    )}
                    <View>
                      <Text className="text-base font-medium text-white">
                        {downloading ? "Downloading..." : "Save to Device"}
                      </Text>
                      <Text className="text-xs text-gray-300">
                        {downloading ? "Please wait" : "Store this logo in your gallery"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </BlurView>
            </View>
          ) : (
            <View className="h-[300px] w-full items-center justify-center bg-gray-800/30">
              <Ionicons name="image-outline" size={48} color="#ffffff80" />
              <Text className="mt-2 text-gray-400">No image available</Text>
            </View>
          )}
        </View>

        <PromptCard
          prompt={project.prompt}
          style={project.style}
          onCopy={copyToClipboard}
          copied={copied}
        />
      </ModalLayout>
    </>
  );
}

function PromptCard({
  prompt,
  style,
  onCopy,
  copied,
}: {
  prompt: string;
  style: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <View className="mb-4">
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-white">Prompt</Text>
            <TouchableOpacity onPress={onCopy} className="flex-row items-center">
              <Ionicons name="copy-outline" size={18} color="#9ca3af" />
              <Text className="ml-1 text-gray-400">{copied ? "Copied!" : "Copy"}</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-base text-white">{prompt}</Text>

          <View className="mt-3 self-start rounded-full bg-[#FAFAFA]/10 px-4 py-1">
            <Text className="text-white">{style}</Text>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

function PromptSkeleton() {
  return (
    <View className="mb-4">
      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-white">Prompt</Text>
            <View className="h-6 w-16 animate-pulse rounded bg-white/10" />
          </View>

          <View className="space-y-2">
            <View className="h-4 w-full animate-pulse rounded bg-white/10" />
            <View className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <View className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
          </View>

          <View className="mt-3 h-6 w-20 animate-pulse self-start rounded-full bg-white/10" />
        </BlurView>
      </View>
    </View>
  );
}
