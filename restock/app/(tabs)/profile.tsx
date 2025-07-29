import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../../backend/services/user-profile';
import SignOutButton from '../components/SignOutButton';
import { profileStyles } from '../../styles/components/profile';

export default function ProfileScreen() {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const result = await UserProfileService.verifyUserProfile(user.id);
          if (result.data) {
            setUserProfile(result.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={profileStyles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.header}>
        <Text style={profileStyles.title}>Profile</Text>
        <Text style={profileStyles.subtitle}>Manage your account settings</Text>
      </View>

      {/* User Info */}
      <View style={profileStyles.card}>
        <Text style={profileStyles.cardTitle}>Account Information</Text>
        
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Name</Text>
          <Text style={profileStyles.value}>
            {userProfile?.name || user?.firstName || 'Not set'}
          </Text>
        </View>
        
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Store Name</Text>
          <Text style={[profileStyles.value, profileStyles.storeName]}>
            {userProfile?.store_name || 'Not set'}
          </Text>
        </View>
        
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Email</Text>
          <Text style={profileStyles.value}>
            {user?.emailAddresses[0]?.emailAddress || 'Not available'}
          </Text>
        </View>
        
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Member Since</Text>
          <Text style={profileStyles.value}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={profileStyles.card}>
        <Text style={profileStyles.cardTitle}>Actions</Text>
        <SignOutButton />
      </View>
    </View>
  );
} 