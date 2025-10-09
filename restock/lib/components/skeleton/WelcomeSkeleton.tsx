import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import SkeletonBox from './SkeletonBox';

export default function WelcomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <SkeletonBox width="80%" height={32} />
        <SkeletonBox width="90%" height={18} style={{ marginTop: 12 }} />
        <SkeletonBox width="70%" height={16} style={{ marginTop: 8 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Email Input */}
        <View style={styles.inputSection}>
          <SkeletonBox width="100%" height={48} borderRadius={8} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <SkeletonBox width="100%" height={48} borderRadius={8} />
          <SkeletonBox width="100%" height={48} borderRadius={8} style={{ marginTop: 16 }} />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <SkeletonBox width="30%" height={1} />
          <SkeletonBox width="20%" height={16} />
          <SkeletonBox width="30%" height={1} />
        </View>

        {/* Alternative Options */}
        <View style={styles.alternativeSection}>
          <SkeletonBox width="100%" height={48} borderRadius={8} />
          <SkeletonBox width="100%" height={48} borderRadius={8} style={{ marginTop: 12 }} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <SkeletonBox width="60%" height={16} />
        <SkeletonBox width="40%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 32,
  },
  buttonSection: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  alternativeSection: {
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
}); 