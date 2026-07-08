import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../config/firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function ManageVehiclesScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'vehicles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const v: any[] = [];
      snapshot.forEach((doc) => {
        v.push({ id: doc.id, ...doc.data() });
      });
      setVehicles(v);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const confirmDelete = (id: string, licensePlate: string) => {
    Alert.alert(
      "Delete Vehicle",
      `Are you sure you want to remove ${licensePlate}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'vehicles', id));
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-white">Fleet Vehicles</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <Text className="text-slate-300 font-bold">Back</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="bg-emerald-600 p-4 rounded-xl mb-6 items-center"
        onPress={() => router.push('/admin/vehicles/add' as any)}
      >
        <Text className="text-white font-bold text-lg">+ Add New Vehicle</Text>
      </TouchableOpacity>
      
      {vehicles.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 text-lg">No vehicles found. Add one above.</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-slate-800 p-5 rounded-xl mb-4 border border-slate-700">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-white font-bold text-xl">{item.make} {item.model}</Text>
                  <Text className="text-emerald-400 font-mono text-lg">{item.licensePlate}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.status === 'in-trip' ? 'bg-amber-500/20' : item.status === 'maintenance' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                  <Text className={`font-semibold text-xs uppercase ${item.status === 'in-trip' ? 'text-amber-500' : item.status === 'maintenance' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {item.status}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row mt-4 space-x-3">
                <TouchableOpacity 
                  className="bg-blue-600/20 border border-blue-500 flex-1 mr-2 py-2 rounded-lg items-center"
                  onPress={() => router.push(`/admin/vehicles/add?id=${item.id}` as any)}
                >
                  <Text className="text-blue-400 font-bold">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-red-600/20 border border-red-500 flex-1 ml-2 py-2 rounded-lg items-center"
                  onPress={() => confirmDelete(item.id, item.licensePlate)}
                >
                  <Text className="text-red-400 font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        )}
      </View>
    </SafeAreaView>
  );
}
