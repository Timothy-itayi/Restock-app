import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { loadingScreenStyles } from '../../styles/components/loading-screen';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Setting up your dashboard..." }: LoadingScreenProps) {
  return (
    <View style={loadingScreenStyles.container}>
      <ActivityIndicator size="large" color="#6B7F6B" />
      <Text style={loadingScreenStyles.message}>{message}</Text>
    </View>
  );
} 