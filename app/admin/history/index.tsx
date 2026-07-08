import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image, ScrollView, Modal } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../config/firebase';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const HistoryTripCard = ({ trip }: { trip: any }) => {
  const [driverName, setDriverName] = useState('Loading...');
  const [rate, setRate] = useState(trip.billing?.ratePerKm?.toString() || '');
  const [extraCharges, setExtraCharges] = useState(trip.billing?.extraCharges?.toString() || '');
  const [submitting, setSubmitting] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [agencyName, setAgencyName] = useState('TraWell Agency');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563EB; padding-bottom: 20px; }
              .title { font-size: 32px; font-weight: bold; color: #1E293B; margin: 0; }
              .subtitle { font-size: 16px; color: #64748B; margin-top: 5px; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; color: #2563EB; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
              .label { font-weight: bold; color: #475569; width: 150px; }
              .value { flex: 1; color: #0F172A; }
              .total-box { background-color: #F1F5F9; padding: 20px; border-radius: 8px; text-align: right; margin-top: 40px; }
              .total-label { font-size: 18px; font-weight: bold; color: #475569; }
              .total-value { font-size: 28px; font-weight: bold; color: #059669; display: block; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${agencyName}</h1>
              <p class="subtitle">Official Trip Invoice</p>
            </div>
            
            <div class="section">
              <div class="section-title">Customer Details</div>
              <div class="row"><span class="label">Name:</span> <span class="value">${trip.passengerName}</span></div>
              <div class="row"><span class="label">Contact:</span> <span class="value">${trip.passengerContact || 'N/A'}</span></div>
              <div class="row"><span class="label">Gender:</span> <span class="value">${trip.passengerGender || 'N/A'}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Trip Details</div>
              <div class="row"><span class="label">Pickup:</span> <span class="value">${trip.pickupLocation}</span></div>
              <div class="row"><span class="label">Dropoff:</span> <span class="value">${trip.dropoffLocation}</span></div>
              <div class="row"><span class="label">Time:</span> <span class="value">${trip.pickupTime || 'N/A'}</span></div>
              <div class="row"><span class="label">Distance:</span> <span class="value">${trip.postTrip?.distance || 0} KM</span></div>
            </div>

            <div class="section">
              <div class="section-title">Driver & Vehicle</div>
              <div class="row"><span class="label">Driver Name:</span> <span class="value">${driverName}</span></div>
            </div>

            <div class="total-box">
              <span class="total-label">Total Amount</span>
              <span class="total-value">₹${trip.billing?.total?.toFixed(2) || '0.00'}</span>
              <div style="font-size: 12px; color: #64748B; margin-top: 10px;">Distance: ₹${((trip.postTrip?.distance || 0) * (trip.billing?.ratePerKm || 0)).toFixed(2)} | Extra Charges: ₹${trip.billing?.extraCharges || 0}</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Ready', 'Sharing is not available on this device, but the PDF was generated at: ' + uri);
      }
    } catch (err: any) {
      Alert.alert('Error generating PDF', err.message);
    }
  };

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const dSnap = await getDoc(doc(db, 'users', trip.driverId));
        if (dSnap.exists()) {
          setDriverName(dSnap.data().name || 'Unknown Driver');
        } else {
          setDriverName('Unknown Driver');
        }
      } catch (e) {
        setDriverName('Error');
      }
    };
    fetchDriver();
  }, [trip.driverId]);

  const handleSaveBill = async () => {
    if (!rate) {
      Alert.alert('Missing Info', 'Please enter a rate per KM.');
      return;
    }
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum <= 0) {
      Alert.alert('Invalid', 'Enter a valid positive number for rate.');
      return;
    }

    const extraNum = parseFloat(extraCharges) || 0;

    setSubmitting(true);
    try {
      const distance = trip.postTrip?.distance || 0;
      const total = (distance * rateNum) + extraNum;

      await updateDoc(doc(db, 'trips', trip.id), {
        billing: {
          ratePerKm: rateNum,
          extraCharges: extraNum,
          total: total,
          status: 'generated'
        }
      });
      Alert.alert('Success', `Bill generated for ₹${total.toFixed(2)}`);
      setShowBilling(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
      <View className="flex-row justify-between mb-2 items-center">
        <Text className="text-white font-bold text-lg">{trip.passengerName}</Text>
        <Text className="text-emerald-500 font-bold uppercase text-xs">Completed</Text>
      </View>
      
      <Text className="text-slate-300 font-semibold mb-1">Driver: {driverName}</Text>
      <Text className="text-slate-400 text-xs mb-1">From: {trip.pickupLocation}</Text>
      <Text className="text-slate-400 text-xs mb-4">To: {trip.dropoffLocation}</Text>
      
      {trip.postTrip?.receipts?.length > 0 && (
        <View className="mb-4">
          <Text className="text-slate-300 font-semibold mb-2">Driver Receipts (Tolls/Parking)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trip.postTrip.receipts.map((url: string, i: number) => (
              <TouchableOpacity key={i} onPress={() => setSelectedImage(url)}>
                <Image 
                  source={{ uri: url }} 
                  className="w-24 h-24 rounded-lg mr-3 bg-slate-700" 
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-12 right-6 z-50 bg-slate-800 p-3 rounded-full"
            onPress={() => setSelectedImage(null)}
          >
            <Text className="text-white font-bold">Close X</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              className="w-full h-4/5" 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <View className="flex-row justify-between bg-slate-900 p-3 rounded-lg mb-4">
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Distance</Text>
          <Text className="text-white font-mono">{trip.postTrip?.distance || 0} KM</Text>
        </View>
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Fuel</Text>
          <Text className="text-white font-mono">{trip.postTrip?.fuelLevel || 'N/A'}</Text>
        </View>
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Bill</Text>
          <Text className={trip.billing ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
            {trip.billing ? `₹${trip.billing.total.toFixed(2)}` : 'Unbilled'}
          </Text>
        </View>
      </View>

      {trip.billing && (
        <View className="bg-slate-700/30 p-4 rounded-lg mb-4 border border-slate-700">
          <Text className="text-slate-300 text-xs mb-1">Agency Name (For PDF)</Text>
          <TextInput
            className="bg-slate-900 text-white p-3 rounded-lg border border-slate-600 mb-3"
            value={agencyName}
            onChangeText={setAgencyName}
          />
          <TouchableOpacity 
            className="bg-indigo-600 p-3 rounded-lg flex-row justify-center items-center"
            onPress={handleDownloadPDF}
          >
            <Text className="text-white font-bold">📄 Download Invoice (PDF)</Text>
          </TouchableOpacity>
        </View>
      )}

      {showBilling ? (
        <View className="bg-slate-700/50 p-4 rounded-lg">
          <Text className="text-slate-300 font-bold mb-2">Generate Invoice</Text>
          <Text className="text-slate-400 text-xs mb-2">Distance: {trip.postTrip?.distance || 0} KM</Text>
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-300 font-bold">Total Bill:</Text>
            <Text className="text-emerald-400 font-bold text-xl">
              ₹{(((parseFloat(rate) || 0) * (trip.postTrip?.distance || 0)) + (parseFloat(extraCharges) || 0)).toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-row mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 text-xs mb-1">Rate per KM (₹)</Text>
              <TextInput
                className="bg-slate-900 text-white p-3 rounded-lg border border-slate-600"
                placeholder="e.g. 15"
                placeholderTextColor="#64748B"
                keyboardType="decimal-pad"
                value={rate}
                onChangeText={setRate}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-slate-400 text-xs mb-1">Extra Charges (₹)</Text>
              <TextInput
                className="bg-slate-900 text-white p-3 rounded-lg border border-slate-600"
                placeholder="e.g. Tolls"
                placeholderTextColor="#64748B"
                keyboardType="decimal-pad"
                value={extraCharges}
                onChangeText={setExtraCharges}
              />
            </View>
          </View>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-slate-600 p-3 rounded-lg items-center mr-2"
              onPress={() => setShowBilling(false)}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-purple-600 p-3 rounded-lg items-center"
              onPress={handleSaveBill}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save Bill</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          className="bg-slate-700 p-3 rounded-lg items-center"
          onPress={() => setShowBilling(true)}
        >
          <Text className="text-slate-200 font-bold">{trip.billing ? 'Edit Bill' : 'Generate Bill'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function AdminHistoryScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const qTrips = query(collection(db, 'trips'), where('status', '==', 'completed'));
    
    const unsubscribe = onSnapshot(qTrips, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      // Sort by completion time if available
      fetched.sort((a, b) => {
        const timeA = a.postTrip?.completedAt?.toMillis() || 0;
        const timeB = b.postTrip?.completedAt?.toMillis() || 0;
        return timeB - timeA; // Descending
      });
      setTrips(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const query = searchQuery.toLowerCase();
    return trips.filter(trip => 
      trip.passengerName?.toLowerCase().includes(query) || 
      trip.pickupLocation?.toLowerCase().includes(query) ||
      trip.dropoffLocation?.toLowerCase().includes(query)
    );
  }, [trips, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-white">Trip History</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <Text className="text-slate-300 font-bold">Back</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4"
          placeholder="Search passenger or location..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filteredTrips.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-slate-500 text-lg text-center">No completed trips match your search.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => <HistoryTripCard trip={item} />}
        />
      )}
    </SafeAreaView>
  );
}
