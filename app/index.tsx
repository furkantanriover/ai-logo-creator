import { Stack } from 'expo-router';
import { Text } from 'react-native';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'AI Logo' }} />
      <Text>Home</Text>
    </>
  );
}
