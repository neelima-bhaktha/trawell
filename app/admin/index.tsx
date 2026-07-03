import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen to drivers collection for any driver with approvalStatus == 'pending'
    const q = query(collection(db, 'drivers'), where('approvalStatus', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drivers: any[] = [];
      snapshot.forEach((doc) => {
        drivers.push({ id: doc.id, ...doc.data() });
      });
      setPendingDrivers(drivers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending drivers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
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
        <Text className="text-3xl font-bold text-white">Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} className="bg-red-600/20 px-4 py-2 rounded-lg">
          <Text className="text-red-400 font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="text-slate-400 mb-4 font-semibold uppercase tracking-wider">Pending Driver Approvals</Text>
      
      {pendingDrivers.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 text-lg">No pending drivers found.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingDrivers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 flex-row justify-between items-center"
              onPress={() => router.push(`/admin/driver/${item.id}` as any)}
            >
              <View>
                <Text className="text-white font-bold text-lg mb-1">Driver ID: {item.id.substring(0, 8)}...</Text>
                <Text className="text-slate-400 text-sm">
                  Documents Uploaded: {Object.keys(item.documents || {}).length}/3
                </Text>
              </View>
              <View className="bg-amber-500/20 px-3 py-1 rounded-full">
                <Text className="text-amber-500 font-semibold text-xs">Review</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
