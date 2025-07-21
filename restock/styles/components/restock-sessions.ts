import { StyleSheet } from "react-native";

export const restockSessionsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    overflow: "scroll",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  // Start Session Section
  startSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  startPrompt: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 40,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: "center",
    minWidth: 200,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  // Session Flow Section
  sessionContainer: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  finishButton: {
    backgroundColor: "#228B22", // Forest green
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Product List
  productList: {
    flex: 1,
  },
  productItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  productQuantity: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000", // Black
    marginLeft: 12,
  },
  productSupplier: {
    fontSize: 15,
    color: "#4A4A4A", // Dark grey
    marginBottom: 4,
  },
  productEmail: {
    fontSize: 15,
    color: "#4A4A4A", // Dark grey
  },
  deleteButton: {
    backgroundColor: "#8B0000", // Dark red
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#FF8C00", // Amber
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  // Add Product Section
  addProductSection: {
    marginBottom: 24,
  },
  addProductButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  addProductButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  // Form Styles
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
  },
  textInputFocused: {
    borderColor: "#007AFF",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    color: "#1A1A1A",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#666666",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  // Error Message
  errorMessage: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 20,
  },
  // Suggestion Items
  suggestionItem: {
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  suggestionText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  // Session Summary
  sessionSummary: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  summaryText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  // Notification Modal
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  notificationClose: {
    padding: 4,
  },
  notificationCloseText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  // Notification Types
  notificationSuccess: {
    backgroundColor: '#F0F9FF',
    borderBottomColor: '#0EA5E9',
  },
  notificationSuccessIcon: {
    backgroundColor: '#0EA5E9',
  },
  notificationInfo: {
    backgroundColor: '#F0FDF4',
    borderBottomColor: '#22C55E',
  },
  notificationInfoIcon: {
    backgroundColor: '#22C55E',
  },
  notificationWarning: {
    backgroundColor: '#FFFBEB',
    borderBottomColor: '#F59E0B',
  },
  notificationWarningIcon: {
    backgroundColor: '#F59E0B',
  },
  notificationError: {
    backgroundColor: '#FEF2F2',
    borderBottomColor: '#EF4444',
  },
  notificationErrorIcon: {
    backgroundColor: '#EF4444',
  },
}); 