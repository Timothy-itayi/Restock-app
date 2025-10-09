import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonBox from './SkeletonBox';

export default function SignInSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width="60%" height={28} />
        <SkeletonBox width="80%" height={16} style={{ marginTop: 8 }} />
      </View>

      {/* Returning User Button */}
      <View style={styles.returningUserSection}>
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Google Sign In Button */}
      <View style={styles.googleButtonSection}>
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Link Button */}
      <View style={styles.linkSection}>
        <SkeletonBox width="70%" height={16} />
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <SkeletonBox width="30%" height={1} />
        <SkeletonBox width="20%" height={16} />
        <SkeletonBox width="30%" height={1} />
      </View>

      {/* Email Input */}
      <View style={styles.inputSection}>
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Password Input */}
      <View style={styles.inputSection}>
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>

      {/* Sign In Button */}
      <View style={styles.signInButtonSection}>
        <SkeletonBox width="100%" height={48} borderRadius={8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  returningUserSection: {
    marginBottom: 16,
  },
  googleButtonSection: {
    marginBottom: 16,
  },
  linkSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 16,
  },
  signInButtonSection: {
    marginTop: 32,
  },
}); 