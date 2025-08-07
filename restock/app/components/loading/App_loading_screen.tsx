import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface App_LoadingScreenProps {
  title?: string;
  subtitle?: string;
  color?: string;
  showProgress?: boolean;
  progressDuration?: number;
  onComplete?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function App_LoadingScreen({
  title = "Restock",
  subtitle = "Streamlining your store operations",
  color = '#6B7F6B',
  showProgress = true,
  progressDuration = 3000,
  onComplete
}: App_LoadingScreenProps) {
  // Animation values
  const [logoScale] = useState(new Animated.Value(0));
  const [logoRotate] = useState(new Animated.Value(0));
  const [textFade] = useState(new Animated.Value(0));
  const [progressValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));
  const [displayStartTime] = useState(Date.now());

  // Log component display
  useEffect(() => {
    console.log('📺 App_LoadingScreen: Component displayed', {
      title,
      subtitle,
      timestamp: displayStartTime,
      showProgress,
      progressDuration
    });

    return () => {
      const displayDuration = Date.now() - displayStartTime;
      console.log('📺 App_LoadingScreen: Component unmounted', {
        title,
        displayDuration,
        timestamp: Date.now()
      });
    };
  }, [title, subtitle, displayStartTime, showProgress, progressDuration]);

  useEffect(() => {
    // Create a sequence of animations
    const animationSequence = Animated.sequence([
      // 1. Logo scale and rotate in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
    
      ]),
      // 2. Text fade in
      Animated.timing(textFade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // 3. Start progress bar
      Animated.timing(progressValue, {
        toValue: 1,
        duration: progressDuration,
        useNativeDriver: false,
      })
    ]);

    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    );

    // Start animations
    if (showProgress) {
      animationSequence.start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    } else {
      // If no progress bar, just run the logo and text animations
      const logoTextSequence = Animated.sequence([
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
      
        ]),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]);
      
      logoTextSequence.start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    }
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [logoScale, logoRotate, textFade, progressValue, pulseValue, showProgress, progressDuration, onComplete]);

  // Interpolated values
  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: textFade }]}>
        {/* Custom Logo */}
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              transform: [
                { scale: logoScale },
                { rotate: logoRotation },
                { scale: pulseValue }
              ]
            }
          ]}
        >
          <View style={styles.logoInner}>
            <Ionicons name="storefront" size={32} color={color} />
            <Ionicons name="refresh" size={16} color={color} style={styles.refreshIcon} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, { color, opacity: textFade }]}>
          {title}
        </Animated.Text>

        {/* Subtitle */}
        {subtitle && (
          <Animated.Text style={[styles.subtitle, { opacity: textFade }]}>
            {subtitle}
          </Animated.Text>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: color, width: progressWidth }
                ]} 
              />
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Satoshi-Bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    fontFamily: 'Satoshi-Regular',
    maxWidth: screenWidth * 0.8,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 280,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});