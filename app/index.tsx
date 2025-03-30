import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
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
} from 'react-native';

import AuthStatus from '~/components/AuthStatus';
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
import { useGeneratePrompt } from '~/hooks/useGeneratePrompt';
import {
  LogoFormValues,
  LogoStyle,
  PromptInputSectionProps,
  LogoStylesSectionProps,
} from '~/types/generation';
import cn from '~/utils/cn';

export default function LogoGenerator() {
  const { control, handleSubmit, setValue, watch } = useForm<LogoFormValues>({
    defaultValues: {
      prompt: DEFAULT_PROMPT,
      style: 'none' as LogoStyle,
    },
  });

  const selectedStyle = watch('style');

  const { mutate: generatePrompt, isPending } = useGeneratePrompt();

  const handleSurpriseMe = () => {
    generatePrompt(undefined, {
      onSuccess: (aiPrompt) => {
        if (aiPrompt) {
          setValue('prompt', aiPrompt);
        }
      },
      onError: (error) => {
        console.error('Error generating prompt:', error);
      },
    });
  };

  const handleCreate = (data: LogoFormValues) => {
    console.log('Form submitted with:', data);
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
            <View className="mb-4">
              <AuthStatus />
            </View>

            <PromptInputSection
              control={control}
              onSurpriseMe={handleSurpriseMe}
              isGenerating={isPending}
            />

            <LogoStylesSection control={control} selectedStyle={selectedStyle} />
          </View>
        </ScrollView>

        <View>
          <Button
            title={
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-white">Create</Text>
                <SparkleIcon size={18} className="ml-2" />
              </View>
            }
            onPress={handleSubmit(handleCreate)}
          />
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

function PromptInputSection({ control, onSurpriseMe, isGenerating }: PromptInputSectionProps) {
  return (
    <View>
      <Text className="mb-4 text-center text-xl font-semibold text-white">AI Logo</Text>
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
            {isGenerating ? 'Generating...' : 'Surprise me'}
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
              required: 'Prompt is required',
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
                    'mr-4 items-center',
                    selectedStyle === style.id ? 'opacity-100' : 'opacity-80'
                  )}
                  onPress={() => onChange(style.id)}>
                  <View
                    className={cn(
                      'h-[100px] w-[100px] overflow-hidden rounded-3xl',
                      selectedStyle === style.id
                        ? 'border-2 border-white'
                        : 'border border-gray-600',
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
            </>
          )}
        />
      </ScrollView>
    </View>
  );
}
