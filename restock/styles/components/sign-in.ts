import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const signInStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.appTitle,
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: '#7f8c8d',
    marginBottom: 32,
    textAlign: 'center',
  },
  returningUserButton: {
    backgroundColor: '#A7B9A7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  returningUserButtonText: {
    ...typography.buttonText,
    color: '#ffffff',
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButtonText: {
    ...typography.buttonText,
    color: '#2c3e50',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    ...typography.bodySmall,
    marginHorizontal: 16,
    color: '#7f8c8d',
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
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.buttonText,
    color: '#ffffff',
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    ...typography.bodyMedium,
    color: '#6B7F6B',
  },
  linkTextBold: {
    ...typography.productName,
    color: '#6B7F6B',
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  linkButtonText: {
    ...typography.bodySmall,
    color: '#6B7F6B',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
}); 