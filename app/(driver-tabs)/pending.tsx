import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

const VehicleInfo = ({ vehicleId }: { vehicleId: string }) => {
  const [vehicle, setVehicle] = useState<any>(null);
  
  useEffect(() => {
    if (!vehicleId) return;
    const fetchVehicle = async () => {
      const docSnap = await getDoc(doc(db, 'vehicles', vehicleId));
      if (docSnap.exists()) {
        setVehicle(docSnap.data());
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  if (!vehicle) return null;

  return (
    <View className="bg-slate-700/50 p-3 rounded-lg mb-4 flex-row justify-between items-center">
      <View>
        <Text className="text-slate-400 text-xs uppercase font-bold">Assigned Vehicle</Text>
        <Text className="text-white font-semibold">{vehicle.make} {vehicle.model}</Text>
      </View>
      <View className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
        <Text className="text-emerald-400 font-mono font-bold">{vehicle.licensePlate}</Text>
      </View>
    </View>
  );
};

export default function PendingTripsScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'trips'), 
      where('driverId', '==', user.uid),
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrips: any[] = [];
      snapshot.forEach((doc) => {
        fetchedTrips.push({ id: doc.id, ...doc.data() });
      });
      // Sort by creation time manually or rely on firestore ordering if indexed
      setTrips(fetchedTrips);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending trips:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const acceptTrip = async (tripId: string) => {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status: 'ongoing'
      });
      Alert.alert("Trip Accepted!", "This trip has been moved to your Ongoing tab.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
    <View className="flex-1 bg-slate-900 px-6 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-white">Pending</Text>
        <TouchableOpacity onPress={handleLogout} className="bg-red-600/20 px-4 py-2 rounded-lg">
          <Text className="text-red-400 font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>
      
      {trips.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 text-lg">No new trips assigned.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
              <Text className="text-slate-400 text-xs font-bold uppercase mb-2">New Assignment</Text>
              <Text className="text-white font-bold text-xl mb-3">{item.passengerName}</Text>
              
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
                <Text className="text-slate-300 flex-1">{item.pickupLocation}</Text>
              </View>
              
              <View className="w-0.5 h-4 bg-slate-700 ml-1 mb-2" />
              
              <View className="flex-row items-center mb-4">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                <Text className="text-slate-300 flex-1">{item.dropoffLocation}</Text>
              </View>

              {item.vehicleId && <VehicleInfo vehicleId={item.vehicleId} />}

              <TouchableOpacity 
                className="bg-emerald-600 p-4 rounded-lg items-center"
                onPress={() => acceptTrip(item.id)}
              >
                <Text className="text-white font-bold text-lg">Accept Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
