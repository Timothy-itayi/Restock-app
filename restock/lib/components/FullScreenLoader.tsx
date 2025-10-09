import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { typography } from '../../styles/typography';

interface FullScreenLoaderProps {
  message?: string;
}

export default function FullScreenLoader({ message = "Loading..." }: FullScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B7F6B" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  message: {
    marginTop: 16,
    ...typography.bodyMedium,
    color: '#6B7F6B',
    textAlign: 'center',
  },
}); 