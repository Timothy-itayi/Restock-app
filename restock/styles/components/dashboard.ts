

import { StyleSheet } from "react-native";
import { fontFamily } from "../typography";
import colors, { type AppColors } from '../../lib/theme/colors';

export const getDashboardStyles = (t: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.neutral.lightest,
    maxWidth: appTheme.layout.maxContentWidth as any,
    alignSelf: 'center',
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: appTheme.layout.paddingHorizontal,
    paddingTop: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xxxl,
    maxWidth: appTheme.layout.maxContentWidth as any,
    alignSelf: 'center',
    width: '100%',
  },
  // Welcome section with responsive spacing for iPad
  welcomeSection: {
    marginBottom: appTheme.spacing.xxxl,
    paddingTop: appTheme.spacing.sm,
  },
  welcomeTitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: appTheme.typography.appTitle,
    fontWeight: '400',
    color: appTheme.colors.neutral.darkest,
    lineHeight: appTheme.typography.appTitle * 1.3,
    marginBottom: appTheme.spacing.sm,
    // Better scaling for tablet viewing distances
    letterSpacing: appTheme.device.isTablet ? 0.2 : 0,
  },
  userName: {
    fontFamily: fontFamily.satoshiBold,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: appTheme.colors.neutral.medium,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 18,
    fontWeight: '600',
    color: appTheme.colors.neutral.darkest,
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: appTheme.colors.neutral.lighter,
    borderRadius: 6,
  },
  viewAllText: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 14,
    color: appTheme.colors.neutral.medium,
    fontWeight: '500',
  },
  // Enhanced Quick Actions grid - Multi-column layout for iPad
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: appTheme.device.isTablet ? 'flex-start' : 'space-between',
    gap: appTheme.spacing.md,
    paddingTop: appTheme.spacing.lg,
  },
  actionCard: {
    backgroundColor: appTheme.colors.neutral.lighter,
    padding: appTheme.spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.neutral.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    // Responsive card sizing and touch targets for tablet
    minHeight: appTheme.layout.touchTargetMin,
    minWidth: appTheme.layout.touchTargetMin,
    ...(appTheme.device.isTablet ? {
      width: `${Math.floor(100 / appTheme.layout.actionGridColumns) - 2}%`,
      marginBottom: appTheme.spacing.md,
    } : {
      flex: 1,
    }),
  },
  actionText: {
    marginTop: appTheme.spacing.sm,
    fontFamily: fontFamily.satoshiMedium,
    fontSize: appTheme.typography.bodySmall,
    fontWeight: '500',
    color: appTheme.colors.neutral.darkest,
    textAlign: 'center',
    letterSpacing: appTheme.device.isTablet ? 0.2 : 0,
  },
  actionIcon: {
    width: appTheme.device.isTablet ? 28 : 24,
    height: appTheme.device.isTablet ? 28 : 24,
  },
  actionIconContainer: {
    width: appTheme.device.isTablet ? 44 : 36,
    height: appTheme.device.isTablet ? 44 : 36,
    backgroundColor: appTheme.colors.neutral.lightest,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    // Ensure touch target compliance
    minHeight: appTheme.layout.touchTargetMin,
    minWidth: appTheme.layout.touchTargetMin,
  },
  // Session Cards
  sessionCard: {
    backgroundColor: appTheme.colors.neutral.lightest,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.neutral.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.neutral.darkest,
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    color: appTheme.colors.neutral.medium,
  },
  continueButton: {
    backgroundColor: appTheme.colors.brand.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  continueButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: appTheme.colors.neutral.lightest,
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownContainer: {
    marginTop: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.5,
  },
  breakdownTotal: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    color: '#6C757D',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: appTheme.colors.neutral.lighter,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartSegment: {
    borderRadius: 4,
  },
  chartLabel: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 12,
    color: appTheme.colors.neutral.medium,
    textAlign: 'center',
    marginTop: 6,
  },
  breakdownList: {
    marginTop: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.neutral.lighter,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItemIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breakdownItemName: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 14,
    fontWeight: '500',
    color: appTheme.colors.neutral.darkest,
  },
  breakdownItemStats: {
    alignItems: 'flex-end',
  },
  breakdownItemPercentage: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 12,
    color: appTheme.colors.neutral.medium,
    marginBottom: 2,
  },
  breakdownItemCount: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.neutral.medium,
  },
  // Enhanced Stats Grid - Multi-column responsive layout for iPad
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: appTheme.device.isTablet ? 'space-around' : 'space-between',
    gap: appTheme.spacing.md,
    paddingTop: appTheme.spacing.lg,
    maxWidth: appTheme.device.isTablet ? appTheme.layout.maxContentWidth as any : undefined,
  },
  statCard: {
    backgroundColor: appTheme.colors.neutral.lightest,
    padding: appTheme.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.neutral.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    // Responsive card sizing for tablet
    ...(appTheme.device.isTablet ? {
      width: `${Math.floor(100 / Math.min(appTheme.layout.columns, 3)) - 2}%`,
      marginBottom: appTheme.spacing.md,
      minHeight: 120,
    } : {
      flex: 1,
      minHeight: 80,
    }),
  },
  statNumber: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: appTheme.device.isTablet ? appTheme.typography.sectionHeader : 24,
    fontWeight: '700',
    color: appTheme.colors.neutral.medium,
    marginBottom: appTheme.spacing.xs,
    letterSpacing: appTheme.device.isTablet ? 0.3 : 0,
  },
  statLabel: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: appTheme.typography.caption,
    color: appTheme.colors.neutral.medium,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: appTheme.device.isTablet ? 0.2 : 0,
    lineHeight: appTheme.typography.caption * 1.4,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: appTheme.colors.neutral.lightest,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.neutral.light,
  },
  emptyStateTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    fontWeight: '600',
    color: appTheme.colors.neutral.darkest,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: appTheme.colors.neutral.medium,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  startNewButton: {
    backgroundColor: appTheme.colors.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startNewButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: appTheme.colors.neutral.lightest,
    fontSize: 16,
    fontWeight: '600',
  },
  // Legacy styles (keeping for compatibility)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.neutral.light,
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 28,
    fontWeight: "700",
    color: appTheme.colors.neutral.darkest,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: appTheme.colors.neutral.medium,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: appTheme.colors.neutral.lightest,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.neutral.light,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 18,
    fontWeight: "600",
    color: appTheme.colors.neutral.darkest,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legacyStatLabel: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 14,
    color: appTheme.colors.neutral.medium,
    fontWeight: "500",
  },
  statValue: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 14,
    color: appTheme.colors.neutral.darkest,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: appTheme.colors.brand.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: appTheme.colors.neutral.lightest,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: appTheme.colors.brand.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: appTheme.colors.brand.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appTheme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statusBadge: {
    backgroundColor: appTheme.colors.neutral.lighter,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusBadgeText: {
    color: appTheme.colors.brand.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
};


const fallbackTheme = {
  colors,
  device: { deviceType: 'mobile' as const, isTablet: false, isMobile: true, width: 375, height: 667, isLandscape: false },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  typography: { appTitle: 28, sectionHeader: 20, subsectionHeader: 18, productName: 16, buttonText: 16, bodyLarge: 16, bodyMedium: 14, bodySmall: 12, caption: 11 },
  layout: { maxContentWidth: '100%' as const, paddingHorizontal: 20, columns: 1, actionGridColumns: 2, cardMinWidth: 0, tabBarHeight: 60, touchTargetMin: 44 },
  patterns: {
    container: () => ({ flex: 1, maxWidth: '100%', alignSelf: 'center' as const, width: '100%' }),
    grid: () => ({ flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const }),
    card: () => ({ flex: 1, minWidth: 0 }),
    actionGrid: () => ({ flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const, gap: 16 }),
    touchTarget: () => ({ minHeight: 44, minWidth: 44 })
  },
  breakpoints: { mobile: 0, tablet: 768 },
  getResponsiveValue: <T>(values: Partial<Record<string, T>>, fallback: T): T => fallback,
};

// Backward-compatible static export (deprecated - use useDashboardTheme instead)
export const dashboardStyles = getDashboardStyles(fallbackTheme);


// Utility hook for dashboard components
export const useDashboardTheme = () => {
  const appTheme = useAppTheme();
  return {
    styles: getDashboardStyles(appTheme),
    appTheme,
  };
};

// Create a fallback theme for backward compatibility