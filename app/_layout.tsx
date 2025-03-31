import "../global.css";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "../context/AuthContext";
import { QueryClientProvider } from "../providers/QueryClientProvider";

export default function Layout() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <SafeAreaProvider>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: "#0F0B21",
                  },
                  headerTintColor: "#fff",
                  headerTitleStyle: {
                    fontWeight: "bold" as const,
                  },
                  contentStyle: {
                    backgroundColor: "#0F0B21",
                  },
                }}>
                <Stack.Screen name="output-modal" options={OUTPUT_MODAL_OPTIONS} />
              </Stack>
            </SafeAreaProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const OUTPUT_MODAL_OPTIONS = {
  presentation: "modal",
  animation: "fade_from_bottom", // for android
  title: "Generated Logo",
  headerShown: false,
} as const;
