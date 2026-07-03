import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { auth } from '../../config/firebase';

export default function PendingTripsScreen() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-4">Pending Trips</Text>
      <Text className="text-slate-400 text-center mb-8">
        This is a placeholder for the Driver Dashboard. We haven't built the trips list yet!
      </Text>

      <TouchableOpacity 
        className="bg-slate-800 rounded-lg p-4 w-full items-center min-h-[56px] justify-center mt-4"
        onPress={handleLogout}
      >
        <Text className="text-red-400 font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
