import { StyleSheet } from 'react-native';
import { fontFamily } from '../typography';
import colors from '@/app/theme/colors';

export const authIndexStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.neutral.darkest,
  },
  subtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    color: colors.brand.secondary,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colors.neutral.lightest,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.neutral.lightest,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colors.brand.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    fontFamily: fontFamily.satoshi,
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 