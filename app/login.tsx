import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The _layout.tsx effect will handle redirecting the user based on role
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center px-6">
      <View className="mb-10">
        <Text className="text-white text-4xl font-bold mb-2">Trawell</Text>
        <Text className="text-slate-400 text-lg">Fleet Management System</Text>
      </View>

      <View className="bg-slate-800 p-6 rounded-2xl">
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
          className="bg-slate-900 text-white rounded-lg p-4 mb-6 border border-slate-700"
          placeholder="Enter your password"
          placeholderTextColor="#64748B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="bg-blue-600 rounded-lg p-4 items-center justify-center min-h-[56px]"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="mt-6 items-center"
          onPress={() => router.push('/register')}
        >
          <Text className="text-slate-400">
            Don't have an account? <Text className="text-blue-500 font-bold">Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
