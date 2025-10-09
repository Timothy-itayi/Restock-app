/**
 * Nuclear Storage Clear Script
 * Run this in your app to completely wipe AsyncStorage
 * 
 * Usage: Import and call clearAllStorage() from any component
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('🗑️  Found AsyncStorage keys:', keys);
    
    await AsyncStorage.multiRemove(keys);
    console.log('✅ All AsyncStorage cleared:', keys.length, 'items removed');
    
    return { success: true, keysCleared: keys };
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage:', error);
    return { success: false, error };
  }
}

export async function clearAuthOnlyStorage() {
  try {
    const authKeys = [
      'clerk-client-jwt-key',
      'clerk-token',
      '__clerk_client_jwt',
      '__clerk_db_jwt',
      'lastAuthRoute',
      'sessionManager',
      'hasCompletedOnboarding',
      'clerkUserId',
    ];
    
    console.log('🗑️  Clearing auth-related keys:', authKeys);
    await AsyncStorage.multiRemove(authKeys);
    console.log('✅ Auth storage cleared');
    
    return { success: true, keysCleared: authKeys };
  } catch (error) {
    console.error('❌ Error clearing auth storage:', error);
    return { success: false, error };
  }
}

// Debug: View all storage
export async function debugStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    
    console.log('📦 AsyncStorage Contents:');
    items.forEach(([key, value]) => {
      console.log(`  ${key}:`, value?.substring(0, 100));
    });
    
    return items;
  } catch (error) {
    console.error('❌ Error reading storage:', error);
    return [];
  }
}

