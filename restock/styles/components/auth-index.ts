import { StyleSheet } from 'react-native';
import { fontFamily } from '../typography';
import colors, { type AppColors } from '@/app/theme/colors';

export const getAuthIndexStyles = (t: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.neutral.lighter,
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
    color: t.neutral.darkest,
  },
  subtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    color: t.brand.secondary,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: t.brand.primary,
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
    color: t.neutral.lightest,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: t.neutral.lightest,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: t.brand.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: t.brand.primary,
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
    color: t.brand.primary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

// Backward-compatible static export
export const authIndexStyles = getAuthIndexStyles(colors);