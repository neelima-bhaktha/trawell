import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-trip" options={{ title: 'Create Trip', headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#fff', headerBackVisible: false }} />
      <Stack.Screen name="driver/[id]" options={{ title: 'Review Driver', headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#fff', headerBackVisible: false }} />
      <Stack.Screen name="vehicles" options={{ headerShown: false }} />
    </Stack>
  );
}
