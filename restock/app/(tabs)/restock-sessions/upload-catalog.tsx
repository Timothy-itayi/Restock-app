import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useSessionContext } from '../../../lib/contexts/restock-sessions/SessionContext';

export default function UploadScreen() {
  const router = useRouter();
  const { currentSession } = useSessionContext();
  const sessionReady = useMemo(() => !!currentSession, [currentSession]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          Upload Catalog
        </Text>
        {!sessionReady && (
          <Text style={{ color: '#a33', textAlign: 'center', marginBottom: 16 }}>
            No active session. Please create a session first.
          </Text>
        )}
        <Text style={{ fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24 }}>
          Placeholder screen. Document upload coming soon.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 12, backgroundColor: '#111', borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            try {
              await router.push('/(tabs)/restock-sessions/add-product' as any);
            } catch (error) {
              router.push('add-product' as any);
            }
          }}
          style={{ padding: 12, backgroundColor: '#6B7F6B', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Add Product Instead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}