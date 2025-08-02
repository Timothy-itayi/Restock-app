import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const loadingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  message: {
    marginTop: 20,
    ...typography.bodyMedium,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 