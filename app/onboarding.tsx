import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { auth, db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';

const REQUIRED_DOCS = ['Aadhaar', 'PAN', 'License'];

export default function OnboardingScreen() {
  const { driverData } = useAuth();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleLogout = () => {
    auth.signOut();
  };

  const pickImageAndUpload = async (docType: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.2, // Low quality to ensure it fits in Firestore 1MB document limit
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingDoc(docType);
        
        const base64 = result.assets[0].base64;
        const user = auth.currentUser;
        if (!user || !base64) {
          setUploadingDoc(null);
          return;
        }

        // Format as data URL
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        
        // Save directly to Firestore (bypassing Firebase Storage)
        const driverRef = doc(db, 'drivers', user.uid);
        await updateDoc(driverRef, {
          [`documents.${docType}`]: dataUrl
        });
        
        setUploadingDoc(null);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert('Upload Failed', error.message);
      setUploadingDoc(null);
    }
  };

  const handleSimulateApproval = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, 'drivers', auth.currentUser.uid), { approvalStatus: 'approved' });
    }
  };

  const uploadedDocs = driverData?.documents || {};
  const isAllUploaded = REQUIRED_DOCS.every(doc => uploadedDocs[doc]);

  if (isAllUploaded) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Text className="text-white text-3xl font-bold mb-4 text-center">Account Pending</Text>
        <Text className="text-slate-400 text-center mb-8">
          Your account is currently under review by the administrator. Once your documents are verified and your account is approved, you will have access to the dashboard.
        </Text>
        
        {__DEV__ && (
          <TouchableOpacity 
            className="bg-blue-600 rounded-lg p-4 w-full items-center min-h-[56px] justify-center mb-4"
            onPress={handleSimulateApproval}
          >
            <Text className="text-white font-bold text-lg">Simulate Admin Approval (Dev)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          className="bg-slate-800 rounded-lg p-4 w-full items-center min-h-[56px] justify-center"
          onPress={handleLogout}
        >
          <Text className="text-red-400 font-bold text-lg">Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 40, flexGrow: 1, justifyContent: 'center' }}>
      <Text className="text-white text-3xl font-bold mb-4 text-center">Upload Documents</Text>
      <Text className="text-slate-400 text-center mb-8">
        Please upload the required documents to complete your registration.
      </Text>

      <View className="mb-8">
        {REQUIRED_DOCS.map((docName) => {
          const isUploaded = !!uploadedDocs[docName];
          const isUploading = uploadingDoc === docName;

          return (
            <View key={docName} className="bg-slate-800 p-4 rounded-xl mb-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">{docName}</Text>
                {isUploaded ? (
                  <Text className="text-emerald-400 mt-1">Uploaded successfully</Text>
                ) : (
                  <Text className="text-slate-400 mt-1">Pending upload</Text>
                )}
              </View>

              <TouchableOpacity
                className={`ml-4 px-4 py-2 rounded-lg ${isUploaded ? 'bg-slate-700' : 'bg-blue-600'} min-w-[100px] items-center`}
                onPress={() => pickImageAndUpload(docName)}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold">
                    {isUploaded ? 'Retake' : 'Upload'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity 
        className="bg-slate-800 rounded-lg p-4 w-full items-center min-h-[56px] justify-center mt-auto"
        onPress={handleLogout}
      >
        <Text className="text-red-400 font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
