import { StyleSheet } from "react-native";
import colors, { type AppColors } from '../../lib/theme/colors';
import { fontFamily, typography } from "../typography";

// Minimal, focused styles for the Upload Catalog screen only.
// Trimmed to what the screen actually uses and aligned with the
// previous inline styles for readability.
export const getUploadCatalogStyles = (t: AppColors) => StyleSheet.create({
  // Screen container background
  sessionContainer: {
    flex: 1,
    backgroundColor: colors.neutral.lighter,
  },

  // Title and subtitle at the top of the screen
  sessionSelectionTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: colors.neutral.medium,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Generic card container (used for sections)
  formCard: {
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 12,
    padding: 12,
  },

  // Inputs
  textInput: {
    ...typography.bodyMedium,
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.neutral.darkest,
  },

  // Primary and secondary buttons
  saveButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  saveButtonText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.buttonText,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: colors.neutral.darkest,
  },

  // Product list
  productListHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
    marginBottom: 8,
  },
  productListTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.darkest,
  },
  productListContainer: {
    flex: 1,
  },
  productItem: {
    backgroundColor: colors.neutral.lightest,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
  },

  // Compact filter/search section
  filterCard: {
    padding: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputSmall: {
    ...typography.bodySmall,
    flex: 1,
    height: 36,
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    backgroundColor: colors.neutral.lightest,
    marginRight: 8,
  },
  pillActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  pillText: {
    ...typography.bodySmall,
    color: colors.neutral.darkest,
  },
  pillTextActive: {
    color: colors.neutral.lightest,
  },
});
