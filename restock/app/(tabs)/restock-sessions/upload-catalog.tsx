import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSessionContext } from '../../../lib/contexts/restock-sessions/SessionContext';

type ParsedItem = { id: string; supplierName: string; productName: string; confidence?: number };

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as { sessionId?: string; sessionName?: string };
  const { currentSession } = useSessionContext();
  const sessionReady = useMemo(() => !!currentSession, [currentSession]);

  // UI state scaffold
  const [step, setStep] = useState<'intro' | 'select' | 'parsing' | 'curate' | 'emails'>('intro');
  const [numFiles, setNumFiles] = useState('2');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // placeholders for file names/uris
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [supplierEmails, setSupplierEmails] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('All');
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({}); // id -> selected

  const uniqueSuppliers = useMemo(() => {
    return Array.from(new Set(items.map(i => i.supplierName))).sort();
  }, [items]);

  const visibleItems = useMemo(() => {
    // SEO/search applies to suppliers only (not products)
    const q = search.trim().toLowerCase();
    return items.filter(i => {
      const supplierOk = supplierFilter === 'All' || i.supplierName === supplierFilter;
      if (!supplierOk) return false;
      if (!q) return true;
      return i.supplierName.toLowerCase().includes(q);
    });
  }, [items, search, supplierFilter]);

  const selectedCount = useMemo(() => Object.values(selectedMap).filter(Boolean).length, [selectedMap]);

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
        // Large demo catalog (scaffold) for curation practice
        const make = (id: number, supplierName: string, productName: string, confidence = 0.9): ParsedItem => ({ id: String(id), supplierName, productName, confidence });
        const demo: ParsedItem[] = [
          // Acme Foods
          make(1,'Acme Foods','Organic Milk'), make(2,'Acme Foods','Free-Range Eggs'), make(3,'Acme Foods','Greek Yogurt'),
          make(4,'Acme Foods','Cheddar Cheese'), make(5,'Acme Foods','Butter Unsalted'), make(6,'Acme Foods','Almond Milk Vanilla'),
          // FreshCo
          make(7,'FreshCo','Sourdough Bread'), make(8,'FreshCo','Whole Wheat Bagels'), make(9,'FreshCo','Brioche Buns'),
          make(10,'FreshCo','Cinnamon Rolls'), make(11,'FreshCo','Multigrain Bread'),
          // Endows
          make(12,'Endows','Macaroni'), make(13,'Endows','Penne Pasta'), make(14,'Endows','Basmati Rice'), make(15,'Endows','Jasmine Rice'),
          make(16,'Endows','Canned Tomatoes'), make(17,'Endows','Tomato Paste'), make(18,'Endows','Chickpeas Canned'),
          // GreenMart
          make(19,'GreenMart','Baby Spinach'), make(20,'GreenMart','Romaine Lettuce'), make(21,'GreenMart','Cherry Tomatoes'), make(22,'GreenMart','Avocados'),
          make(23,'GreenMart','Cucumbers English'), make(24,'GreenMart','Broccoli Crowns'), make(25,'GreenMart','Blueberries 12oz'),
          // Oceanic
          make(26,'Oceanic','Atlantic Salmon Fillet'), make(27,'Oceanic','Cod Loins'), make(28,'Oceanic','Shrimp 16/20'),
          make(29,'Oceanic','Tuna Steaks'), make(30,'Oceanic','Smoked Salmon'),
          // Sunrise Produce
          make(31,'Sunrise Produce','Navel Oranges'), make(32,'Sunrise Produce','Gala Apples'), make(33,'Sunrise Produce','Bananas'),
          make(34,'Sunrise Produce','Strawberries'), make(35,'Sunrise Produce','Lemons'), make(36,'Sunrise Produce','Limes'),
          // PantryPro
          make(37,'PantryPro','Olive Oil Extra Virgin'), make(38,'PantryPro','Canola Oil'), make(39,'PantryPro','All-Purpose Flour'),
          make(40,'PantryPro','Baking Soda'), make(41,'PantryPro','Brown Sugar'), make(42,'PantryPro','Sea Salt Fine'),
          // BeviCo
          make(43,'BeviCo','Sparkling Water Lime'), make(44,'BeviCo','Cola Classic'), make(45,'BeviCo','Iced Tea Lemon'),
          make(46,'BeviCo','Orange Juice NFC'), make(47,'BeviCo','Energy Drink Zero'),
          // DairyBest
          make(48,'DairyBest','Whole Milk'), make(49,'DairyBest','Mozzarella Shredded'), make(50,'DairyBest','Cottage Cheese'),
          make(51,'DairyBest','Cream Cheese'), make(52,'DairyBest','Whipping Cream')
        ];
        setItems(demo);
        setIsBusy(false);
        setStep('curate');
      }, 900);
    } catch (e) {
      setError('Failed to parse. Please try again.');
      setIsBusy(false);
      setStep('select');
    }
  };

  const suppliersFromSelection = useMemo(() => {
    const chosen = items.filter(i => selectedMap[i.id]);
    return Array.from(new Set(chosen.map(i => i.supplierName))).sort();
  }, [items, selectedMap]);

  const canContinueToEmails = useMemo(() => selectedCount > 0, [selectedCount]);

  const canConfirm = useMemo(() => {
    const chosen = items.filter(i => selectedMap[i.id]);
    if (!chosen.length) return false;
    const suppliers = Array.from(new Set(chosen.map(i => i.supplierName)));
    return suppliers.every(s => (supplierEmails[s] || '').trim().length > 0);
  }, [items, selectedMap, supplierEmails]);

  const onConfirmImport = async () => {
    // TODO: For each item, call addProduct with supplierEmail; emit restock:productAdded; navigate back
    router.back();
  };

  // --- Palette (keeps existing app feel) ---
  const brand = '#6B7F6B';
  const neutral0 = '#ffffff';
  const neutral50 = '#f7f7f7';
  const neutral100 = '#efefef';
  const neutral200 = '#e5e7eb';
  const neutral400 = '#9ca3af';
  const neutral600 = '#4b5563';

  // --- Reusable styles ---
  const card = {
    backgroundColor: neutral0,
    borderWidth: 1,
    borderColor: neutral200,
    borderRadius: 12,
    padding: 12
  } as const;
  const chip = (active: boolean) => ({
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: active ? brand : neutral200,
    backgroundColor: active ? brand : neutral50
  } as const);
  const button = (enabled = true, primary = true) => ({
    padding: 12,
    borderRadius: 10,
    backgroundColor: enabled ? (primary ? '#111' : brand) : '#999'
  } as const);
  const thinDivider = <View style={{ height: 1, backgroundColor: neutral200, marginVertical: 8 }} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16, backgroundColor: neutral50 }}>
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
          <View style={[card, { gap: 12 }] }>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 1 — Choose how many files</Text>
            <Text style={{ color: '#555' }}>
              We will process your files with AI to extract supplier and product names only (no SKUs or prices).
            </Text>
            {thinDivider}
            <TextInput
              value={numFiles}
              onChangeText={setNumFiles}
              keyboardType="number-pad"
              placeholder="e.g., 2"
              style={{ borderWidth: 1, borderColor: neutral200, borderRadius: 10, padding: 12, backgroundColor: neutral0 }}
            />
            <TouchableOpacity
              onPress={onChooseFiles}
              disabled={!sessionReady}
              style={button(!!sessionReady, true)}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Choose Files</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Files Selected */}
        {step === 'select' && (
          <View style={[card, { gap: 10 }] }>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 2 — Review selected files</Text>
            {thinDivider}
            <FlatList
              data={selectedFiles}
              keyExtractor={(f, i) => f + i}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: neutral200 }}>
                  <Text style={{ color: '#333' }}>• {item}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              onPress={onStartParse}
              style={button(true, false)}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Parse with AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('intro')}
              style={{ padding: 10, backgroundColor: neutral100, borderRadius: 10, borderWidth: 1, borderColor: neutral200 }}
            >
              <Text style={{ color: '#333', textAlign: 'center' }}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 — Parsing */}
        {step === 'parsing' && (
          <View style={[card, { alignItems: 'center', paddingVertical: 24 }] }>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Parsing your documents…</Text>
            {!!error && <Text style={{ color: '#a33', marginTop: 8 }}>{error}</Text>}
          </View>
        )}

        {/* Step 3 — Curate selection (filter + search) */}
        {step === 'curate' && (
          <View style={{ gap: 12, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 3 — Select products to import</Text>
            <Text style={{ color: '#555' }}>
              Use search and supplier filters to curate your list. Only selected items will be imported.
            </Text>
            <View style={[card, { gap: 10 }] }>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search supplier or product"
                style={{ borderWidth: 1, borderColor: neutral200, borderRadius: 10, padding: 12, backgroundColor: neutral0 }}
              />
              {thinDivider}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2 }}>
                {['All', ...uniqueSuppliers].map((s, idx) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSupplierFilter(s)}
                    style={[chip(supplierFilter === s), { marginRight: idx === uniqueSuppliers.length ? 0 : 8 }]}
                  >
                    <Text style={{ color: supplierFilter === s ? '#fff' : '#333' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  const next: Record<string, boolean> = { ...selectedMap };
                  visibleItems.forEach(i => { next[i.id] = true; });
                  setSelectedMap(next);
                }}
                style={button(true, false)}
              >
                <Text style={{ color: '#fff' }}>Select All Visible</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedMap({})}
                style={{ padding: 10, backgroundColor: neutral100, borderRadius: 10, borderWidth: 1, borderColor: neutral200 }}
              >
                <Text style={{ color: '#333' }}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={[card, { paddingVertical: 8, paddingHorizontal: 12 }] }>
              <Text style={{ color: neutral600, fontWeight: '700' }}>Products</Text>
            </View>
            <View style={[card, { padding: 0, flex: 1 }] }>
              <FlatList
                data={visibleItems}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => {
                  const checked = !!selectedMap[item.id];
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedMap(prev => ({ ...prev, [item.id]: !checked }))}
                      style={{ paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: neutral200, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: checked ? '#f9fafb' : neutral0 }}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={{ fontWeight: '700', color: neutral600 }}>{item.supplierName}</Text>
                        <Text style={{ color: '#333', marginTop: 2 }}>• {item.productName}</Text>
                      </View>
                  <View style={{ width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: neutral400, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                    {checked && <Ionicons name="checkmark" size={16} color="#111" />}
                  </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            <TouchableOpacity
              disabled={!canContinueToEmails}
              onPress={() => setStep('emails')}
              style={button(canContinueToEmails, true)}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Continue to Emails ({selectedCount} selected)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('select')}
              style={{ padding: 10, backgroundColor: neutral100, borderRadius: 10, borderWidth: 1, borderColor: neutral200 }}
            >
              <Text style={{ color: '#333', textAlign: 'center' }}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4 — Supplier Emails for Selected Items */}
        {step === 'emails' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Step 4 — Add supplier emails</Text>
            <Text style={{ color: '#555' }}>
              Enter each supplier's email for the items you selected. We only store names and emails.
            </Text>
            <View style={[card, { padding: 0 }] }>
              <FlatList
              data={suppliersFromSelection}
              keyExtractor={(s) => s}
              renderItem={({ item: supplier }) => (
                <View style={{ paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: neutral200 }}>
                  <Text style={{ fontWeight: '700', color: neutral600 }}>{supplier}</Text>
                  <TextInput
                    placeholder="Supplier email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={supplierEmails[supplier] || ''}
                    onChangeText={(v) => setSupplierEmails(prev => ({ ...prev, [supplier]: v }))}
                    style={{ borderWidth: 1, borderColor: neutral200, borderRadius: 10, padding: 12, marginTop: 8, backgroundColor: neutral0 }}
                  />
                  {items.filter(i => selectedMap[i.id] && i.supplierName === supplier).map((i, idx) => (
                    <Text key={supplier + idx} style={{ marginTop: 6, color: '#333' }}>• {i.productName}</Text>
                  ))}
                </View>
              )}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListFooterComponent={
                  <View style={{ gap: 10, padding: 12 }}>
                    <TouchableOpacity
                      disabled={!canConfirm || isBusy}
                      onPress={onConfirmImport}
                      style={button(canConfirm && !isBusy, true)}
                    >
                      <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Confirm Import</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStep('curate')}
                      style={{ padding: 10, backgroundColor: neutral100, borderRadius: 10, borderWidth: 1, borderColor: neutral200 }}
                    >
                      <Text style={{ color: '#333', textAlign: 'center' }}>Back</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
          </View>
        )}

        {/* Footer actions removed per UX: progression is via step buttons only */}
      </View>
    </SafeAreaView>
  );
}