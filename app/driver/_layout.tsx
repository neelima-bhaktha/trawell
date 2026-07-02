import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Driver Dashboard' }} />
    </Stack>
  );
}
