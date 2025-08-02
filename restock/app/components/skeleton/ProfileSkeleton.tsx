import React from 'react';
import { View, StyleSheet } from 'react-native';
import { profileStyles } from '../../../styles/components/profile';
import SkeletonBox from './SkeletonBox';

export default function ProfileSkeleton() {
  return (
    <View style={[profileStyles.container, styles.container]}>
      {/* Header */}
      <View style={profileStyles.header}>
        <SkeletonBox width="30%" height={20} />
        <SkeletonBox width={24} height={24} borderRadius={12} />
      </View>

      {/* Profile Section */}
      <View style={profileStyles.profileSection}>
        <SkeletonBox width={80} height={80} borderRadius={40} />
        <View style={profileStyles.profileInfo}>
          <SkeletonBox width="60%" height={20} />
          <SkeletonBox width="80%" height={16} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Store Plan Card */}
      <View style={profileStyles.planCard}>
        <View style={profileStyles.planHeader}>
          <View style={profileStyles.planIcon}>
            <SkeletonBox width={32} height={32} />
          </View>
          <View style={profileStyles.planInfo}>
            <SkeletonBox width="40%" height={14} />
            <SkeletonBox width="60%" height={18} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={profileStyles.statsContainer}>
        <View style={profileStyles.statCard}>
          <View style={profileStyles.statIconRestock}>
            <SkeletonBox width={24} height={24} />
          </View>
          <SkeletonBox width="70%" height={16} style={{ marginTop: 12 }} />
          <SkeletonBox width="40%" height={24} style={{ marginTop: 8 }} />
          <SkeletonBox width="50%" height={14} style={{ marginTop: 4 }} />
        </View>
        
        <View style={profileStyles.statCard}>
          <View style={profileStyles.statIconEmail}>
            <SkeletonBox width={24} height={24} />
          </View>
          <SkeletonBox width="60%" height={16} style={{ marginTop: 12 }} />
          <SkeletonBox width="35%" height={24} style={{ marginTop: 8 }} />
          <SkeletonBox width="45%" height={14} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Sign Out */}
      <View style={profileStyles.signOutSection}>
        <SkeletonBox width="100%" height={48} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
  },
}); 