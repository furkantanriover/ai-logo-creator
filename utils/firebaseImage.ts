import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Firebase Storage'dan gelen URL'leri kullanılabilir URL'lere dönüştürür
 * @param imageUrl Firestore'da saklanan resim URL'si
 * @returns Kullanılabilir resim URL'si veya undefined
 */
export const getFirebaseImageUrl = async (
  imageUrl: string | undefined
): Promise<string | undefined> => {
  if (!imageUrl) return undefined;

  try {
    // Check if the URL is already a direct Firebase Storage URL
    if (
      imageUrl.startsWith("https://storage.googleapis.com/") ||
      imageUrl.startsWith("https://firebasestorage.googleapis.com/")
    ) {
      // For URLs like "gs://ai-logo-creator-3d687.firebasestorage.app/logos/..."
      if (imageUrl.includes("gs://")) {
        const storagePath = imageUrl.replace("gs://", "");
        const storageRef = ref(storage, storagePath);
        return await getDownloadURL(storageRef);
      }

      return imageUrl;
    }

    // For OpenAI URLs (these should continue to work)
    return imageUrl;
  } catch (error) {
    console.error("Error converting Firebase image URL:", error);
    return undefined;
  }
};
