import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function DriverTabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB', // Blue 600 as per PRD
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: '#0F172A' }, // Slate 900
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0F172A' },
        tabBarInactiveTintColor: '#94A3B8',
      }}>
      <Tabs.Screen
        name="pending"
        options={{
          title: 'Pending',
          tabBarIcon: ({ color }: { color: any }) => (
            <SymbolView
              name={Platform.OS === 'ios' ? 'clock' : 'clock' as any}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ongoing"
        options={{
          title: 'On-going',
          tabBarIcon: ({ color }: { color: any }) => (
            <SymbolView
              name={Platform.OS === 'ios' ? 'car' : 'car' as any}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: 'Completed',
          tabBarIcon: ({ color }: { color: any }) => (
            <SymbolView
              name={Platform.OS === 'ios' ? 'checkmark.circle' : 'checkmark.circle' as any}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}
