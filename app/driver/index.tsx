import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TripCard, TripStatus } from '@/components/TripCard';

export default function DriverDashboard() {
  const mockTrips = [
    { id: 'TRP-101', dest: 'Downtown Hub', status: 'Pending' as TripStatus, date: 'Oct 24, 10:00 AM' },
    { id: 'TRP-102', dest: 'Airport Terminal A', status: 'Approved' as TripStatus, date: 'Oct 24, 1:30 PM' },
    { id: 'TRP-103', dest: 'Central Station', status: 'Alert' as TripStatus, date: 'Oct 24, 3:15 PM' },
  ];

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-6 mt-4">
        <Text className="text-text text-3xl font-bold">Your Trips</Text>
        <Text className="text-textMuted mt-1">Manage your upcoming schedules</Text>
      </View>
      
      <View className="flex-col pb-10">
        {mockTrips.map((trip) => (
          <TripCard
            key={trip.id}
            tripId={trip.id}
            destination={trip.dest}
            status={trip.status}
            date={trip.date}
            onPressAction={() => console.log('View', trip.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

