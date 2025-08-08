import { StyleSheet } from 'react-native';
import { typography } from '../../../typography';

export const ssoProfileSetupStyles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  title: {
    ...typography.appTitle,
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: '#6B7F6B',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.subsectionHeader,
    color: '#2c3e50',
    marginBottom: 12,
    marginTop: 20,
  },
  input: {
    ...typography.bodyMedium,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#6B7F6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.buttonText,
    color: '#ffffff',
    fontWeight: '600',
  },
  emailContainer: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  emailText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
    fontFamily: 'Satoshi-Medium',
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontFamily: 'Satoshi-Regular',
  },
}); 