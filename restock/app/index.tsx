import { View, Text } from 'react-native';

export default function Index() {
  console.log('🏗️ [Index] Component function called');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, color: '#000' }}>Index page loaded!</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 10 }}>Expo Router is working!</Text>
    </View>
  );
}
