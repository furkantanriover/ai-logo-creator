import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '~/components/Button';
import Container from '~/components/Container';
import SparkleIcon from '~/components/SparkleIcon';
import {
  BLUR_INTENSITY,
  DEFAULT_PROMPT,
  GRADIENT_COLORS,
  LOGO_STYLES,
  MAX_PROMPT_LENGTH,
} from '~/constants/logo';
import { Generation, LogoStyle } from '~/types/generation';
import cn from '~/utils/cn';

export default function LogoGenerator() {
  const [generation, setGeneration] = useState<Partial<Generation>>({
    prompt: DEFAULT_PROMPT,
    style: 'none',
    status: 'processing',
  });

  const updateGeneration = (updates: Partial<Generation>) => {
    setGeneration((prev) => ({ ...prev, ...updates }));
  };

  const handleSurpriseMe = () => {
    updateGeneration({ prompt: DEFAULT_PROMPT });
  };

  const handleCreate = () => {
    router.push('/output');
  };

  return (
    <Container padded>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'AI Logo',
          headerTitleStyle: { color: 'white' },
          headerTintColor: 'white',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1">
          <View>
            <PromptInputSection
              prompt={generation.prompt}
              onPromptChange={(text) => updateGeneration({ prompt: text })}
              onSurpriseMe={handleSurpriseMe}
            />

            <LogoStylesSection
              selectedStyle={generation.style}
              onStyleSelect={(style) => updateGeneration({ style })}
            />
          </View>
        </ScrollView>

        {/* Create Button - Fixed at bottom */}
        <View>
          <Button
            title={
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-white">Create</Text>
                <SparkleIcon size={18} className="ml-2" />
              </View>
            }
            onPress={handleCreate}
          />
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

interface PromptInputSectionProps {
  prompt?: string;
  onPromptChange: (text: string) => void;
  onSurpriseMe: () => void;
}

function PromptInputSection({ prompt, onPromptChange, onSurpriseMe }: PromptInputSectionProps) {
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-white">Enter Your Prompt</Text>
        <TouchableOpacity
          onPress={onSurpriseMe}
          className="rounded-full border border-gray-400 bg-transparent px-2 py-1">
          <Text className="text-sm text-white">Surprise me</Text>
        </TouchableOpacity>
      </View>

      <View className="overflow-hidden rounded-xl">
        <LinearGradient
          colors={GRADIENT_COLORS.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute h-full w-full"
        />
        <BlurView intensity={BLUR_INTENSITY} tint="dark" className="p-4">
          <TextInput
            className="min-h-[100px] text-base text-white"
            placeholder="Describe your logo idea..."
            placeholderTextColor="#6b7280"
            multiline
            value={prompt}
            onChangeText={onPromptChange}
          />
          <Text className="mt-2 text-right text-gray-400">
            {prompt?.length || 0}/{MAX_PROMPT_LENGTH}
          </Text>
        </BlurView>
      </View>
    </View>
  );
}

interface LogoStylesSectionProps {
  selectedStyle?: LogoStyle;
  onStyleSelect: (style: LogoStyle) => void;
}

function LogoStylesSection({ selectedStyle, onStyleSelect }: LogoStylesSectionProps) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-xl font-semibold text-white">Logo Styles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {LOGO_STYLES.map((style) => (
          <TouchableOpacity
            key={style.id}
            className={cn(
              'mr-4 items-center',
              selectedStyle === style.id ? 'opacity-100' : 'opacity-80'
            )}
            onPress={() => onStyleSelect(style.id)}>
            <View
              className={cn(
                'h-[100px] w-[100px] overflow-hidden rounded-3xl',
                selectedStyle === style.id ? 'border-2 border-white' : 'border border-gray-600',
                style.id === 'none' ? 'bg-[#1E1836]' : 'bg-[#2A2542]'
              )}>
              <Image source={style.image} className="h-full w-full" resizeMode="cover" />
            </View>
            <Text
              className={cn(
                'mt-1 text-center text-[13px]',
                selectedStyle === style.id
                  ? 'font-[700px] text-white'
                  : 'font-[400px] text-gray-400'
              )}>
              {style.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
