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
    paddingTop: 8,
  },
  emailCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DEE2E6",
    gap: 6,
  },
  editButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: "#6B7F6B",
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
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#F8F9FA",
  },
  modalTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  modalCancelButton: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: "#6C757D",
  },
  modalSaveButton: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSupplierInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  modalSupplierName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: "#212529",
    fontWeight: "600",
  },
  modalSupplierEmail: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#6C757D",
    marginTop: 4,
  },
  modalInputSection: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: "#212529",
    marginBottom: 8,
    fontWeight: "500",
  },
  modalSubjectInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#212529",
    minHeight: 56,
  },
  modalBodyInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#212529",
    minHeight: 200,
    textAlignVertical: "top",
  },
  modalProductsSection: {
    marginTop: 20,
  },
  modalProductsList: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  modalProductItem: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
  },
  editedBadge: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  editedBadgeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: "#856404",
    fontWeight: "500",
  },
  modalInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    minHeight: 56,
  },
  modalTextArea: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    width: "100%",
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6B7F6B",
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: "#6B7F6B",
    textAlign: "center",
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
  // Updated Action Button Styles (smaller, centered)
  actionButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  
  actionSendButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  actionSendButtonDisabled: {
    backgroundColor: "#6C757D",
    shadowOpacity: 0,
    elevation: 0,
  },
  
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  actionSendButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Session Tabs Styles (enhanced for better visibility)
  sessionTabsContainer: {
    marginBottom: 16,
  },
  
  sessionTabsTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  
  sessionTabs: {
    flexGrow: 0,
  },
  
  sessionTabsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  
  sessionTab: {
    minWidth: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  
  sessionTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 8,
    paddingHorizontal: 4,
  },
  
  sessionTabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  
  sessionTabText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  sessionTabDate: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  
  sessionTabInfo: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#95A5A6',
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
  // AI Generation Progress Styles
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  progressIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F4F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  progressTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    textAlign: "center",
    marginBottom: 8,
  },
  progressSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 24,
  },

  // Send Confirmation Modal Styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  confirmationDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxWidth: 400,
    minWidth: 300,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  confirmationHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  confirmationTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#212529',
    fontWeight: '600',
  },

  confirmationContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },

  confirmationMessage: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },

  confirmationEmailCount: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  confirmationEmailCountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 4,
  },

  confirmationEmailCountLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  confirmationNote: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  confirmationActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12,
  },

  confirmationCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },

  confirmationCancelButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },

  confirmationConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderWidth: 1,
    borderColor: '#22C55E',
  },

  confirmationConfirmButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  confirmationIcon: {
    marginRight: 8,
  },
}); 