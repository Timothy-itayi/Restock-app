import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BaseLoadingScreenProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  showProgress?: boolean;
  progressDuration?: number;
  onComplete?: () => void;
}

export function BaseLoadingScreen({
  title,
  subtitle,
  icon = 'sync',
  color = '#6B7F6B',
  showProgress = true,
  progressDuration = 3000,
  onComplete
}: BaseLoadingScreenProps) {
  const [rotateValue] = useState(new Animated.Value(0));
  const [progressValue] = useState(new Animated.Value(0));
  const [fadeValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Rotation animation for icon
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    );
    rotationAnimation.start();

    // Progress bar animation
    if (showProgress) {
      Animated.timing(progressValue, {
        toValue: 1,
        duration: progressDuration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });
    }

    return () => {
      rotationAnimation.stop();
    };
  }, [rotateValue, progressValue, fadeValue, showProgress, progressDuration, onComplete]);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeValue }]}>
        {/* Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}>
          <Ionicons name={icon} size={48} color={color} />
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color }]}>{title}</Text>

        {/* Subtitle */}
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
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
  iconContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Satoshi-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: 'Satoshi-Regular',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 280,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});