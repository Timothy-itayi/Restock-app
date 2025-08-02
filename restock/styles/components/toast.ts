import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const toastStyles = StyleSheet.create({
  // Main container - modern card-like design
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
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
    borderColor: '#F0F0F0',
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
    backgroundColor: '#10B981', // Modern green
  },
  iconInfo: {
    backgroundColor: '#3B82F6', // Modern blue
  },
  iconWarning: {
    backgroundColor: '#F59E0B', // Modern amber
  },
  iconError: {
    backgroundColor: '#EF4444', // Modern red
  },

  // Text styles
  toastText: {
    ...typography.productName,
    color: '#1F2937',
    lineHeight: 22,
    flex: 1,
  },

  toastSubtext: {
    ...typography.bodySmall,
    color: '#6B7280',
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
    borderTopColor: '#F3F4F6',
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
    backgroundColor: '#6B7F6B', // Sage green from your theme
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  // Button text styles
  toastButtonText: {
    ...typography.buttonText,
    fontSize: 14,
    fontWeight: '500',
  },

  primaryButtonText: {
    color: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#6B7280',
  },

  // Success toast specific styling
  toastSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  // Info toast specific styling
  toastInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  // Warning toast specific styling
  toastWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  // Error toast specific styling
  toastError: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },

  // Modern close button
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    ...typography.buttonText,
    color: '#6B7280',
    fontWeight: '500',
  },
}); 