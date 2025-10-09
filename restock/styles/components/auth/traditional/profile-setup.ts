import { StyleSheet } from 'react-native';
import { typography } from '../../../typography';
import colors from '../../../../lib/theme/colors';

export const profileSetupStyles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lighter,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    ...typography.appTitle,
    color: colors.neutral.darkest,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.brand.secondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.subsectionHeader,
    color: colors.neutral.darkest,
    marginBottom: 12,
    marginTop: 20,
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
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontWeight: '600',
  },
}); 