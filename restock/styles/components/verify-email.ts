import { StyleSheet } from 'react-native';
import { typography } from '../typography';
import colors from '../../lib/theme/colors';

export const verifyEmailStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.neutral.lighter,
    justifyContent: 'center',
  },
  title: {
    ...typography.appTitle,
    color: colors.neutral.darkest,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.neutral.medium,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    ...typography.bodyMedium,
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
    color: colors.neutral.darkest,
    minHeight: 56,
  },
  button: {
    backgroundColor: colors.brand.primary,
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
    color: colors.neutral.lightest,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    ...typography.bodyMedium,
    color: colors.brand.primary,
  },
}); 