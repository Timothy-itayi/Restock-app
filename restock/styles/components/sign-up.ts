import { StyleSheet } from 'react-native';
import { typography } from '../typography';
import colors from '../../lib/theme/colors';

export const signUpStyles = StyleSheet.create({
 
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.neutral.lighter,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  googleButton: {
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButtonText: {
    ...typography.buttonText,
    color: colors.neutral.darkest,
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
    backgroundColor: colors.neutral.light,
  },
  dividerText: {
    ...typography.bodySmall,
    marginHorizontal: 16,
    color: colors.neutral.medium,
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
  inputError: {
    borderColor: colors.status.error,
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
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginBottom: 16,
  },
  helpText: {
    ...typography.bodySmall,
    color: colors.neutral.medium,
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
    color: colors.brand.primary,
  },
  linkTextBold: {
    ...typography.productName,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  passwordRules: {
    backgroundColor: colors.neutral.lighter,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  ruleText: {
    ...typography.bodySmall,
    color: colors.neutral.medium,
    marginBottom: 4,
    fontSize: 13,
  },
  ruleTextValid: {
    color: colors.status.success,
    fontWeight: '500',
  },
}); 