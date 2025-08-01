import { StyleSheet } from "react-native";

export const emailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFDF9", // Warm paper background like restock sessions
  },
  header: {
    backgroundColor: "#FDFBF3", // Slightly warmer paper
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    fontWeight: "600",
    color: "#212529", // Dark text
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#6C757D", // Grey text
    marginTop: 4,
    textAlign: "center",
  },
  emailSummary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FDFBF3", // Slightly warmer paper
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
  },
  summaryText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#6C757D", // Grey text
    textAlign: "center",
  },
  emailList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emailCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emailCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  emailDetails: {
    flex: 1,
    marginRight: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emailSubject: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 6,
    lineHeight: 22,
    flex: 1,
  },
  emailSupplier: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: "#000000",
    marginBottom: 4,
  },
  emailPreview: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
    marginTop: 8,
  },
  emailActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  editButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
  },
  editButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  // Edit icon button
  editIconButton: {
    backgroundColor: "#F97316", // Orange for edit
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  // Notepad divider line
  notepadDivider: {
    height: 1,
    backgroundColor: "#F0F0F0", // Light grey line like notepad paper
    marginVertical: 8,
    marginHorizontal: -8, // Extend slightly beyond padding
  },
  // Email info row container
  emailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  // Email info label (category)
  emailInfoLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: "#212529",
    fontWeight: "600", // Semi-bold for category
  },
  // Email info value
  emailInfoValue: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#495057", // Dark grey for values
    fontWeight: "400", // Regular weight for values
  },
  regenerateButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  regenerateButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  statusText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
  },
  statusDraft: {
    backgroundColor: "#6C757D", // Grey for draft
  },
  statusDraftText: {
    color: "#FFFFFF", // White text on grey background
  },
  statusSending: {
    backgroundColor: "#F97316", // Orange/brown for in-progress
  },
  statusSendingText: {
    color: "#FFFFFF", // White text on orange background
  },
  statusSent: {
    backgroundColor: "#22C55E", // Green for sent
  },
  statusSentText: {
    color: "#FFFFFF", // White text on green background
  },
  statusFailed: {
    backgroundColor: "#EF4444", // Red for failed
  },
  statusFailedText: {
    color: "#FFFFFF", // White text on red background
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  modalContent: {
    padding: 16,
  },
  modalInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  modalTextArea: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    height: 200,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    fontWeight: "500",
  },
  modalCancelButton: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E5E5E5",
  },
  modalCancelButtonText: {
    color: "#000000",
  },
  modalSaveButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  modalSaveButtonText: {
    color: "#FFFFFF",
  },
  sendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    margin: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  sendingTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#000000",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  successTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
  },
  doneButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  sendAllButton: {
    backgroundColor: "#22C55E", // Green like restock sessions
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22C55E", // Green border
  },
  sendAllButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
  },
}); 