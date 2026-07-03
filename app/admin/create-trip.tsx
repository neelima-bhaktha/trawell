import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateTripScreen() {
  const router = useRouter();
  
  const [passengerName, setPassengerName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApprovedDrivers = async () => {
      try {
        const q = query(collection(db, 'drivers'), where('approvalStatus', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const approvedDrivers: any[] = [];
        querySnapshot.forEach((doc) => {
          approvedDrivers.push({ id: doc.id, ...doc.data() });
        });
        setDrivers(approvedDrivers);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedDrivers();
  }, []);

  const handleCreateTrip = async () => {
    if (!passengerName || !pickup || !dropoff || !selectedDriverId) {
      Alert.alert('Missing Info', 'Please fill out all fields and select a driver.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'trips'), {
        passengerName,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        driverId: selectedDriverId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      Alert.alert('Success', 'Trip assigned to driver successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      <Text className="text-white text-2xl font-bold mb-6">Create New Trip</Text>

      <Text className="text-slate-300 font-semibold mb-2">Passenger Name</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg p-4 mb-4 border border-slate-700"
        placeholder="e.g. John Doe"
        placeholderTextColor="#64748B"
        value={passengerName}
        onChangeText={setPassengerName}
      />

      <Text className="text-slate-300 font-semibold mb-2">Pickup Location</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg p-4 mb-4 border border-slate-700"
        placeholder="e.g. Airport Terminal 1"
        placeholderTextColor="#64748B"
        value={pickup}
        onChangeText={setPickup}
      />

      <Text className="text-slate-300 font-semibold mb-2">Dropoff Location</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg p-4 mb-6 border border-slate-700"
        placeholder="e.g. Taj Hotel"
        placeholderTextColor="#64748B"
        value={dropoff}
        onChangeText={setDropoff}
      />

      <Text className="text-slate-300 font-semibold mb-2">Assign Driver</Text>
      {drivers.length === 0 ? (
        <Text className="text-amber-500 mb-6 bg-amber-500/10 p-4 rounded-lg">
          No approved drivers available. Please approve drivers first.
        </Text>
      ) : (
        <View className="mb-6">
          {drivers.map(driver => (
            <TouchableOpacity 
              key={driver.id}
              className={`p-4 rounded-lg mb-2 border ${selectedDriverId === driver.id ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
              onPress={() => setSelectedDriverId(driver.id)}
            >
              <Text className="text-white font-semibold">Driver ID: {driver.id.substring(0, 8)}</Text>
              <Text className="text-slate-400 text-sm">Status: Available</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity 
        className={`rounded-lg p-4 items-center min-h-[56px] justify-center mt-4 ${submitting || !selectedDriverId ? 'bg-slate-700' : 'bg-emerald-600'}`}
        onPress={handleCreateTrip}
        disabled={submitting || !selectedDriverId}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Create Trip</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
