// app/components/WelcomeScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated
} from 'react-native';
import { router } from 'expo-router';
import { useThemedStyles } from '../styles/useThemedStyles';
import { ResponsiveContainer } from './components/responsive/ResponsiveLayouts';

const { width: screenWidth } = Dimensions.get('window');

interface WalkthroughSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: any;
}

const walkthroughSlides: WalkthroughSlide[] = [
  {
    id: 1,
    title: 'Track Your Inventory',
    subtitle: 'Dashboard Overview',
    description:
      "Get a clear view of your store's current stock levels and upcoming restock needs at a glance.",
    image: require('../assets/images/restock_session.png')
  },
  {
    id: 2,
    title: 'Create Restock Sessions',
    subtitle: 'Organized Stock Management',
    description:
      'Easily create and manage restock sessions to track what needs to be ordered from your suppliers.',
    image: require('../assets/images/new_restock_session.png')
  },
  {
    id: 3,
    title: 'Generate Professional Emails',
    subtitle: 'Automated Supplier Communication',
    description:
      'Automatically generate and send professional emails to suppliers with your restock orders.',
    image: require('../assets/images/email_sent.png')
  }
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const paginationAnimations = useRef(
    walkthroughSlides.map(() => new Animated.Value(0))
  ).current;

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(contentOffset / screenWidth);
    setCurrentSlide(slideIndex);

    // Animate pagination dots
    paginationAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === slideIndex ? 1 : 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    });
  };

  const handleSignUp = () => {
    router.push('/auth/traditional/sign-up' as any);
  };

  const handleSignIn = () => {
    router.push('/auth/traditional/sign-in' as any);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true
    });
    setCurrentSlide(index);

    paginationAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 1 : 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    });
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.lighter,
    },
    header: {
      paddingTop: theme.spacing.xxl,
      paddingHorizontal: theme.layout.paddingHorizontal,
      paddingBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    appTitle: {
      fontFamily: theme.typography.appTitle.fontFamily,
      fontSize: theme.typography.appTitle.fontSize,
      color: theme.colors.brand.primary,
      fontWeight: 'bold',
    },
    titleContainer: {
      paddingHorizontal: theme.layout.paddingHorizontal,
      paddingBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    mainTitle: {
      fontFamily: theme.typography.sectionHeader.fontFamily,
      fontSize: theme.typography.sectionHeader.fontSize,
      color: theme.colors.neutral.darkest,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      fontWeight: 'bold',
    },
    mainSubtitle: {
      fontFamily: theme.typography.bodyLarge.fontFamily,
      fontSize: theme.typography.bodyLarge.fontSize,
      color: theme.colors.neutral.medium,
      textAlign: 'center',
      lineHeight: theme.typography.bodyLarge.lineHeight,
    },
    carouselContainer: {
      flex: 1,
      maxHeight: theme.device.isTablet ? 500 : 400,
    },
    carouselScrollView: {
      flex: 1,
    },
    slideContainer: {
      width: screenWidth,
      paddingHorizontal: theme.layout.paddingHorizontal,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      height: theme.device.isTablet ? 300 : 200,
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    slideImage: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
    },
    textContainer: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    slideTitle: {
      fontFamily: theme.typography.subsectionHeader.fontFamily,
      fontSize: theme.typography.subsectionHeader.fontSize,
      color: theme.colors.neutral.darkest,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
      fontWeight: 'bold',
    },
    slideSubtitle: {
      fontFamily: theme.typography.productName.fontFamily,
      fontSize: theme.typography.productName.fontSize,
      color: theme.colors.brand.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
    slideDescription: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.neutral.medium,
      textAlign: 'center',
      lineHeight: theme.typography.bodyMedium.lineHeight,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    paginationDotContainer: {
      marginHorizontal: theme.spacing.xs,
      padding: theme.spacing.xs,
    },
    paginationDot: {
      height: 8,
      borderRadius: 4,
    },
    swipeHintContainer: {
      alignItems: 'center',
      paddingBottom: theme.spacing.lg,
    },
    swipeHintText: {
      fontFamily: theme.typography.caption.fontFamily,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.neutral.medium,
      fontWeight: '300',
    },
    authButtonsContainer: {
      paddingHorizontal: theme.layout.paddingHorizontal,
      paddingBottom: theme.spacing.xxl,
    },
    signUpButton: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      minHeight: theme.layout.touchTargetMin,
    },
    signUpButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.lightest,
      fontWeight: '600',
    },
    signInLink: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    signInLinkText: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.brand.primary,
      fontWeight: '500',
    },
  }));

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Restock</Text>
      </View>

      {/* Fixed Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Welcome to Restock</Text>
        <Text style={styles.mainSubtitle}>
          Streamline your store's restocking process
        </Text>
      </View>

      {/* Swipeable Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleGestureEvent}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.carouselScrollView}
        >
          {walkthroughSlides.map((slide) => (
            <View key={slide.id} style={styles.slideContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={slide.image}
                  style={styles.slideImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>
                  {slide.subtitle}
                </Text>
                <Text style={styles.slideDescription}>
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {walkthroughSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={styles.paginationDotContainer}
          >
            <Animated.View
              style={[
                styles.paginationDot,
                {
                  width: paginationAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 24]
                  }),
                  backgroundColor: paginationAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#DEE2E6', '#6B7F6B']
                  })
                }
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipe Hint */}
      <View style={styles.swipeHintContainer}>
        <Text style={styles.swipeHintText}>Swipe to explore</Text>
      </View>

      {/* Auth Buttons */}
      <View style={styles.authButtonsContainer}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInLink}
          onPress={handleSignIn}
        >
          <Text style={styles.signInLinkText}>
            Already have an account?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
