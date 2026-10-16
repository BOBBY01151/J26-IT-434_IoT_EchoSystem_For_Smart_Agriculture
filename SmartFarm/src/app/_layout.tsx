import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/theme';

/**
 * Root layout — wraps the entire app.
 * Expo Router uses this file to configure the navigation stack.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        {/* The tab group — no header here since each tab manages its own */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Full-screen notifications page */}
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            headerStyle: { backgroundColor: Colors.appBackground },
            headerTintColor: Colors.mainText,
            headerShadowVisible: false,
            headerBackTitle: 'Back',
          }}
        />

        {/* Informational disease analysis details */}
        <Stack.Screen
          name="disease-result"
          options={{
            title: 'Model Specs',
            headerStyle: { backgroundColor: Colors.appBackground },
            headerTintColor: Colors.mainText,
            headerShadowVisible: false,
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
