import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AuthGuard from './components/AuthGuard';
import { welcomeStyles } from '../styles/components/welcome';

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
    title: "Track Your Inventory",
    subtitle: "Dashboard Overview",
    description: "Get a clear view of your store's current stock levels and upcoming restock needs at a glance.",
    image: require('../assets/images/restock_session.png'),
  },
  {
    id: 2,
    title: "Create Restock Sessions",
    subtitle: "Organized Stock Management",
    description: "Easily create and manage restock sessions to track what needs to be ordered from your suppliers.",
    image: require('../assets/images/new_restock_session.png'),
  },
  {
    id: 3,
    title: "Generate Professional Emails",
    subtitle: "Automated Supplier Communication",
    description: "Automatically generate and send professional emails to suppliers with your restock orders.",
    image: require('../assets/images/email_sent.png'),
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isSignedIn, userId } = useAuth();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const paginationAnimations = useRef(
    walkthroughSlides.map(() => new Animated.Value(0))
  ).current;

  // Check if user is already authenticated
  useEffect(() => {
      if (isSignedIn && userId) {
      console.log('User is already authenticated, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
    }
  }, [isSignedIn, userId]);

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
        useNativeDriver: false,
      }).start();
      });
    };

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    setCurrentSlide(index);
    
    // Animate pagination dots
    paginationAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  return (
    <AuthGuard requireNoAuth={true}>
      <View style={welcomeStyles.container}>
        {/* Fixed Header */}
        <View style={welcomeStyles.header}>
          <Text style={welcomeStyles.appTitle}>Restock</Text>
        </View>

        {/* Fixed Title */}
        <View style={welcomeStyles.titleContainer}>
          <Text style={welcomeStyles.mainTitle}>Welcome to Restock</Text>
          <Text style={welcomeStyles.mainSubtitle}>Streamline your store's restocking process</Text>
                  </View>
                  
        {/* Swipeable Carousel Content Only */}
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
            {walkthroughSlides.map((slide, index) => (
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
                  <Text style={welcomeStyles.slideSubtitle}>{slide.subtitle}</Text>
                  <Text style={welcomeStyles.slideDescription}>{slide.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
                  </View>
                  
        {/* Fixed Pagination Dots */}
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
                      outputRange: [8, 24],
                    }),
                    backgroundColor: paginationAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#DEE2E6', '#6B7F6B'],
                    }),
                  },
                ]}
              />
              </TouchableOpacity>
          ))}
        </View>

        {/* Fixed Swipe Hint */}
        <View style={welcomeStyles.swipeHintContainer}>
          <Text style={welcomeStyles.swipeHintText}>
            Swipe to explore
          </Text>
            </View>

                {/* Fixed Auth Buttons */}
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
            <Text style={welcomeStyles.signInLinkText}>Already have an account?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthGuard>
  );
} 

