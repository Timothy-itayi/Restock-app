import React from 'react';
import { View, StyleSheet } from 'react-native';
import { emailsStyles } from '../../../styles/components/emails';
import useThemeStore from '@/app/stores/useThemeStore';
import SkeletonBox from './SkeletonBox';

export default function EmailsSkeleton() {
  const { theme, mode } = useThemeStore();
  return (
    <View style={[emailsStyles.container, styles.container, { backgroundColor: mode === 'dark' ? theme.neutral.lightest : '#f8f9fa' }]}>
      {/* Email Summary */}
      <View style={emailsStyles.emailSummary}>
        <SkeletonBox width="60%" height={16} />
        <SkeletonBox width="80%" height={14} style={{ marginTop: 4 }} />
      </View>

      {/* Email List Skeleton */}
      <View style={emailsStyles.emailList}>
        {/* Email Item 1 */}
        <View style={emailsStyles.emailCard}>
          <View style={emailsStyles.emailCardHeader}>
            <View style={emailsStyles.emailDetails}>
              <SkeletonBox width="70%" height={16} />
              <SkeletonBox width={24} height={24} borderRadius={12} />
            </View>
          </View>
          
          {/* Notepad divider line */}
          <View style={emailsStyles.notepadDivider} />
          
          <View style={emailsStyles.emailInfoRow}>
            <SkeletonBox width="15%" height={14} />
            <SkeletonBox width="60%" height={14} />
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <View style={emailsStyles.emailInfoRow}>
            <SkeletonBox width="20%" height={14} />
            <SkeletonBox width="70%" height={14} />
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <SkeletonBox width="100%" height={60} style={{ marginTop: 8 }} />
          
          <View style={emailsStyles.emailActions}>
            <SkeletonBox width={60} height={24} borderRadius={12} />
            <SkeletonBox width={60} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
          </View>
        </View>

        {/* Email Item 2 */}
        <View style={emailsStyles.emailCard}>
          <View style={emailsStyles.emailCardHeader}>
            <View style={emailsStyles.emailDetails}>
              <SkeletonBox width="65%" height={16} />
              <SkeletonBox width={24} height={24} borderRadius={12} />
            </View>
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <View style={emailsStyles.emailInfoRow}>
            <SkeletonBox width="15%" height={14} />
            <SkeletonBox width="55%" height={14} />
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <View style={emailsStyles.emailInfoRow}>
            <SkeletonBox width="20%" height={14} />
            <SkeletonBox width="65%" height={14} />
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <SkeletonBox width="100%" height={60} style={{ marginTop: 8 }} />
          
          <View style={emailsStyles.emailActions}>
            <SkeletonBox width={60} height={24} borderRadius={12} />
            <SkeletonBox width={60} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
          </View>
        </View>

        {/* Email Item 3 */}
        <View style={emailsStyles.emailCard}>
          <View style={emailsStyles.emailCardHeader}>
            <View style={emailsStyles.emailDetails}>
              <SkeletonBox width="75%" height={16} />
              <SkeletonBox width={24} height={24} borderRadius={12} />
            </View>
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <View style={emailsStyles.emailInfoRow}>
            <SkeletonBox width="15%" height={14} />
            <SkeletonBox width="70%" height={14} />
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <View style={emailsStyles.emailInfoRow}>
            <SkeletonBox width="20%" height={14} />
            <SkeletonBox width="75%" height={14} />
          </View>
          
          <View style={emailsStyles.notepadDivider} />
          
          <SkeletonBox width="100%" height={60} style={{ marginTop: 8 }} />
          
          <View style={emailsStyles.emailActions}>
            <SkeletonBox width={60} height={24} borderRadius={12} />
            <SkeletonBox width={60} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
          </View>
        </View>
      </View>

  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
  },
}); 