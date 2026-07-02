import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type TripStatus = 'Pending' | 'Approved' | 'Completed' | 'Rejected' | 'Alert';

export interface TripCardProps {
  tripId: string;
  destination: string;
  status: TripStatus;
  date: string;
  onPressAction?: () => void;
}

export function TripCard({ tripId, destination, status, date, onPressAction }: TripCardProps) {
  // Determine status color classes
  let statusColorClass = 'text-textMuted';
  if (status === 'Approved' || status === 'Completed') {
    statusColorClass = 'text-success';
  } else if (status === 'Pending') {
    statusColorClass = 'text-pending';
  } else if (status === 'Rejected' || status === 'Alert') {
    statusColorClass = 'text-alert';
  }

  return (
    <View className="bg-card p-4 rounded-xl shadow-md my-2 border border-slate-700 w-full">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-text font-bold text-lg">{destination}</Text>
        <Text className={`font-semibold ${statusColorClass}`}>{status}</Text>
      </View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-textMuted text-sm">ID: {tripId}</Text>
        <Text className="text-textMuted text-sm">{date}</Text>
      </View>
      <TouchableOpacity 
        className="bg-primary py-3 rounded-lg flex-row justify-center items-center"
        onPress={onPressAction}
      >
        <Text className="text-text font-bold">View Details</Text>
      </TouchableOpacity>
    </View>
  );
}
