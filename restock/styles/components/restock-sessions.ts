import { StyleSheet } from "react-native";

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
    backgroundColor: "#FEFDF9", // Warm paper background
    overflow: "scroll",
  },
  
  // Start section for empty state
  startSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  
  // Welcome prompt with instructions
  startPrompt: {
    fontSize: 24,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
    textAlign: "center",
  },
  
  // Instructions text
  instructions: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  // Start button (green for progress)
  startButton: {
    backgroundColor: "#22C55E", // Green for progress
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  
  // Session container
  sessionContainer: {
    flex: 1,
    backgroundColor: "#FEFDF9", // Warm paper background
  },
  
  // Session header (removed title, keeping only actions)
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FDFBF3", // Slightly warmer paper
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
  },
  
  // Finish button (green for progress)
  finishButton: {
    backgroundColor: "#22C55E", // Green for progress
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  

  
  // Session summary
  sessionSummary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FEFDF9", // Warm paper background
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
  },
  
  summaryText: {
    fontSize: 14,
    color: "#212529",
    textAlign: "center",
  },
  
  // Add product section (simplified)
  addProductSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FDFBF3", // Slightly warmer paper
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
  },
  
  // Instructions for adding products
  addProductInstructions: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  
  // Divider between instructions and button
  divider: {
    height: 1,
    backgroundColor: "#DEE2E6", // Black divider
    marginVertical: 0,
  },
  
  // Add Product button section
  addProductButtonSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FDFBF3", // Slightly warmer paper
    alignItems: "flex-end", // Right align the button
  },
  
  // Add Product button (darker green with plus sign)
  addProductButton: {
    backgroundColor: "#16A34A", // Darker green
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },
  
  addProductButtonText: {
    color: "#FFFFFF",
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
    backgroundColor: "#FFFFFF", // Pure white for contrast
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DEE2E6", // Light grey border
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Notepad divider line
  notepadDivider: {
    height: 1,
    backgroundColor: "#F0F0F0", // Light grey line like notepad paper
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
    fontSize: 14,
    color: "#212529",
    fontWeight: "600", // Semi-bold for category
  },
  
  // Product info value
  productInfoValue: {
    fontSize: 14,
    color: "#495057", // Dark grey for values
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
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    flex: 1,
  },
  
  // Product quantity
  productQuantity: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
    marginRight: 12,
  },
  
  // Edit button (yellow/brown for edit)
  editButton: {
    backgroundColor: "#F97316", // Orange for edit
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F97316",
  },
  
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // Edit icon button
  editIconButton: {
    backgroundColor: "#F97316", // Orange for edit
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Delete button (red for delete)
  deleteButton: {
    backgroundColor: "#EF4444", // Red for delete
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  
  // Delete icon button
  deleteIconButton: {
    backgroundColor: "#EF4444", // Red for delete
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Product supplier info
  productSupplier: {
    fontSize: 14,
    color: "#212529",
    marginBottom: 4,
    fontWeight: "600", // Semi-bold for category
  },
  
  productEmail: {
    fontSize: 14,
    color: "#495057", // Dark grey for values
    fontWeight: "400", // Regular weight for values
  },
  
  // Form container
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FEFDF9", // Warm paper background
  },
  
  // Form title
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 24,
    textAlign: "center",
  },
  
  // Input group
  inputGroup: {
    marginBottom: 20,
  },
  
  // Input label
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    marginBottom: 8,
  },
  
  // Text input with notepad style
  textInput: {
    borderWidth: 1,
    borderColor: "#DEE2E6", // Light grey border
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF", // Pure white background
    color: "#212529",
  },
  
  // Quantity input
  quantityInput: {
    borderWidth: 1,
    borderColor: "#DEE2E6", // Light grey border
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF", // Pure white background
    color: "#212529",
    textAlign: "center",
    width: 100,
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
    backgroundColor: "#F8F9FA", // Very light grey
    borderWidth: 1,
    borderColor: "#DEE2E6", // Light grey border
    alignItems: "center",
    justifyContent: "center",
  },
  
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  
  // Suggestion item
  suggestionItem: {
    backgroundColor: "#F8F9FA", // Very light grey
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#DEE2E6", // Light grey border
  },
  
  suggestionText: {
    fontSize: 14,
    color: "#212529",
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
    backgroundColor: "#F8F9FA", // Very light grey
    borderWidth: 1,
    borderColor: "#DEE2E6", // Light grey border
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  
  // Save button (green for progress)
  saveButton: {
    flex: 1,
    backgroundColor: "#22C55E", // Green for progress
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  
  cancelButtonText: {
    color: "#212529",
  },
  
  saveButtonText: {
    color: "#FFFFFF",
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: "#212529",
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
    color: "#6C757D", // Grey color like the reference
    marginRight: 12,
    fontWeight: "500",
  },
  
  integratedAddButtonText: {
    fontSize: 16,
    color: "#6C757D", // Grey color like the reference
    fontWeight: "500",
  },
  
  // Error message
  errorMessage: {
    backgroundColor: "#F8F9FA", // Very light grey
    borderWidth: 1,
    borderColor: "#EF4444", // Red border
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  
  errorText: {
    color: "#EF4444", // Red text
    fontSize: 14,
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
    backgroundColor: "#22C55E", // Green for progress
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
    color: "#FFFFFF",
    fontSize: 24,
  },
  
  // Bottom finish section
  bottomFinishSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FDFBF3", // Slightly warmer paper
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6", // Light grey border
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Account for safe area
  },
  
  // Bottom finish button
  bottomFinishButton: {
    backgroundColor: "#22C55E", // Green for progress
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  
  bottomFinishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
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
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  
  notificationClose: {
    padding: 2,
  },
  
  notificationCloseText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Notification type styles
  notificationSuccess: {
    backgroundColor: "#22C55E", // Green for success
  },
  
  notificationSuccessIcon: {
    backgroundColor: "#16A34A", // Darker green
  },
  
  notificationInfo: {
    backgroundColor: "#3B82F6", // Blue for info
  },
  
  notificationInfoIcon: {
    backgroundColor: "#1D4ED8", // Darker blue
  },
  
  notificationWarning: {
    backgroundColor: "#F59E0B", // Amber for warning
  },
  
  notificationWarningIcon: {
    backgroundColor: "#D97706", // Darker amber
  },
  
  notificationError: {
    backgroundColor: "#EF4444", // Red for error
  },
  
  notificationErrorIcon: {
    backgroundColor: "#DC2626", // Darker red
  },
  
  // Error handling styles
  errorContainer: {
    backgroundColor: "#F8F9FA", // Very light grey
    borderWidth: 1,
    borderColor: "#EF4444", // Red border
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: "center",
  },
  
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444", // Red text
    marginBottom: 8,
    textAlign: "center",
  },
  
  errorStateMessage: {
    fontSize: 14,
    color: "#EF4444", // Red text
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  
  retryButton: {
    backgroundColor: "#22C55E", // Green for retry
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
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
    fontSize: 16,
    color: "#212529",
    textAlign: "center",
  },
}); 