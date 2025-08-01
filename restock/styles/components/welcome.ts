import { StyleSheet } from 'react-native';
import { fontFamily } from '../typography';

export const welcomeStyles = StyleSheet.create({
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
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    color: '#6B7F6B',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsSection: {
    marginBottom: 20,
  },
  emailSection: {
    marginBottom: 20,
  },
  passwordSection: {
    marginBottom: 20,
  },
  storeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    fontFamily: fontFamily.satoshi,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
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
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  returningUserButton: {
    backgroundColor: '#A7B9A7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fontFamily.satoshiBold,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  returningUserButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    fontSize: 16,
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
    fontFamily: 'Satoshi-Regular',
    marginHorizontal: 16,
    color: '#7f8c8d',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontFamily: 'Satoshi-Regular',
    color: '#6B7F6B',
    fontSize: 16,
  },
  signInLink: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  signInLinkText: {
    fontFamily: 'Satoshi-Regular',
    color: '#6B7F6B',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    backgroundColor: '#6B7F6B',
    borderWidth: 2,
    borderColor: '#6B7F6B',
  },
  primaryButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6B7F6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#6B7F6B',
    fontSize: 16,
    fontWeight: '600',
  },
}); 