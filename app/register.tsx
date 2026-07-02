import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !phone || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Create user document with default 'driver' role
      await setDoc(doc(db, 'users', user.uid), {
        name: fullName,
        email: email,
        phone: phone,
        role: 'driver',
        createdAt: serverTimestamp(),
      });

      // 2. Create driver document with 'pending' status
      await setDoc(doc(db, 'drivers', user.uid), {
        approvalStatus: 'pending',
        assignedVehicleId: null,
        totalTripsCompleted: 0,
        documents: {}
      });

      // After successful registration and db setup, the AuthContext and _layout will redirect
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
      <View className="mb-8">
        <Text className="text-white text-3xl font-bold mb-2">Driver Registration</Text>
        <Text className="text-slate-400 text-base">Join Trawell to start receiving trips</Text>
      </View>

      <View className="bg-slate-800 p-6 rounded-2xl">
        <Text className="text-slate-300 font-semibold mb-2">Full Name</Text>
        <TextInput
          className="bg-slate-900 text-white rounded-lg p-4 mb-4 border border-slate-700"
          placeholder="Enter your full name"
          placeholderTextColor="#64748B"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text className="text-slate-300 font-semibold mb-2">Phone Number</Text>
        <TextInput
          className="bg-slate-900 text-white rounded-lg p-4 mb-4 border border-slate-700"
          placeholder="Enter your phone number"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text className="text-slate-300 font-semibold mb-2">Email</Text>
        <TextInput
          className="bg-slate-900 text-white rounded-lg p-4 mb-4 border border-slate-700"
          placeholder="Enter your email"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-slate-300 font-semibold mb-2">Password</Text>
        <TextInput
          className="bg-slate-900 text-white rounded-lg p-4 mb-8 border border-slate-700"
          placeholder="Create a password"
          placeholderTextColor="#64748B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="bg-blue-600 rounded-lg p-4 items-center justify-center min-h-[56px]"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Create Account</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="mt-6 items-center"
          onPress={() => router.push('/login')}
        >
          <Text className="text-slate-400">
            Already have an account? <Text className="text-blue-500 font-bold">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
