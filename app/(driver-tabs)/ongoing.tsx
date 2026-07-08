import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const TripCard = ({ item }: { item: any }) => {
  const isPreTrip = item.status === 'ongoing';
  
  const [km, setKm] = useState('');
  const [fuel, setFuel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!km || !fuel) {
      Alert.alert("Missing Info", "Please enter the Odometer reading and Fuel level.");
      return;
    }

    const kmValue = parseInt(km);
    if (isNaN(kmValue)) {
      Alert.alert("Invalid input", "Odometer must be a valid number.");
      return;
    }

    setSubmitting(true);
    try {
      if (isPreTrip) {
        await updateDoc(doc(db, 'trips', item.id), {
          status: 'in-transit',
          preTrip: {
            odometer: kmValue,
            fuelLevel: fuel,
            completedAt: serverTimestamp()
          }
        });
      } else {
        // Post trip
        const startKm = item.preTrip?.odometer || 0;
        if (kmValue <= startKm) {
          Alert.alert("Invalid Odometer", `End KM (${kmValue}) must be greater than Start KM (${startKm}).`);
          setSubmitting(false);
          return;
        }

        const distance = kmValue - startKm;

        await updateDoc(doc(db, 'trips', item.id), {
          status: 'completed',
          postTrip: {
            odometer: kmValue,
            fuelLevel: fuel,
            distance,
            completedAt: serverTimestamp()
          }
        });
        
        // Free the vehicle!
        if (item.vehicleId) {
          await updateDoc(doc(db, 'vehicles', item.vehicleId), {
            status: 'available'
          });
        }
        
        Alert.alert("Trip Completed!", `Total Distance: ${distance} KM.`);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-blue-500">
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`${isPreTrip ? 'text-amber-400' : 'text-blue-400'} text-xs font-bold uppercase`}>
          {isPreTrip ? 'Action Required: Start Trip' : 'In Transit'}
        </Text>
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

      <View className="bg-slate-900 p-4 rounded-lg mb-4">
        <Text className="text-slate-300 font-bold mb-3">{isPreTrip ? 'Pre-Trip Logging' : 'Post-Trip Logging'}</Text>
        
        {!isPreTrip && item.preTrip && (
          <Text className="text-slate-400 text-xs mb-3">Started at {item.preTrip.odometer} KM ({item.preTrip.fuelLevel} Fuel)</Text>
        )}

        <View className="flex-row mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-slate-400 text-xs mb-1">Odometer (KM)</Text>
            <TextInput
              className="bg-slate-800 text-white p-3 rounded-lg border border-slate-700"
              placeholder={isPreTrip ? "e.g. 15000" : "e.g. 15050"}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={km}
              onChangeText={setKm}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-slate-400 text-xs mb-1">Fuel Level</Text>
            <TextInput
              className="bg-slate-800 text-white p-3 rounded-lg border border-slate-700"
              placeholder="e.g. Full, Half"
              placeholderTextColor="#64748B"
              value={fuel}
              onChangeText={setFuel}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity 
        className={`${isPreTrip ? 'bg-emerald-600' : 'bg-blue-600'} p-4 rounded-lg items-center`}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">{isPreTrip ? 'Start Trip' : 'End Trip'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


export default function OngoingTripsScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'trips'), 
      where('driverId', '==', user.uid),
      where('status', 'in', ['ongoing', 'in-transit'])
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
          <Text className="text-slate-500 text-lg">No active trips right now.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => <TripCard item={item} />}
        />
      )}
    </View>
  );
}
