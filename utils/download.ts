import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";

/**
 * Options for downloading and saving an image
 */
interface DownloadImageOptions {
  /**
   * Image URL to download
   */
  imageUrl: string;

  /**
   * Album name to save the image to
   */
  albumName?: string;

  /**
   * Callback to run when download starts
   */
  onStart?: () => void;

  /**
   * Callback to run when download completes
   */
  onComplete?: () => void;

  /**
   * Callback to run when download fails
   */
  onError?: (error: Error) => void;

  /**
   * File name prefix to use (will be appended with timestamp)
   */
  filePrefix?: string;

  /**
   * File extension to use (default: jpg)
   */
  fileExtension?: string;
}

/**
 * Download an image and save it to the device's media library
 */
export const downloadImage = async ({
  imageUrl,
  albumName = "AI Logo Creator",
  onStart,
  onComplete,
  onError,
  filePrefix = "ai-logo",
  fileExtension = "jpg",
}: DownloadImageOptions): Promise<void> => {
  if (!imageUrl) {
    Alert.alert("Error", "No image available to download");
    return;
  }

  try {
    if (onStart) onStart();

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
      if (onComplete) onComplete();
      return;
    }

    // Create a unique filename based on timestamp
    const filename = `${filePrefix}-${Date.now()}.${fileExtension}`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Download the image
    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error("Failed to download image");
    }

    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(fileUri);

    // Create an album if it doesn't exist
    const album = await MediaLibrary.getAlbumAsync(albumName);
    if (album === null) {
      await MediaLibrary.createAlbumAsync(albumName, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    // Delete the temporary file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    Alert.alert("Success", `Logo saved to your device in the '${albumName}' album`);
  } catch (error) {
    console.error("Error downloading image:", error);
    Alert.alert("Error", "Failed to download image. Please try again.");
    if (onError && error instanceof Error) onError(error);
  } finally {
    if (onComplete) onComplete();
  }
};
