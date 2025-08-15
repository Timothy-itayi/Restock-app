import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

/**
 * Simple test component to verify Convex integration
 * Now directly uses Convex hooks instead of repository pattern
 */
export function ConvexTest() {
  const { userId } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  // Convex hooks for sessions
  const sessions = useQuery(api.restockSessions.list, {});
  const createSession = useMutation(api.restockSessions.create);
  const deleteSession = useMutation(api.restockSessions.remove);

  // Convex hooks for products
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const deleteProduct = useMutation(api.products.remove);

  // Convex hooks for suppliers
  const suppliers = useQuery(api.suppliers.list, {});
  const createSupplier = useMutation(api.suppliers.create);
  const deleteSupplier = useMutation(api.suppliers.remove);

  // Convex hooks for users
  const userProfile = useQuery(api.users.get, {});
  const createUserProfile = useMutation(api.users.create);
  const checkProfileCompletion = useQuery(api.users.checkProfileCompletion, {});

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleCreateSession = async () => {
    try {
      addTestResult('Creating test session...');
      const sessionId = await createSession({ 
        name: `Test Session ${Date.now()}` 
      });
      addTestResult(`✅ Session created: ${sessionId}`);
    } catch (error) {
      addTestResult(`❌ Error creating session: ${error}`);
    }
  };

  const handleDeleteSession = async () => {
    if (sessions && sessions.length > 0) {
      try {
        const firstSession = sessions[0];
        addTestResult(`Deleting session: ${firstSession._id}`);
        await deleteSession({ id: firstSession._id });
        addTestResult('✅ Session deleted');
      } catch (error) {
        addTestResult(`❌ Error deleting session: ${error}`);
      }
    }
  };

  const handleCreateProduct = async () => {
    try {
      addTestResult('Creating test product...');
      const productId = await createProduct({
        name: `Test Product ${Date.now()}`,
        defaultQuantity: 10,
        notes: 'Test product for migration'
      });
      addTestResult(`✅ Product created: ${productId}`);
    } catch (error) {
      addTestResult(`❌ Error creating product: ${error}`);
    }
  };

  const handleCreateSupplier = async () => {
    try {
      addTestResult('Creating test supplier...');
      const supplierId = await createSupplier({
        name: `Test Supplier ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        phone: '555-0123',
        notes: 'Test supplier for migration'
      });
      addTestResult(`✅ Supplier created: ${supplierId}`);
    } catch (error) {
      addTestResult(`❌ Error creating supplier: ${error}`);
    }
  };

  const handleCreateUserProfile = async () => {
    try {
      addTestResult('Creating user profile...');
      const profileId = await createUserProfile({
        email: 'test@example.com',
        name: 'Test User',
        storeName: 'Test Store'
      });
      addTestResult(`✅ User profile created: ${profileId}`);
    } catch (error) {
      addTestResult(`❌ Error creating user profile: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20, backgroundColor: '#f0f0f0', margin: 10, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
          🚀 Convex Migration Test
        </Text>
        
        <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
          User ID: {userId || 'Not authenticated'}
        </Text>
        
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>📊 Current Data:</Text>
          <Text>Sessions: {sessions?.length || 0}</Text>
          <Text>Products: {products?.length || 0}</Text>
          <Text>Suppliers: {suppliers?.length || 0}</Text>
          <Text>User Profile: {userProfile ? '✅' : '❌'}</Text>
          <Text>Profile Complete: {checkProfileCompletion?.isComplete ? '✅' : '❌'}</Text>
        </View>
        
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>🧪 Test Functions:</Text>
          
          <TouchableOpacity 
            onPress={handleCreateSession}
            style={{ 
              backgroundColor: '#4CAF50', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 8 
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              Create Test Session
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleCreateProduct}
            style={{ 
              backgroundColor: '#2196F3', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 8 
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              Create Test Product
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleCreateSupplier}
            style={{ 
              backgroundColor: '#FF9800', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 8 
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              Create Test Supplier
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleCreateUserProfile}
            style={{ 
              backgroundColor: '#9C27B0', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 8 
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              Create User Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDeleteSession}
            style={{ 
              backgroundColor: '#f44336', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 8 
            }}
            disabled={!sessions || sessions.length === 0}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              Delete First Session
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>📝 Test Results:</Text>
            <TouchableOpacity onPress={clearResults} style={{ backgroundColor: '#666', padding: 6, borderRadius: 4 }}>
              <Text style={{ color: 'white', fontSize: 12 }}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          {testResults.length === 0 ? (
            <Text style={{ fontStyle: 'italic', color: '#666' }}>No test results yet. Run some tests above!</Text>
          ) : (
            <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 4, maxHeight: 200 }}>
              {testResults.map((result, index) => (
                <Text key={index} style={{ fontSize: 12, marginBottom: 2, fontFamily: 'monospace' }}>
                  {result}
                </Text>
              ))}
            </View>
          )}
        </View>
        
        {sessions && sessions.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>📋 Current Sessions:</Text>
            {sessions.map((session: any, index: number) => (
              <Text key={session._id} style={{ marginBottom: 2, fontSize: 12 }}>
                {index + 1}. {session.name} ({session.status})
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
