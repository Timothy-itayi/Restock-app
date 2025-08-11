import { StyleSheet } from "react-native";
import colors from '@/app/theme/colors';

export const emailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lighter, // Warm paper background like restock sessions
  },
  header: {
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    fontWeight: "600",
    color: colors.neutral.darkest, // Dark text
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.medium, // Grey text
    marginTop: 4,
    textAlign: "center",
  },
  emailSummary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.lighter, // Slightly warmer paper
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },
  summaryText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.medium, // Grey text
    textAlign: "center",
  },
  emailList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emailCard: {
    backgroundColor: colors.neutral.lightest,
    borderWidth: 1,
    borderColor: colors.neutral.light,
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
    color: colors.neutral.darkest,
    marginBottom: 6,
    lineHeight: 22,
    flex: 1,
  },
  emailSupplier: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: colors.neutral.darkest,
    marginBottom: 4,
  },
  emailPreview: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.darkest,
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
    backgroundColor: colors.neutral.lighter,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    gap: 6,
  },
  editButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  // Edit icon button
  editIconButton: {
    backgroundColor: colors.brand.accent, // Orange for edit
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  // Notepad divider line
  notepadDivider: {
    height: 1,
    backgroundColor: colors.neutral.light, // Light grey line like notepad paper
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
    color: colors.neutral.darkest,
    fontWeight: "600", // Semi-bold for category
  },
  // Email info value
  emailInfoValue: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.dark, // Dark grey for values
    fontWeight: "400", // Regular weight for values
  },
  regenerateButton: {
    backgroundColor: colors.neutral.lighter,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  regenerateButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: colors.neutral.darkest,
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },
  statusText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    fontWeight: "500",
    color: colors.neutral.darkest,
  },
  statusDraft: {
    backgroundColor: colors.neutral.medium, // Grey for draft
  },
  statusDraftText: {
    color: colors.neutral.lightest, // White text on grey background
  },
  statusSending: {
    backgroundColor: colors.brand.accent, // Orange/brown for in-progress
  },
  statusSendingText: {
    color: colors.neutral.lightest, // White text on orange background
  },
  statusSent: {
    backgroundColor: colors.status.success, // Green for sent
  },
  statusSentText: {
    color: colors.neutral.lightest, // White text on green background
  },
  statusFailed: {
    backgroundColor: colors.status.error, // Red for failed
  },
  statusFailedText: {
    color: colors.neutral.lightest, // White text on red background
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.state.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
    backgroundColor: colors.neutral.lighter,
  },
  modalTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.darkest,
  },
  modalCancelButton: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.neutral.medium,
  },
  modalSaveButton: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.status.info,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSupplierInfo: {
    backgroundColor: colors.neutral.lighter,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },
  modalSupplierName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: colors.neutral.darkest,
    fontWeight: "600",
  },
  modalSupplierEmail: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.medium,
    marginTop: 4,
  },
  modalInputSection: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.neutral.darkest,
    marginBottom: 8,
    fontWeight: "500",
  },
  modalSubjectInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    backgroundColor: colors.neutral.lightest,
    color: colors.neutral.darkest,
    minHeight: 56,
  },
  modalBodyInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: colors.neutral.lightest,
    color: colors.neutral.darkest,
    minHeight: 200,
    textAlignVertical: "top",
  },
  modalProductsSection: {
    marginTop: 20,
  },
  modalProductsList: {
    backgroundColor: colors.neutral.lighter,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },
  modalProductItem: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.dark,
    marginBottom: 4,
  },
  editedBadge: {
    backgroundColor: colors.status.warning + '33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  editedBadgeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: colors.neutral.dark,
    fontWeight: "500",
  },
  modalInput: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: colors.neutral.lightest,
    color: colors.neutral.darkest,
    minHeight: 56,
  },
  modalTextArea: {
    fontFamily: 'Satoshi-Regular',
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    height: 200,
    textAlignVertical: "top",
    backgroundColor: colors.neutral.lightest,
    color: colors.neutral.darkest,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
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
    backgroundColor: colors.state.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  sendingContainer: {
    backgroundColor: colors.neutral.lightest,
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    margin: 20,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },
  sendingTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: colors.neutral.light,
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: colors.brand.primary,
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },
  successTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral.darkest,
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    color: colors.neutral.darkest,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: colors.neutral.darkest,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral.darkest,
  },
  doneButtonText: {
    fontFamily: 'Satoshi-Medium',
    color: colors.neutral.lightest,
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
    color: colors.neutral.darkest,
    fontWeight: "500",
  },
  // Updated Action Button Styles (smaller, centered)
  actionButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  
  actionSendButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
    shadowColor: colors.brand.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  actionSendButtonDisabled: {
    backgroundColor: colors.neutral.medium,
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
    color: colors.neutral.lightest,
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
    color: colors.neutral.darkest,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  
  sessionTabs: {
    flexGrow: 0,
  },
  
  sessionTabsContent: {
    paddingHorizontal: 16,
  },
  
  sessionTab: {
    minWidth: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
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
    color: colors.neutral.medium,
    marginBottom: 2,
  },
  
  sessionTabInfo: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: colors.neutral.medium,
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
    color: colors.neutral.darkest,
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
    backgroundColor: colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  progressTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.darkest,
    textAlign: "center",
    marginBottom: 8,
  },
  progressSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.medium,
    textAlign: "center",
    marginBottom: 24,
  },

  // Send Confirmation Modal Styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: colors.state.overlay,
  },

  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  confirmationDialog: {
    backgroundColor: colors.neutral.lightest,
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
    borderBottomColor: colors.neutral.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  confirmationTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: colors.neutral.darkest,
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
    color: colors.neutral.dark,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },

  confirmationEmailCount: {
    backgroundColor: colors.status.success + '22',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.status.success,
  },

  confirmationEmailCountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.status.success,
    marginBottom: 4,
  },

  confirmationEmailCountLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: colors.status.success,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  confirmationNote: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: colors.neutral.medium,
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
    backgroundColor: colors.neutral.lighter,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },

  confirmationCancelButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.neutral.medium,
    fontWeight: '600',
  },

  confirmationConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },

  confirmationConfirmButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.neutral.lightest,
    fontWeight: '600',
  },

  confirmationIcon: {
    marginRight: 8,
  },
}); 