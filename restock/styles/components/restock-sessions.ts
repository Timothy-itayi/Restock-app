import { StyleSheet } from "react-native";
import { typography, fontFamily } from "../typography";
import colors, { type AppColors } from '../../lib/theme/colors';

export const getRestockSessionsStyles = (t: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: colors.neutral.lighter,
    overflow: "scroll",
    maxWidth: '100%',
    alignSelf: 'center',
    width: '100%',
  },
  
  startSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 200,
  },
  startPrompt: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 50,
    textAlign: "center",
  },
  instructions: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: colors.neutral.medium,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  startButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colors.neutral.lightest,
    fontSize: 18,
    fontWeight: "600",
  },

  existingSessionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: colors.neutral.medium,
    textAlign: "center",
    marginBottom: 24,
  },
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
    fontFamily: fontFamily.satoshiBold,
    color: colors.neutral.medium,
    fontSize: 16,
    fontWeight: "600",
  },

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
    fontFamily: fontFamily.satoshiBold,
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 8,
    textAlign: "center",
  },
  sessionSelectionSubtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: colors.neutral.medium,
    textAlign: "center",
  },
  sessionList: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: colors.neutral.lightest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    minWidth: '100%',
    maxWidth: '100%',
  },

  sessionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sessionCardTitle: {
    fontFamily: fontFamily.satoshiBold,
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
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    color: colors.neutral.medium,
    marginBottom: 4,
  },

  sessionCardSuppliers: {
    marginTop: 4,
  },

  sessionCardSuppliersText: {
    fontFamily: fontFamily.satoshi,
    fontSize: 12,
    color: colors.neutral.medium,
  },

  sessionCardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
    paddingTop: 12,
  },

  sessionCardAction: {
    fontFamily: fontFamily.satoshi,
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
    fontFamily: fontFamily.satoshiBold,
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
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.darkest,
   
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
    fontFamily: fontFamily.satoshi,
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
    fontFamily: fontFamily.satoshiBold,
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
    fontFamily: fontFamily.satoshi,
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
    fontFamily: fontFamily.satoshiItalic,
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
    width: 140,
    height: 90,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  
  addProductButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colors.neutral.lightest,
    fontSize: 20,
    fontWeight: "600",
  },
  
  // Product list container and header
  productListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  productListHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
    marginBottom: 16,
  },

  productListTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 4,
  },

  productListSubtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    color: colors.neutral.medium,
  },

  // Product list styles
  productList: {
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  
  // Product info label (category)
  productInfoLabel: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 14,
  
    lineHeight: 20,
    color: colors.neutral.darkest,
    fontWeight: "600", // Semi-bold for category
  },
  
  // Product info value
  productInfoValue: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    paddingLeft: 10,
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

  // Product info container
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  // Product name
  productName: {
    ...typography.productName,
    color: colors.neutral.darkest,
    marginBottom: 4,
  },
  
  // Product quantity
  productQuantity: {
    ...typography.bodySmall,
    color: colors.neutral.darkest,
    fontWeight: "500",
  },

  // Product actions container
  productActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  // Expand button
  expandIconButton: {
    padding: 4,
    borderRadius: 4,
  },

  // Product details (expanded view)
  productDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
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
  EditProductcontainer: {
   
    paddingTop: 1,
    backgroundColor: colors.neutral.lighter, // Warm paper background
  
  },
  
  // Form section divider for better visual separation
  formSectionDivider: {
    height: 1,
    backgroundColor: colors.neutral.light,
    marginVertical: 16,
    opacity: 0.3,
  },
  
  // Form card - Simplified for consistency
  formCard: {
  
    borderRadius: 8,
    padding: 30,
    
  },
  
  // Form title - More compact
  formTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.neutral.darkest,
    marginBottom: 24,
    textAlign: "center",
  },
  
  // Input group - Better spacing for visibility
  inputGroup: {
    marginBottom: 20,
  },
  
  // Input label - Compact but readable
  inputLabel: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 16,
    paddingBottom: 5,
    lineHeight: 20,
    fontWeight: '600' as const,
    color: colors.neutral.darkest,
  
  },
  
  // Text input - Consistent with sign-up form
  textInput: {
    ...typography.bodyMedium,
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 8,
    paddingHorizontal: 16,
  
    
    color: colors.neutral.darkest,
    minHeight: 60,
  },
  
  // Text input focus state - Consistent with sign-up form
  textInputFocused: {
    borderColor: colors.brand.primary,
    minHeight: 96,
  },
  
  // Quantity input - Consistent with sign-up form
  quantityInput: {
    ...typography.bodyMedium,
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    color: colors.neutral.darkest,
    textAlign: "center",
    width: 120,
    minHeight: 56,
  },
  
  // Quantity input focus state - Consistent with sign-up form
  quantityInputFocused: {
    borderColor: colors.brand.primary,
  },
  
  // Quantity container
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 12,
  },
  
  // Quantity button
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary, // Primary color for tappable buttons
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.neutral.lightest, // White text on colored button
  },

  // Quantity display
  quantityDisplay: {
    backgroundColor: colors.neutral.lighter, // Light background to distinguish from buttons
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.darkest,
    textAlign: "center",
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
  
  // Form buttons - Optimized spacing
  formButtons: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.brand.primary,
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 10,
    gap: 16,
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
  
  // Save button - Consistent with sign-up form
  saveButton: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
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

  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  
  emptyStateText: {
    ...typography.bodyMedium,
    color: colors.neutral.darkest,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },

  emptyStateSubtext: {
    ...typography.bodySmall,
    color: colors.neutral.light,
    textAlign: "center",
    lineHeight: 20,
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
