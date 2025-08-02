import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const signOutButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    ...typography.buttonText,
    color: '#ffffff',
    fontWeight: '600',
  },
}); 