import { StyleSheet } from "react-native";

// Palette:
// Burnt Sienna: #B23A00
// Peach/Yellow-Orange: #F6B04E
// Dark Sage Green: #6B7F6B
// Light Sage Green: #A7B9A7

export const restockSessionsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
    overflow: "scroll",
  },
  startSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  startPrompt: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 32,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#6B7F6B", // Dark sage green
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6B7F6B",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  sessionContainer: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#A7B9A7", // Light sage green
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  finishButton: {
    backgroundColor: "#A7B9A7", // Light sage green
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7B9A7",
  },
  finishButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  sessionSummary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F5F7F6",
    borderBottomWidth: 1,
    borderBottomColor: "#A7B9A7",
  },
  summaryText: {
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
  },
  addProductSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#A7B9A7",
  },
  addProductButton: {
    backgroundColor: "#6B7F6B", // Dark sage green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6B7F6B",
  },
  addProductButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  productList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  productItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A7B9A7",
    shadowColor: "#B23A00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  productQuantity: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    marginRight: 12,
  },
  editButton: {
    backgroundColor: "#F6B04E", // Yellow/orange
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F6B04E",
  },
  editButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#B23A00", // Burnt sienna
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#B23A00",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  productSupplier: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 4,
  },
  productEmail: {
    fontSize: 14,
    color: "#000000",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7F6",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#A7B9A7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#A7B9A7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    textAlign: "center",
    width: 100,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F7F6",
    borderWidth: 1,
    borderColor: "#A7B9A7",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  suggestionItem: {
    backgroundColor: "#F5F7F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#A7B9A7",
  },
  suggestionText: {
    fontSize: 14,
    color: "#000000",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F7F6",
    borderWidth: 1,
    borderColor: "#A7B9A7",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#A7B9A7",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7B9A7",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#000000",
  },
  saveButtonText: {
    color: "#000000",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    lineHeight: 24,
  },
  errorMessage: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#B23A00",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#B23A00",
    fontSize: 14,
    textAlign: "center",
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
    shadowColor: "#B23A00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
    backgroundColor: "#A7B9A7",
  },
  notificationSuccessIcon: {
    backgroundColor: "#6B7F6B",
  },
  notificationInfo: {
    backgroundColor: "#F6B04E",
  },
  notificationInfoIcon: {
    backgroundColor: "#B23A00",
  },
  notificationWarning: {
    backgroundColor: "#F6B04E",
  },
  notificationWarningIcon: {
    backgroundColor: "#B23A00",
  },
  notificationError: {
    backgroundColor: "#B23A00",
  },
  notificationErrorIcon: {
    backgroundColor: "#6B7F6B",
  },
  // Error handling styles
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#B23A00",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#B23A00",
    marginBottom: 8,
    textAlign: "center",
  },
  errorStateMessage: {
    fontSize: 14,
    color: "#B23A00",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#B23A00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B23A00",
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
    color: "#000000",
    textAlign: "center",
  },
}); 