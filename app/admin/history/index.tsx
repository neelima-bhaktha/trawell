import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../config/firebase';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const HistoryTripCard = ({ trip }: { trip: any }) => {
  const [driverName, setDriverName] = useState('Loading...');
  const [rate, setRate] = useState(trip.billing?.ratePerKm?.toString() || '');
  const [submitting, setSubmitting] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const dSnap = await getDoc(doc(db, 'users', trip.driverId));
        if (dSnap.exists()) {
          setDriverName(dSnap.data().name || 'Unknown Driver');
        } else {
          setDriverName('Unknown Driver');
        }
      } catch (e) {
        setDriverName('Error');
      }
    };
    fetchDriver();
  }, [trip.driverId]);

  const handleSaveBill = async () => {
    if (!rate) {
      Alert.alert('Missing Info', 'Please enter a rate per KM.');
      return;
    }
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum <= 0) {
      Alert.alert('Invalid', 'Enter a valid positive number for rate.');
      return;
    }

    setSubmitting(true);
    try {
      const distance = trip.postTrip?.distance || 0;
      const total = distance * rateNum;

      await updateDoc(doc(db, 'trips', trip.id), {
        billing: {
          ratePerKm: rateNum,
          total: total,
          status: 'generated'
        }
      });
      Alert.alert('Success', `Bill generated for ₹${total.toFixed(2)}`);
      setShowBilling(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
      <View className="flex-row justify-between mb-2 items-center">
        <Text className="text-white font-bold text-lg">{trip.passengerName}</Text>
        <Text className="text-emerald-500 font-bold uppercase text-xs">Completed</Text>
      </View>
      
      <Text className="text-slate-300 font-semibold mb-1">Driver: {driverName}</Text>
      <Text className="text-slate-400 text-xs mb-1">From: {trip.pickupLocation}</Text>
      <Text className="text-slate-400 text-xs mb-4">To: {trip.dropoffLocation}</Text>
      
      <View className="flex-row justify-between bg-slate-900 p-3 rounded-lg mb-4">
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Distance</Text>
          <Text className="text-white font-mono">{trip.postTrip?.distance || 0} KM</Text>
        </View>
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Fuel</Text>
          <Text className="text-white font-mono">{trip.postTrip?.fuelLevel || 'N/A'}</Text>
        </View>
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Bill</Text>
          <Text className={trip.billing ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
            {trip.billing ? `₹${trip.billing.total.toFixed(2)}` : 'Unbilled'}
          </Text>
        </View>
      </View>

      {showBilling ? (
        <View className="bg-slate-700/50 p-4 rounded-lg">
          <Text className="text-slate-300 font-bold mb-2">Generate Invoice</Text>
          <Text className="text-slate-400 text-xs mb-2">Distance: {trip.postTrip?.distance || 0} KM</Text>
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-300 font-bold">Total Bill:</Text>
            <Text className="text-emerald-400 font-bold text-xl">
              ₹{((parseFloat(rate) || 0) * (trip.postTrip?.distance || 0)).toFixed(2)}
            </Text>
          </View>
          
          <Text className="text-slate-400 text-xs mb-1">Rate per KM (₹)</Text>
          <TextInput
            className="bg-slate-900 text-white p-3 rounded-lg border border-slate-600 mb-3"
            placeholder="e.g. 2.50"
            placeholderTextColor="#64748B"
            keyboardType="decimal-pad"
            value={rate}
            onChangeText={setRate}
          />
          
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-slate-600 p-3 rounded-lg items-center mr-2"
              onPress={() => setShowBilling(false)}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-purple-600 p-3 rounded-lg items-center"
              onPress={handleSaveBill}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save Bill</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          className="bg-slate-700 p-3 rounded-lg items-center"
          onPress={() => setShowBilling(true)}
        >
          <Text className="text-slate-200 font-bold">{trip.billing ? 'Edit Bill' : 'Generate Bill'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function AdminHistoryScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const qTrips = query(collection(db, 'trips'), where('status', '==', 'completed'));
    
    const unsubscribe = onSnapshot(qTrips, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      // Sort by completion time if available
      fetched.sort((a, b) => {
        const timeA = a.postTrip?.completedAt?.toMillis() || 0;
        const timeB = b.postTrip?.completedAt?.toMillis() || 0;
        return timeB - timeA; // Descending
      });
      setTrips(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const query = searchQuery.toLowerCase();
    return trips.filter(trip => 
      trip.passengerName?.toLowerCase().includes(query) || 
      trip.pickupLocation?.toLowerCase().includes(query) ||
      trip.dropoffLocation?.toLowerCase().includes(query)
    );
  }, [trips, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-white">Trip History</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <Text className="text-slate-300 font-bold">Back</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4"
          placeholder="Search passenger or location..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filteredTrips.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-slate-500 text-lg text-center">No completed trips match your search.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => <HistoryTripCard trip={item} />}
        />
      )}
    </SafeAreaView>
  );
}
