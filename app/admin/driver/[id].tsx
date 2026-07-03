import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function DriverReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        if (!id) return;
        const driverDoc = await getDoc(doc(db, 'drivers', id as string));
        if (driverDoc.exists()) {
          setDriver(driverDoc.data());
        } else {
          Alert.alert('Error', 'Driver not found');
          router.back();
        }
      } catch (error) {
        console.error("Error fetching driver:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  const handleApprove = async () => {
    Alert.alert('Confirm Approval', 'Are you sure you want to approve this driver?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Approve', 
        style: 'default',
        onPress: async () => {
          setActionLoading(true);
          try {
            await updateDoc(doc(db, 'drivers', id as string), {
              approvalStatus: 'approved'
            });
            router.back();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  const handleReject = async () => {
    Alert.alert('Confirm Rejection', 'This will reject the driver and force them to re-upload documents.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reject', 
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await updateDoc(doc(db, 'drivers', id as string), {
              approvalStatus: 'rejected',
              documents: {} // Clear documents so they have to re-upload
            });
            router.back();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!driver) return null;

  const docs = driver.documents || {};
  const REQUIRED_DOCS = ['Aadhaar', 'PAN', 'License'];

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold mb-2">Driver Documents</Text>
        <Text className="text-slate-400">Review the documents uploaded by this driver to verify their identity and credentials.</Text>
      </View>

      {REQUIRED_DOCS.map((docName) => (
        <View key={docName} className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <Text className="text-white font-bold text-lg mb-4">{docName}</Text>
          
          {docs[docName] ? (
            <Image 
              source={{ uri: docs[docName] }} 
              className="w-full h-48 rounded-lg bg-slate-900"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-48 rounded-lg bg-slate-900 justify-center items-center border border-dashed border-slate-600">
              <Text className="text-slate-500">Not Uploaded</Text>
            </View>
          )}
        </View>
      ))}

      <View className="mt-4 gap-4 flex-col">
        <TouchableOpacity 
          className="bg-emerald-600 rounded-lg p-4 items-center min-h-[56px] justify-center"
          onPress={handleApprove}
          disabled={actionLoading}
        >
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Approve Driver</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-slate-800 rounded-lg p-4 items-center min-h-[56px] justify-center border border-red-500/30"
          onPress={handleReject}
          disabled={actionLoading}
        >
          {actionLoading ? <ActivityIndicator color="#ef4444" /> : <Text className="text-red-400 font-bold text-lg">Reject & Request Re-upload</Text>}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
