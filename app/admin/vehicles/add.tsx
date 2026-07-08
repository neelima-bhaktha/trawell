import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../config/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [status, setStatus] = useState('available');

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchVehicle = async () => {
        try {
          const docRef = doc(db, 'vehicles', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMake(data.make || '');
            setModel(data.model || '');
            setLicensePlate(data.licensePlate || '');
            setStatus(data.status || 'available');
          } else {
            Alert.alert("Error", "Vehicle not found.");
            router.back();
          }
        } catch (error: any) {
          Alert.alert("Error", error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id]);

  const handleSave = async () => {
    if (!make || !model || !licensePlate) {
      Alert.alert('Missing Fields', 'Please fill in all vehicle details.');
      return;
    }
    setSubmitting(true);
    try {
      const vehicleData = {
        make,
        model,
        licensePlate: licensePlate.toUpperCase(),
        status,
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'vehicles', id), vehicleData);
        Alert.alert('Success', 'Vehicle updated successfully!');
      } else {
        await addDoc(collection(db, 'vehicles'), {
          ...vehicleData,
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Vehicle added successfully!');
      }
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
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-white">{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <Text className="text-slate-300 font-bold">Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-slate-300 font-semibold mb-2">Make (e.g. Toyota, Ford)</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg p-4 mb-4 border border-slate-700"
        placeholder="Make"
        placeholderTextColor="#64748B"
        value={make}
        onChangeText={setMake}
      />

      <Text className="text-slate-300 font-semibold mb-2">Model (e.g. Camry, F-150)</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg p-4 mb-4 border border-slate-700"
        placeholder="Model"
        placeholderTextColor="#64748B"
        value={model}
        onChangeText={setModel}
      />

      <Text className="text-slate-300 font-semibold mb-2">License Plate</Text>
      <TextInput
        className="bg-slate-800 text-white rounded-lg p-4 mb-6 border border-slate-700"
        placeholder="e.g. AB 12 CD 3456"
        placeholderTextColor="#64748B"
        autoCapitalize="characters"
        value={licensePlate}
        onChangeText={setLicensePlate}
      />

      <Text className="text-slate-300 font-semibold mb-2">Status</Text>
      <View className="flex-row mb-8">
        {['available', 'maintenance'].map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setStatus(opt)}
            className={`flex-1 p-3 rounded-lg border mr-2 items-center ${status === opt ? 'bg-emerald-600/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
          >
            <Text className={`font-bold capitalize ${status === opt ? 'text-emerald-400' : 'text-slate-400'}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`rounded-lg p-4 items-center min-h-[56px] justify-center ${submitting ? 'bg-slate-700' : 'bg-blue-600'}`}
        onPress={handleSave}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">{isEditing ? 'Save Changes' : 'Add Vehicle'}</Text>
        )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
