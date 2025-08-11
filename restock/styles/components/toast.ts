import { StyleSheet } from 'react-native';
import { typography } from '../typography';
import colors from '@/app/theme/colors';

export const toastStyles = StyleSheet.create({
  // Main container - modern card-like design
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: colors.neutral.lightest,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    zIndex: 1000,
  },

  // Content layout
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  // Icon container - modern circular design
  toastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Icon styles for different types
  iconSuccess: {
    backgroundColor: colors.status.success, // Brand success
  },
  iconInfo: {
    backgroundColor: colors.status.info, // Info
  },
  iconWarning: {
    backgroundColor: colors.status.warning, // Warning
  },
  iconError: {
    backgroundColor: colors.status.error, // Error
  },

  // Text styles
  toastText: {
    ...typography.productName,
    color: colors.neutral.darkest,
    lineHeight: 22,
    flex: 1,
  },

  toastSubtext: {
    ...typography.bodySmall,
    color: colors.neutral.medium,
    lineHeight: 20,
    marginTop: 2,
    flex: 1,
  },

  // Actions container
  toastActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
  },

  // Button styles
  toastButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: colors.brand.primary, // Brand green
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },

  // Button text styles
  toastButtonText: {
    ...typography.buttonText,
    fontSize: 14,
    fontWeight: '500',
  },

  primaryButtonText: {
    color: colors.neutral.lightest,
  },

  secondaryButtonText: {
    color: colors.neutral.medium,
  },

  // Success toast specific styling
  toastSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.success,
  },

  // Info toast specific styling
  toastInfo: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.info,
  },

  // Warning toast specific styling
  toastWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },

  // Error toast specific styling
  toastError: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },

  // Modern close button
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.lighter,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    ...typography.buttonText,
    color: colors.neutral.medium,
    fontWeight: '500',
  },
}); 