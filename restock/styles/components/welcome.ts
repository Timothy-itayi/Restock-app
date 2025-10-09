import { StyleSheet, Dimensions } from 'react-native';
import { fontFamily } from '../typography';
import colors from '../../lib/theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const colours = {
  background: colors.neutral.lighter,
  textDark: colors.neutral.darkest,
  brandPrimary: colors.brand.primary,
  brandSecondary: colors.brand.secondary,
  highlight: colors.brand.accent,
  neutralLight: colors.neutral.lightest,
  neutralDark: colors.neutral.dark,
  borderLight: colors.neutral.light,
  paginationInactive: colors.pagination.inactive,
};

export const welcomeStyles = StyleSheet.create({
  // Container styles
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colours.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },

  // Header styles
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: colours.background,
  },
  appTitle: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 28,
    fontWeight: 'bold',
    color: colours.brandPrimary,
    textAlign: 'center',
  },

  // Fixed Title styles
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mainTitle: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 24,
    fontWeight: 'bold',
    color: colours.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    color: colours.brandSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Carousel styles
  carouselContainer: {
    flex: 1,
    width: screenWidth,
    marginBottom: -70,
  },
  carouselScrollView: {
    flex: 1,
  },
  slideContainer: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  slideTitle: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 24,
    fontWeight: 'bold',
    color: colours.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    color: colours.brandSecondary,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  slideDescription: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    color: colours.neutralDark,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
    paddingHorizontal: 20,
  },
  paginationDotContainer: {
    padding: 4,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colours.paginationInactive,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colours.brandPrimary,
    width: 24,
  },

  // Auth buttons styles
  authButtonsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signUpButton: {
    backgroundColor: colours.brandPrimary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  signUpButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.neutralLight,
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: colours.neutralLight,
    borderWidth: 1,
    borderColor: colours.brandPrimary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.brandPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Swipe hint styles
  swipeHintContainer: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
    marginTop: -40,
  },
  swipeHintText: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    color: colours.neutralDark,
    textAlign: 'center',
  },

  // Legacy styles
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 32,
    fontWeight: 'bold',
    color: colours.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    color: colours.brandPrimary,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: colours.neutralDark,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsSection: {
    marginBottom: 20,
  },
  emailSection: {
    marginBottom: 20,
  },
  passwordSection: {
    marginBottom: 20,
  },
  storeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    fontWeight: '600',
    color: colours.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    fontFamily: fontFamily.satoshi,
    backgroundColor: colours.neutralLight,
    borderWidth: 1,
    borderColor: colours.borderLight,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: colours.textDark,
  },
  button: {
    backgroundColor: colours.brandPrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: colours.neutralLight,
    borderWidth: 1,
    borderColor: colours.borderLight,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  returningUserButton: {
    backgroundColor: colours.brandSecondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.neutralLight,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  returningUserButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.neutralLight,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colours.borderLight,
  },
  dividerText: {
    fontFamily: fontFamily.satoshi,
    marginHorizontal: 16,
    color: colours.neutralDark,
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontFamily: fontFamily.satoshi,
    color: colours.brandPrimary,
    fontSize: 16,
  },
  signInLink: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  signInLinkText: {
    fontFamily: fontFamily.satoshi,
    color: colours.brandPrimary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    backgroundColor: colours.brandPrimary,
    borderWidth: 2,
    borderColor: colours.brandPrimary,
  },
  primaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.neutralLight,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colours.neutralLight,
    borderWidth: 1,
    borderColor: colours.brandPrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.brandPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colours.brandPrimary,
    backgroundColor: colours.neutralLight,
  },
  navButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.brandPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryNavButton: {
    backgroundColor: colours.brandPrimary,
    borderColor: colours.brandPrimary,
  },
  primaryNavButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: colours.neutralLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
