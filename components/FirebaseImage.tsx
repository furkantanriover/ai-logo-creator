import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { getFirebaseImageUrl } from "~/utils/firebaseImage";

type FirebaseImageProps = {
  uri?: string;
  resizeMode?: "cover" | "contain";
  style?: any;
  className?: string;
  onLoad?: () => void;
};

export default function FirebaseImage({
  uri,
  resizeMode = "cover",
  style = {},
  className = "h-full w-full",
  onLoad,
}: FirebaseImageProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!uri) {
        setImageUrl(undefined);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const convertedUrl = await getFirebaseImageUrl(uri);
        setImageUrl(convertedUrl);
      } catch (error) {
        console.error("Error loading Firebase image:", error);
        setImageUrl(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [uri]);

  if (!imageUrl && !isLoading) {
    return null;
  }

  return (
    <ImageLoadingIndicator
      uri={imageUrl}
      resizeMode={resizeMode}
      style={style}
      className={className}
      onLoad={onLoad}
    />
  );
}

type ImageLoadingIndicatorProps = {
  uri?: string;
  resizeMode?: "cover" | "contain";
  style?: any;
  className?: string;
  onLoad?: () => void;
};

function ImageLoadingIndicator({
  uri,
  resizeMode = "cover",
  style = {},
  className = "h-full w-full",
  onLoad,
}: ImageLoadingIndicatorProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!uri) {
    return null;
  }

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <View className="h-full w-full items-center justify-center">
      {isLoading && <ActivityIndicator size="small" color="#fff" className="absolute z-10" />}
      <Image
        source={{ uri }}
        className={className}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={() => setIsLoading(true)}
        onLoad={handleLoad}
      />
    </View>
  );
}
