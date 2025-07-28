import { useClerk } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to welcome page
      Linking.openURL(Linking.createURL('/welcome'));
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.buttonText}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 