import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const folderAnimationStyles = StyleSheet.create({
  // Container for the entire folder animation (now relative positioning)
  folderContainer: {
    position: 'relative',
    width: 200,
    height: 150,
    alignSelf: 'center',
  },
  
  // Back side of the folder
  folderBack: {
    position: 'absolute',
    width: 200,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#FFD485',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Folder label/tab
  folderLabel: {
    position: 'absolute',
    top: -10,
    left: 0,
    width: 55,
    height: 25,
    borderRadius: 5,
    backgroundColor: '#FFD485',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Front side of the folder
  folderFront: {
    position: 'absolute',
    width: 200,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#ffe1a8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Paper styles
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -95, // Half of paper width
    marginTop: -70,  // Half of paper height
    width: 190,
    height: 140,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  // Individual paper colors
  paperOne: {
    backgroundColor: '#ffadad',
  },
  
  paperTwo: {
    backgroundColor: '#ffd6a5',
  },
  
  paperThree: {
    backgroundColor: '#fdffb6',
  },
  
  paperFour: {
    backgroundColor: '#9bf6ff',
  },
  
  // Paper title container
  paperTitleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  
  // Paper title text
  paperTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
  },
  
  // Content container for the entire loading screen
  contentContainer: {
    flex: 1,
    backgroundColor: '#1e1f26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Main content row for folder and title
  mainContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    maxWidth: screenWidth * 0.9,
  },

  // Folder section container
  folderSection: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title section container
  titleSection: {
    flex: 0.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 20,
  },

  // Legacy text container for backward compatibility
  textContainer: {
    alignItems: 'flex-start',
  },
  
  // Main title
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'left',
    marginBottom: 8,
    fontFamily: 'Satoshi-Bold',
    letterSpacing: 0.8,
    lineHeight: 38,
  },
  
  // Subtitle
  subtitle: {
    fontSize: 16,
    color: '#a8a8a8',
    textAlign: 'left',
    lineHeight: 24,
    fontFamily: 'Satoshi-Regular',
    maxWidth: screenWidth * 0.4,
    opacity: 0.9,
  },
  
  // Progress bar container
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    paddingHorizontal: 32,
  },
  
  // Progress track
  progressTrack: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  // Progress bar
  progressBar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#6B7F6B',
  },
}); 