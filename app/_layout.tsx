import '../global.css';

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../context/AuthContext';
import { QueryClientProvider } from '../providers/QueryClientProvider';

export default function Layout() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#0F0B21',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: '#0F0B21',
              },
            }}
          />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
