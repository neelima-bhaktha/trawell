import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../config/firebase';

export default function OnboardingScreen() {
  const handleLogout = () => {
    auth.signOut();
  };

  const handleSimulateApproval = async () => {
    if (auth.currentUser) {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('../config/firebase');
      await setDoc(doc(db, 'drivers', auth.currentUser.uid), { approvalStatus: 'approved' }, { merge: true });
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6">
      <Text className="text-white text-3xl font-bold mb-4 text-center">Account Pending</Text>
      <Text className="text-slate-400 text-center mb-8">
        Your account is currently under review by the administrator. Once your documents are verified and your account is approved, you will have access to the dashboard.
      </Text>
      
      {/* Document Upload Wizard UI will go here in Phase 2 */}
      
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
