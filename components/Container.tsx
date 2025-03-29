import { SafeAreaView, View, ViewProps, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import cn from '~/utils/cn';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  className?: string;
}

export default function Container({
  children,
  padded = true,
  className,
  ...props
}: ContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('~/assets/bg-gradient.png')}
      className="flex-1"
      resizeMode="cover">
      <SafeAreaView className="flex-1">
        <View
          className={cn('flex-1', padded && 'px-6 py-4', className)}
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
          }}
          {...props}>
          {children}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
