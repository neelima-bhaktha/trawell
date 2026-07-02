import React from 'react';
import { View, Text } from 'react-native';

export default function AdminDashboard() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-900">
      <Text className="text-3xl font-bold text-white mb-4">Admin Dashboard</Text>
      <Text className="text-slate-400">Welcome to Trawell Fleet Management</Text>
    </View>
  );
}
