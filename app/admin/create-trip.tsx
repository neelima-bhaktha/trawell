import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, LogBox } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

export default function CreateTripScreen() {
  const router = useRouter();

  const [passengerName, setPassengerName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  const [pickupResults, setPickupResults] = useState<any[]>([]);
  const [dropoffResults, setDropoffResults] = useState<any[]>([]);

  const fetchPlaces = async (text: string, setResults: any) => {
    if (text.length < 2) {
      setResults([]);
      return;
    }
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${apiKey}&language=en`);
      const data = await res.json();
      if (data.status === 'OK') {
        setResults(data.predictions);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch drivers
        const qDrivers = query(collection(db, 'drivers'), where('approvalStatus', '==', 'approved'));
        const driverSnapshot = await getDocs(qDrivers);
        const approvedDrivers: any[] = [];
        
        for (const driverDoc of driverSnapshot.docs) {
          const driverData = driverDoc.data();
          const userDocSnap = await getDoc(doc(db, 'users', driverDoc.id));
          const userData = userDocSnap.exists() ? userDocSnap.data() : {};
          
          approvedDrivers.push({ 
            id: driverDoc.id, 
            name: userData.name || 'Unknown Driver',
            ...driverData 
          });
        }
        setDrivers(approvedDrivers);

        // Fetch available vehicles
        const qVehicles = query(collection(db, 'vehicles'), where('status', '==', 'available'));
        const vehicleSnapshot = await getDocs(qVehicles);
        const availableVehicles: any[] = [];
        vehicleSnapshot.forEach((doc) => {
          availableVehicles.push({ id: doc.id, ...doc.data() });
        });
        setVehicles(availableVehicles);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateTrip = async () => {
    if (!passengerName || !pickup || !dropoff || !selectedDriverId || !selectedVehicleId) {
      Alert.alert('Missing Info', 'Please fill out all fields, and select a driver and vehicle.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'trips'), {
        passengerName,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        driverId: selectedDriverId,
        vehicleId: selectedVehicleId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Update vehicle status to in-trip
      await updateDoc(doc(db, 'vehicles', selectedVehicleId), {
        status: 'in-trip'
      });

      Alert.alert('Success', 'Trip assigned successfully!');
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
    <ScrollView
      className="flex-1 bg-slate-900"
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
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
      <View className="z-50 mb-4">
        <TextInput
          className="bg-slate-800 text-white rounded-lg p-4 border border-slate-700 w-full"
          placeholder="e.g. Airport Terminal 1"
          placeholderTextColor="#64748B"
          value={pickup}
          onChangeText={(text) => {
            setPickup(text);
            fetchPlaces(text, setPickupResults);
          }}
        />
        {pickupResults.length > 0 && (
          <View className="bg-slate-800 rounded-lg mt-1 border border-slate-700 max-h-48">
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {pickupResults.map((item, index) => (
                <TouchableOpacity
                  key={item.place_id}
                  className={`p-4 ${index < pickupResults.length - 1 ? 'border-b border-slate-700' : ''}`}
                  onPress={() => {
                    setPickup(item.description);
                    setPickupResults([]);
                  }}
                >
                  <Text className="text-slate-200">{item.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <Text className="text-slate-300 font-semibold mb-2">Dropoff Location</Text>
      <View className="z-40 mb-6">
        <TextInput
          className="bg-slate-800 text-white rounded-lg p-4 border border-slate-700 w-full"
          placeholder="e.g. Taj Hotel"
          placeholderTextColor="#64748B"
          value={dropoff}
          onChangeText={(text) => {
            setDropoff(text);
            fetchPlaces(text, setDropoffResults);
          }}
        />
        {dropoffResults.length > 0 && (
          <View className="bg-slate-800 rounded-lg mt-1 border border-slate-700 max-h-48">
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {dropoffResults.map((item, index) => (
                <TouchableOpacity
                  key={item.place_id}
                  className={`p-4 ${index < dropoffResults.length - 1 ? 'border-b border-slate-700' : ''}`}
                  onPress={() => {
                    setDropoff(item.description);
                    setDropoffResults([]);
                  }}
                >
                  <Text className="text-slate-200">{item.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

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
              <Text className="text-white font-semibold">{driver.name}</Text>
              <Text className="text-slate-400 text-sm">Driver ID: {driver.id.substring(0, 8)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text className="text-slate-300 font-semibold mb-2">Assign Vehicle</Text>
      {vehicles.length === 0 ? (
        <Text className="text-amber-500 mb-6 bg-amber-500/10 p-4 rounded-lg">
          No available vehicles. Add one in Fleet Vehicles.
        </Text>
      ) : (
        <View className="mb-6">
          {vehicles.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              className={`p-4 rounded-lg mb-2 border ${selectedVehicleId === vehicle.id ? 'bg-emerald-600/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
              onPress={() => setSelectedVehicleId(vehicle.id)}
            >
              <Text className="text-white font-semibold">{vehicle.make} {vehicle.model}</Text>
              <Text className="text-slate-400 text-sm">Plate: {vehicle.licensePlate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        className={`rounded-lg p-4 items-center min-h-[56px] justify-center mt-4 ${submitting || !selectedDriverId || !selectedVehicleId ? 'bg-slate-700' : 'bg-blue-600'}`}
        onPress={handleCreateTrip}
        disabled={submitting || !selectedDriverId || !selectedVehicleId}
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
