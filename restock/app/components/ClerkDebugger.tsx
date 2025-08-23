import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Debug component to test raw Clerk useAuth() hook
 * This will help us determine if Clerk itself is broken or our wrappers
 */
export const ClerkDebugger = React.memo(function ClerkDebugger() {
  // CRITICAL: Call useAuth() unconditionally first (no try-catch around hook call)
  const authResult = useAuth();
  
  // Memoize the debug info to prevent unnecessary re-renders
  const debugInfo = useMemo(() => {
    console.log('🔍 ClerkDebugger: Component rendering...');
    
    // Then check for errors AFTER the hook call
    let authError: string | null = null;
    if (!authResult || typeof authResult !== 'object') {
      authError = `useAuth() returned invalid type: ${typeof authResult} (value: ${authResult})`;
    }
    
    console.log('🔍 ClerkDebugger: Raw useAuth() result:', {
      result: authResult,
      type: typeof authResult,
      isObject: typeof authResult === 'object',
      isNull: authResult === null,
      isNumber: typeof authResult === 'number',
      keys: authResult && typeof authResult === 'object' ? Object.keys(authResult) : 'N/A'
    });
    
    return { authError, authResult };
  }, [authResult]);
  
  // Memoize the render function to prevent unnecessary re-renders
  const renderDebugInfo = useCallback(() => {
    const { authError, authResult } = debugInfo;
    
    return (
      <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
          🔍 Clerk Debug Information
        </Text>
        
        <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Raw useAuth() Call:</Text>
          
          {authError ? (
            <View>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>ERROR:</Text>
              <Text style={{ color: 'red' }}>{authError}</Text>
            </View>
          ) : (
            <View>
              <Text>Type: <Text style={{ fontWeight: 'bold' }}>{typeof authResult}</Text></Text>
              <Text>Value: <Text style={{ fontFamily: 'monospace' }}>{JSON.stringify(authResult, null, 2)}</Text></Text>
              
              {typeof authResult === 'object' && authResult !== null && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>Object Properties:</Text>
                  {Object.keys(authResult).map(key => (
                    <Text key={key} style={{ marginLeft: 10 }}>
                      {key}: {typeof (authResult as any)[key]} = {String((authResult as any)[key])}
                    </Text>
                  ))}
                </View>
              )}
              
              {typeof authResult === 'number' && (
                <View style={{ backgroundColor: '#ffebee', padding: 10, borderRadius: 5, marginTop: 10 }}>
                  <Text style={{ color: 'red', fontWeight: 'bold' }}>⚠️ ISSUE FOUND:</Text>
                  <Text style={{ color: 'red' }}>useAuth() returned a number ({authResult}) instead of an object!</Text>
                  <Text style={{ color: 'red' }}>This indicates a Clerk configuration or package issue.</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Expected vs Actual:</Text>
          <Text style={{ color: 'green' }}>Expected: object with isLoaded, isSignedIn, userId, etc.</Text>
          <Text style={{ color: typeof authResult === 'object' ? 'green' : 'red' }}>
            Actual: {typeof authResult} {typeof authResult === 'number' ? `(${authResult})` : ''}
          </Text>
        </View>
      </ScrollView>
    );
  }, [debugInfo]);

  return renderDebugInfo();
});