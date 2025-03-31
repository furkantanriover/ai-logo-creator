import { ActivityIndicator, Image, View } from "react-native";
import { useState } from "react";

type ImageLoadingIndicatorProps = {
  uri?: string;
  resizeMode?: "cover" | "contain";
  style?: any;
  className?: string;
  onLoad?: () => void;
};

export default function ImageLoadingIndicator({
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
