/**
 * Clear AsyncStorage - useful for clearing cached Clerk tokens
 * Run this on your device/simulator
 */
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearAllStorage() {
  try {
    console.log('🧹 Clearing AsyncStorage...');
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Found keys:', keys);
    
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
      console.log('✅ Cleared', keys.length, 'items from AsyncStorage');
    } else {
      console.log('ℹ️  AsyncStorage is already empty');
    }
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage:', error);
  }
}

clearAllStorage();

