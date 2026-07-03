import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function OngoingTripsScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'trips'), 
      where('driverId', '==', user.uid),
      where('status', '==', 'ongoing')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrips: any[] = [];
      snapshot.forEach((doc) => {
        fetchedTrips.push({ id: doc.id, ...doc.data() });
      });
      setTrips(fetchedTrips);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching ongoing trips:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const endTrip = async (tripId: string) => {
    Alert.alert("End Trip", "Are you sure you have dropped off the passenger?", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        style: 'default',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'trips', tripId), {
              status: 'completed'
            });
            Alert.alert("Trip Completed!", "Great job.");
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        }
      }
    ]);
  };

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
        <Text className="text-3xl font-bold text-white">Ongoing</Text>
      </View>
      
      {trips.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 text-lg">No ongoing trips right now.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-blue-500">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-blue-400 text-xs font-bold uppercase">In Progress</Text>
              </View>
              <Text className="text-white font-bold text-xl mb-3">{item.passengerName}</Text>
              
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
                <Text className="text-slate-300 flex-1">{item.pickupLocation}</Text>
              </View>
              
              <View className="w-0.5 h-4 bg-slate-700 ml-1 mb-2" />
              
              <View className="flex-row items-center mb-6">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                <Text className="text-slate-300 flex-1">{item.dropoffLocation}</Text>
              </View>

              <TouchableOpacity 
                className="bg-blue-600 p-4 rounded-lg items-center"
                onPress={() => endTrip(item.id)}
              >
                <Text className="text-white font-bold text-lg">End Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
