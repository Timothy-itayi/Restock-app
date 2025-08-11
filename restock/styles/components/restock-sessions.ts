import { StyleSheet } from "react-native";
import { typography } from "../typography";
import colors from '@/app/theme/colors';

// Notepad Color Palette with semantic button colors
// Primary: Industrial Grey (#6C757D)
// Paper: Warm cream (#FEFDF9, #FDFBF3)
// Borders: Light grey (#DEE2E6)
// Text: Dark grey (#212529)
// Buttons: Green for progress, Yellow/Brown for edit, Red for delete

export const restockSessionsStyles = StyleSheet.create({
  // Main container with notepad background
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lighter, // Warm paper background
    overflow: "scroll",
  },
  
  // Start section for empty state
  startSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 200,
  },
  
  // Welcome prompt with instructions
  startPrompt: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 50,
    textAlign: "center",
  },
  
  // Instructions text
  instructions: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: colors.neutral.medium,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  // Start button (green for progress)
  startButton: {
    backgroundColor: colors.brand.primary, // Green for progress
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  
  startButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: colors.neutral.lightest,
    fontSize: 18,
    fontWeight: "600",
  },

  // Existing sessions button
  existingSessionsButton: {
    backgroundColor: colors.neutral.lighter,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  existingSessionsButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: colors.neutral.medium,
    fontSize: 16,
    fontWeight: "600",
  },

  // Session selection styles
  sessionSelectionContainer: {
    flex: 1,
    backgroundColor: colors.neutral.lighter,
    paddingHorizontal: 20,
  },

  sessionSelectionHeader: {
    paddingVertical: 24,
    alignItems: "center",
  },

  sessionSelectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 8,
    textAlign: "center",
  },

  sessionSelectionSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: colors.neutral.medium,
    textAlign: "center",
  },

  sessionList: {
    flex: 1,
  },

  sessionCard: {
    backgroundColor: colors.neutral.lightest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  sessionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sessionCardTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.darkest,
    flex: 1,
  },

  sessionDeleteButton: {
    padding: 4,
  },

  sessionCardContent: {
    marginBottom: 12,
  },

  sessionCardSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.medium,
    marginBottom: 4,
  },

  sessionCardSuppliers: {
    marginTop: 4,
  },

  sessionCardSuppliersText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: colors.neutral.medium,
  },

  sessionCardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
    paddingTop: 12,
  },

  sessionCardAction: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: colors.brand.primary,
    textAlign: "center",
  },

  sessionSelectionFooter: {
    paddingVertical: 20,
  },

  newSessionButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22C55E",
  },

  newSessionButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Session container
  sessionContainer: {
    flex: 1,
    backgroundColor: colors.neutral.lighter, // Warm paper background
  },
  
  // Session header with switcher
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },

  sessionHeaderLeft: {
    flex: 1,
  },

  sessionHeaderTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 4,
  },

  sessionSwitcherButton: {
    backgroundColor: colors.neutral.lighter,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  sessionSwitcherText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: colors.neutral.medium,
  },
  
  // Finish button (green for progress)
  finishButton: {
    backgroundColor: colors.brand.primary, // Green for progress
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  
  finishButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: colors.neutral.lightest,
    fontSize: 16,
    fontWeight: "600",
  },
  

  
  // Session summary
  sessionSummary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.neutral.lighter, // Warm paper background
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },
  
  summaryText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.darkest,
    textAlign: "center",
  },
  
  // Add product section (simplified)
  addProductSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },
  
  // Instructions for adding products
  addProductInstructions: {
    fontFamily: 'Satoshi-Italic',
    fontSize: 14,
    color: colors.neutral.medium,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  
  // Divider between instructions and button
  divider: {
    height: 1,
    backgroundColor: colors.neutral.light, // Divider
    marginVertical: 0,
  },
  
  // Add Product button section
  addProductButtonSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    alignItems: "flex-end", // Right align the button
  },
  
  // Add Product button (darker green with plus sign)
  addProductButton: {
    backgroundColor: colors.brand.primary, // Brand green
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  
  addProductButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: colors.neutral.lightest,
    fontSize: 20,
    fontWeight: "600",
  },
  
  // Product list container
  productList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  
  // Product list content container
  productListContent: {
    paddingBottom: 120, // Extra space to ensure Add Product button is accessible
    flexGrow: 1, // Allow content to grow and enable scrolling
  },
  
  // Product item with notepad aesthetic
  productItem: {
    backgroundColor: colors.neutral.lightest, // Pure white for contrast
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral.light, // Light grey border
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Notepad divider line
  notepadDivider: {
    height: 1,
    backgroundColor: colors.neutral.light, // Light grey line like notepad paper
    marginVertical: 8,
    marginHorizontal: -8, // Extend slightly beyond padding
  },
  
  // Product info row container
  productInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  // Product info label (category)
  productInfoLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: colors.neutral.darkest,
    fontWeight: "600", // Semi-bold for category
  },
  
  // Product info value
  productInfoValue: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.dark, // Dark grey for values
    fontWeight: "400", // Regular weight for values
  },
  
  // Product header
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  
  // Product name
  productName: {
    ...typography.productName,
    color: colors.neutral.darkest,
    flex: 1,
  },
  
  // Product quantity
  productQuantity: {
    ...typography.bodySmall,
    color: colors.neutral.darkest,
    fontWeight: "500",
    marginRight: 12,
  },
  
  // Edit button (yellow/brown for edit)
  editButton: {
    backgroundColor: colors.brand.accent, // Orange for edit
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.brand.accent,
  },
  
  editButtonText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontSize: 12,
    fontWeight: "600",
  },
  
  // Edit icon button
  editIconButton: {
    backgroundColor: colors.brand.accent, // Orange for edit
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Delete button (red for delete)
  deleteButton: {
    backgroundColor: colors.status.error, // Red for delete
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  
  deleteButtonText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontSize: 12,
    fontWeight: "500",
  },
  
  // Delete icon button
  deleteIconButton: {
    backgroundColor: colors.status.error, // Red for delete
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.status.error,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Product supplier info
  productSupplier: {
    ...typography.bodySmall,
    color: colors.neutral.darkest,
    marginBottom: 4,
    fontWeight: "600", // Semi-bold for category
  },
  
  productEmail: {
    ...typography.bodySmall,
    color: colors.neutral.dark, // Dark grey for values
    fontWeight: "400", // Regular weight for values
  },
  
  // Form container
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.neutral.lighter, // Warm paper background
  },
  
  // Form title
  formTitle: {
    ...typography.subsectionHeader,
    color: colors.neutral.darkest,
    marginBottom: 24,
    textAlign: "center",
  },
  
  // Input group
  inputGroup: {
    marginBottom: 20,
  },
  
  // Input label
  inputLabel: {
    ...typography.productName,
    color: colors.neutral.darkest,
    marginBottom: 8,
  },
  
  // Text input with notepad style
  textInput: {
    ...typography.bodyMedium,
    borderWidth: 1,
    borderColor: colors.neutral.light, // Light grey border
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.neutral.lightest, // Pure white background
    color: colors.neutral.darkest,
    minHeight: 56,
  },
  
  // Quantity input
  quantityInput: {
    ...typography.bodyMedium,
    borderWidth: 1,
    borderColor: colors.neutral.light, // Light grey border
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.neutral.lightest, // Pure white background
    color: colors.neutral.darkest,
    textAlign: "center",
    width: 100,
    minHeight: 56,
  },
  
  // Quantity container
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  
  // Quantity button
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.lighter, // Very light grey
    borderWidth: 1,
    borderColor: colors.neutral.light, // Light grey border
    alignItems: "center",
    justifyContent: "center",
  },
  
  quantityButtonText: {
    ...typography.bodyLarge,
    fontWeight: "600",
    color: colors.neutral.darkest,
  },
  
  // Suggestion item
  suggestionItem: {
    backgroundColor: colors.neutral.lighter, // Very light grey
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.neutral.light, // Light grey border
  },
  
  suggestionText: {
    ...typography.bodySmall,
    color: colors.neutral.darkest,
  },
  
  // Form buttons
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    gap: 12,
  },
  
  // Cancel button
  cancelButton: {
    flex: 1,
    backgroundColor: colors.neutral.lighter, // Very light grey
    borderWidth: 1,
    borderColor: colors.neutral.light, // Light grey border
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  
  // Save button (green for progress)
  saveButton: {
    flex: 1,
    backgroundColor: colors.brand.primary, // Green for progress
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  
  buttonText: {
    ...typography.buttonText,
    fontWeight: "600",
  },
  
  cancelButtonText: {
    color: colors.neutral.darkest,
  },
  
  saveButtonText: {
    color: colors.neutral.lightest,
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  emptyStateText: {
    ...typography.bodyMedium,
    color: colors.neutral.darkest,
    textAlign: "center",
    lineHeight: 24,
  },
  
  // Integrated Add Product button (inspired by the reference image)
  integratedAddButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  
  integratedAddButtonIcon: {
    fontSize: 18,
    color: colors.neutral.medium, // Grey color like the reference
    marginRight: 12,
    fontWeight: "500",
  },
  
  integratedAddButtonText: {
    ...typography.productName,
    color: colors.neutral.medium, // Grey color like the reference
    fontWeight: "500",
  },
  
  // Error message
  errorMessage: {
    backgroundColor: colors.neutral.lighter, // Very light grey
    borderWidth: 1,
    borderColor: colors.status.error, // Red border
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error, // Red text
    textAlign: "center",
  },
  
  // Floating add button
  floatingAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary, // Green for progress
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Floating button icon
  floatingButtonIcon: {
    color: colors.neutral.lightest,
    fontSize: 24,
  },
  
  // Bottom finish section
  bottomFinishSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light, // Light grey border
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Account for safe area
  },
  
  // Bottom finish button
  bottomFinishButton: {
    backgroundColor: colors.brand.primary, // Green for progress
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  
  bottomFinishButtonText: {
    ...typography.bodyLarge,
    color: colors.neutral.lightest,
    fontWeight: "600",
  },

  // Email Ready Section
  emailReadySection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light, // Light grey border
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34, // Account for safe area
  },

  emailReadyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  emailReadyTitle: {
    ...typography.subsectionHeader,
    color: colors.neutral.darkest,
    fontWeight: "600",
    marginLeft: 8,
  },

  emailReadySummary: {
    marginBottom: 16,
  },

  emailReadyDescription: {
    ...typography.bodyMedium,
    color: colors.neutral.medium,
    marginBottom: 12,
    lineHeight: 20,
  },

  emailReadyStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.neutral.lightest,
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },

  emailReadyStat: {
    alignItems: "center",
  },

  emailReadyStatNumber: {
    ...typography.sectionHeader,
    color: colors.neutral.darkest,
    fontWeight: "700",
    marginBottom: 2,
  },

  emailReadyStatLabel: {
    ...typography.caption,
    color: colors.neutral.medium,
    fontWeight: "500",
  },

  emailReadyActions: {
    flexDirection: "row",
    gap: 12,
  },

  emailReadySecondaryButton: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },

  emailReadySecondaryButtonText: {
    ...typography.bodyMedium,
    color: colors.neutral.medium,
    fontWeight: "600",
  },

  emailReadyPrimaryButton: {
    flex: 2,
    backgroundColor: colors.brand.primary, // Green for primary action
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },

  emailReadyButtonIcon: {
    marginRight: 8,
  },

  emailReadyPrimaryButtonText: {
    ...typography.bodyMedium,
    color: colors.neutral.lightest,
    fontWeight: "600",
  },
  
  // Notification styles
  notificationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  
  notificationText: {
    flex: 1,
    ...typography.bodySmall,
    fontWeight: "500",
    color: colors.neutral.lightest,
  },
  
  notificationClose: {
    padding: 2,
  },
  
  notificationCloseText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontWeight: "600",
  },
  
  // Notification type styles
  notificationSuccess: {
    backgroundColor: colors.status.success, // Green for success
  },
  
  notificationSuccessIcon: {
    backgroundColor: colors.status.success,
  },
  
  notificationInfo: {
    backgroundColor: colors.status.info, // Blue for info
  },
  
  notificationInfoIcon: {
    backgroundColor: colors.status.info, // Use same family
  },
  
  notificationWarning: {
    backgroundColor: colors.status.warning, // Amber for warning
  },
  
  notificationWarningIcon: {
    backgroundColor: colors.status.warning,
  },
  
  notificationError: {
    backgroundColor: colors.status.error, // Red for error
  },
  
  notificationErrorIcon: {
    backgroundColor: colors.status.error, // Darker red
  },
  
  // Error handling styles
  errorContainer: {
    backgroundColor: colors.neutral.lighter, // Very light grey
    borderWidth: 1,
    borderColor: colors.status.error, // Red border
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: "center",
  },
  
  errorTitle: {
    ...typography.bodyLarge,
    fontWeight: "600",
    color: colors.status.error, // Red text
    marginBottom: 8,
    textAlign: "center",
  },
  
  errorStateMessage: {
    ...typography.bodySmall,
    color: colors.status.error, // Red text
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  
  retryButton: {
    backgroundColor: colors.brand.primary, // Green for retry
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  
  retryButtonText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontWeight: "600",
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  loadingText: {
    ...typography.bodyMedium,
    color: colors.neutral.darkest,
    textAlign: "center",
  },
}); 