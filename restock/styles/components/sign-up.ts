import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const signUpStyles = StyleSheet.create({
 
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
    color: '#000000',
    minHeight: 56,
  },
  inputError: {
    borderColor: '#e74c3c',
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
  errorText: {
    ...typography.bodySmall,
    color: '#e74c3c',
    marginBottom: 16,
  },
  helpText: {
    ...typography.bodySmall,
    color: '#7f8c8d',
    marginBottom: 16,
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
  passwordRules: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  ruleText: {
    ...typography.bodySmall,
    color: '#7f8c8d',
    marginBottom: 4,
    fontSize: 13,
  },
  ruleTextValid: {
    color: '#27ae60',
    fontWeight: '500',
  },
}); 