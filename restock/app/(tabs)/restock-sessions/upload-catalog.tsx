import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSessionContext } from '../../../lib/contexts/restock-sessions/SessionContext';

type ParsedItem = { supplierName: string; productName: string; confidence?: number };

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as { sessionId?: string; sessionName?: string };
  const { currentSession } = useSessionContext();
  const sessionReady = useMemo(() => !!currentSession, [currentSession]);

  // UI state scaffold
  const [step, setStep] = useState<'intro' | 'select' | 'parsing' | 'review'>('intro');
  const [numFiles, setNumFiles] = useState('2');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // placeholders for file names/uris
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [supplierEmails, setSupplierEmails] = useState<Record<string, string>>({});

  const uniqueSuppliers = useMemo(() => {
    return Array.from(new Set(items.map(i => i.supplierName))).sort();
  }, [items]);

  const onChooseFiles = () => {
    // TODO: Integrate file picker (expo-document-picker) and push names/uris into selectedFiles
    // For now, mock files to let us progress through the flow.
    const count = Math.max(1, Math.min(10, Number(numFiles) || 1));
    const mocks = Array.from({ length: count }, (_, i) => `Placeholder-File-${i + 1}.pdf`);
    setSelectedFiles(mocks);
    setStep('select');
  };

  const onStartParse = async () => {
    // TODO: POST multipart to ephemeral /parse endpoint (no storage), stream or poll results
    setIsBusy(true);
    setError(null);
    setStep('parsing');
    try {
      // Simulate parsing delay and results
      setTimeout(() => {
        const demo: ParsedItem[] = [
          { supplierName: 'Acme Foods', productName: 'Organic Milk', confidence: 0.92 },
          { supplierName: 'Acme Foods', productName: 'Free-Range Eggs', confidence: 0.88 },
          { supplierName: 'FreshCo', productName: 'Sourdough Bread', confidence: 0.9 },
        ];
        setItems(demo);
        setIsBusy(false);
        setStep('review');
      }, 900);
    } catch (e) {
      setError('Failed to parse. Please try again.');
      setIsBusy(false);
      setStep('select');
    }
  };

  const canConfirm = useMemo(() => {
    if (!items.length) return false;
    return uniqueSuppliers.every(s => (supplierEmails[s] || '').trim().length > 0);
  }, [items, supplierEmails, uniqueSuppliers]);

  const onConfirmImport = async () => {
    // TODO: For each item, call addProduct with supplierEmail; emit restock:productAdded; navigate back
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 }}>
          Upload Catalog
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 12 }}>
          {params.sessionName ? `Session: ${params.sessionName}` : currentSession?.toValue?.().name || 'Current Session'}
        </Text>

        {!sessionReady && (
          <Text style={{ color: '#a33', textAlign: 'center', marginBottom: 16 }}>
            No active session. Please create a session first.
          </Text>
        )}

        {/* Intro / Step 1 */}
        {step === 'intro' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 1 — Choose how many files</Text>
            <Text style={{ color: '#555' }}>
              We will process your files with AI to extract supplier and product names only (no SKUs or prices).
            </Text>
            <TextInput
              value={numFiles}
              onChangeText={setNumFiles}
              keyboardType="number-pad"
              placeholder="e.g., 2"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
            />
            <TouchableOpacity
              onPress={onChooseFiles}
              disabled={!sessionReady}
              style={{ padding: 12, backgroundColor: sessionReady ? '#111' : '#888', borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Choose Files</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Files Selected */}
        {step === 'select' && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 2 — Review selected files</Text>
            <FlatList
              data={selectedFiles}
              keyExtractor={(f, i) => f + i}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                  <Text style={{ color: '#333' }}>{item}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              onPress={onStartParse}
              style={{ padding: 12, backgroundColor: '#6B7F6B', borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Parse with AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('intro')}
              style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}
            >
              <Text style={{ color: '#333', textAlign: 'center' }}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 — Parsing */}
        {step === 'parsing' && (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Parsing your documents…</Text>
            {!!error && <Text style={{ color: '#a33', marginTop: 8 }}>{error}</Text>}
          </View>
        )}

        {/* Step 4 — Review & Supplier Emails */}
        {step === 'review' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 3 — Review and add supplier emails</Text>
            <Text style={{ color: '#555' }}>
              Confirm products by supplier and enter each supplier's email. We only store names and emails.
            </Text>
            <FlatList
              data={uniqueSuppliers}
              keyExtractor={(s) => s}
              renderItem={({ item: supplier }) => (
                <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                  <Text style={{ fontWeight: '600' }}>{supplier}</Text>
                  <TextInput
                    placeholder="Supplier email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={supplierEmails[supplier] || ''}
                    onChangeText={(v) => setSupplierEmails(prev => ({ ...prev, [supplier]: v }))}
                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8 }}
                  />
                  {items.filter(i => i.supplierName === supplier).map((i, idx) => (
                    <Text key={supplier + idx} style={{ marginTop: 6, color: '#333' }}>• {i.productName}</Text>
                  ))}
                </View>
              )}
            />
            <TouchableOpacity
              disabled={!canConfirm || isBusy}
              onPress={onConfirmImport}
              style={{ padding: 12, backgroundColor: canConfirm ? '#111' : '#999', borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Confirm Import</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('select')}
              style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}
            >
              <Text style={{ color: '#333', textAlign: 'center' }}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer actions */}
        <View style={{ marginTop: 24, gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 12, backgroundColor: '#6B7F6B', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}