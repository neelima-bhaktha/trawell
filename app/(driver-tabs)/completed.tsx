import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function CompletedTripsScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'trips'), 
      where('driverId', '==', user.uid),
      where('status', '==', 'completed')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrips: any[] = [];
      snapshot.forEach((doc) => {
        fetchedTrips.push({ id: doc.id, ...doc.data() });
      });
      setTrips(fetchedTrips);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching completed trips:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900 px-6 pt-10">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-white">History</Text>
      </View>
      
      {trips.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 text-lg">No completed trips yet.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 opacity-80">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-300 font-bold text-lg">{item.passengerName}</Text>
                <Text className="text-emerald-500 font-semibold">Done</Text>
              </View>
              <Text className="text-slate-400 text-sm mb-1">From: {item.pickupLocation}</Text>
              <Text className="text-slate-400 text-sm">To: {item.dropoffLocation}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
