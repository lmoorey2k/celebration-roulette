import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { RestaurantProvider } from '@/context/RestaurantContext';

export default function RootLayout() {
  return (
    <RestaurantProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Colors.backgroundAlt },
        }}
      >
        {/* Home: machine has its own header, no nav bar */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        {/* List screen: Visit Celebration green header matching the app shell */}
        <Stack.Screen
          name="list"
          options={{
            title: 'Manage Restaurants',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700', color: '#FFFFFF' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Not Found' }}
        />
      </Stack>
    </RestaurantProvider>
  );
}
