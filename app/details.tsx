import { Stack } from 'expo-router';
import { Text } from 'react-native';

export default function Details() {
  return (
    <>
      <Stack.Screen options={{ title: 'Details' }} />
      <Text>Details</Text>
    </>
  );
}
