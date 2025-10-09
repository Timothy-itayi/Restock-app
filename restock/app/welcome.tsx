// app/components/WelcomeScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { welcomeStyles } from '../styles/components/welcome';
import { clearAllStorage, debugStorage } from '../scripts/clear-storage';

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
  console.log('🎉 [WelcomeScreen] Component rendered');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [debugTapCount, setDebugTapCount] = useState(0);
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

  const handleDebugTap = () => {
    const newCount = debugTapCount + 1;
    setDebugTapCount(newCount);
    
    if (newCount >= 5) {
      setDebugTapCount(0);
      Alert.alert(
        '🛠️ Debug Menu',
        'Choose debug action:',
        [
          {
            text: 'View Storage',
            onPress: async () => {
              const items = await debugStorage();
              Alert.alert('Storage Contents', `Found ${items.length} items. Check console for details.`);
            }
          },
          {
            text: 'Clear All Storage',
            onPress: () => {
              Alert.alert(
                '⚠️ Confirm',
                'This will clear ALL cached data including auth tokens. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      const result = await clearAllStorage();
                      Alert.alert(
                        result.success ? '✅ Success' : '❌ Error',
                        result.success 
                          ? `Cleared ${result.keysCleared?.length} items. Please restart the app.`
                          : `Error: ${result.error}`
                      );
                    }
                  }
                ]
              );
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
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

  return (
    <View style={welcomeStyles.container}>
      {/* Fixed Header */}
      <View style={welcomeStyles.header}>
        <Text style={welcomeStyles.appTitle}>Restock</Text>
      </View>

      {/* Fixed Title */}
      <View style={welcomeStyles.titleContainer}>
        <Text style={welcomeStyles.mainTitle}>Welcome to Restock</Text>
        <Text style={welcomeStyles.mainSubtitle}>
          Streamline your store's restocking process
        </Text>
      </View>

      {/* Swipeable Carousel */}
      <View style={welcomeStyles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleGestureEvent}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={welcomeStyles.carouselScrollView}
        >
          {walkthroughSlides.map((slide) => (
            <View key={slide.id} style={welcomeStyles.slideContainer}>
              <View style={welcomeStyles.imageContainer}>
                <Image
                  source={slide.image}
                  style={welcomeStyles.slideImage}
                  resizeMode="contain"
                />
              </View>

              <View style={welcomeStyles.textContainer}>
                <Text style={welcomeStyles.slideTitle}>{slide.title}</Text>
                <Text style={welcomeStyles.slideSubtitle}>
                  {slide.subtitle}
                </Text>
                <Text style={welcomeStyles.slideDescription}>
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Pagination Dots */}
      <View style={welcomeStyles.paginationContainer}>
        {walkthroughSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={welcomeStyles.paginationDotContainer}
          >
            <Animated.View
              style={[
                welcomeStyles.paginationDot,
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
      <TouchableOpacity 
        style={welcomeStyles.swipeHintContainer}
        onPress={handleDebugTap}
        activeOpacity={0.9}
      >
        <Text style={welcomeStyles.swipeHintText}>Swipe to explore</Text>
      </TouchableOpacity>

      {/* Auth Buttons */}
      <View style={welcomeStyles.authButtonsContainer}>
        <TouchableOpacity
          style={welcomeStyles.signUpButton}
          onPress={handleSignUp}
        >
          <Text style={welcomeStyles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={welcomeStyles.signInLink}
          onPress={handleSignIn}
        >
          <Text style={welcomeStyles.signInLinkText}>
            Already have an account?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
