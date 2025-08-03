import { StyleSheet, Dimensions } from 'react-native';
import { fontFamily } from '../typography';

const { width: screenWidth } = Dimensions.get('window');

export const welcomeStyles = StyleSheet.create({
  // Container styles
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
  },
  appTitle: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B7F6B',
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
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    color: '#6B7F6B',
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
    width: screenWidth * 0.5, // Smaller images
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
    fontSize: 24, // Slightly smaller
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16, // Slightly smaller
    color: '#6B7F6B',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  slideDescription: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14, // Slightly smaller
    color: '#7f8c8d',
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
    backgroundColor: '#DEE2E6',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#6B7F6B',
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
    backgroundColor: '#6B7F6B',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  signUpButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6B7F6B',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: '#6B7F6B',
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
    color: '#7f8c8d',
    textAlign: 'center',
  },

  // Legacy styles (keeping for compatibility)
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    color: '#6B7F6B',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: '#7f8c8d',
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
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    fontFamily: fontFamily.satoshi,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#6B7F6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  returningUserButton: {
    backgroundColor: '#A7B9A7',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  returningUserButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
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
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    fontFamily: 'Satoshi-Regular',
    marginHorizontal: 16,
    color: '#7f8c8d',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontFamily: 'Satoshi-Regular',
    color: '#6B7F6B',
    fontSize: 16,
  },
  signInLink: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  signInLinkText: {
    fontFamily: 'Satoshi-Regular',
    color: '#6B7F6B',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    backgroundColor: '#6B7F6B',
    borderWidth: 2,
    borderColor: '#6B7F6B',
  },
  primaryButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6B7F6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontFamily: 'Satoshi-Bold',
    color: '#6B7F6B',
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
    borderColor: '#6B7F6B',
    backgroundColor: '#ffffff',
  },
  navButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: '#6B7F6B',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryNavButton: {
    backgroundColor: '#6B7F6B',
    borderColor: '#6B7F6B',
  },
  primaryNavButtonText: {
    fontFamily: fontFamily.satoshiBold,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 