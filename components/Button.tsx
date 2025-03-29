import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';

import cn from '~/utils/cn';

// Button props
export interface ButtonProps extends TouchableOpacityProps {
  title: React.ReactNode;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

// Button component
export default function Button({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
  className,
  textClassName,
  ...rest
}: ButtonProps) {
  // Gradient colors based on the design
  const gradientColors = ['#943DFF', '#2938DC'];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      className={cn('overflow-hidden rounded-full', disabled && 'opacity-60', className)}
      {...rest}>
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="items-center justify-center ">
        <View className="flex-row items-center justify-center px-6 py-4 ">
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className={cn('text-center text-lg font-semibold text-white', textClassName)}>
              {title}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
