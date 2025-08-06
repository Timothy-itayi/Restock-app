import { Stack } from 'expo-router';

export default function AuthRoutesLayout() {
  // Don't redirect signed-in users automatically - they might need profile setup
  // Let the individual auth screens and AuthContext handle routing decisions
  return <Stack screenOptions={{ headerShown: false }} />;
} 