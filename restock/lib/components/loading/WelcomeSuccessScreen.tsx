import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeSuccessScreenProps {
  userName?: string;
  storeName?: string;
  onComplete?: () => void;
  duration?: number;
}

export function WelcomeSuccessScreen({ 
  userName, 
  storeName, 
  onComplete, 
  duration = 2500 
}: WelcomeSuccessScreenProps) {
  const [scaleValue] = useState(new Animated.Value(0));
  const [fadeValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Scale animation for checkmark
    Animated.sequence([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-complete after duration
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [scaleValue, fadeValue, onComplete, duration]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeValue }]}>
        {/* Success Icon */}
        <Animated.View 
          style={[
            styles.successIconContainer, 
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          <Ionicons name="checkmark-circle" size={80} color="#28A745" />
        </Animated.View>

        {/* Success Message */}
        <Text style={styles.title}>Welcome to Restock!</Text>
        
        <Text style={styles.subtitle}>
          {userName && storeName 
            ? `Hi ${userName}! Your ${storeName} account is ready.`
            : userName 
              ? `Hi ${userName}! Your account is ready.`
              : 'Your account is ready to go!'
          }
        </Text>

        <Text style={styles.description}>
          Time to set up your store profile and start managing your inventory like a pro.
        </Text>
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
  successIconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#28A745',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Satoshi-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
    fontFamily: 'Satoshi-Medium',
  },
  description: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Satoshi-Regular',
  },
});