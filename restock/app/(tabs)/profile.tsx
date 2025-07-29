import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../../backend/services/user-profile';
import SignOutButton from '../components/SignOutButton';
import { profileStyles } from '../../styles/components/profile';
import { Ionicons } from '@expo/vector-icons';

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
    <ScrollView style={profileStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={profileStyles.header}>
        <Text style={profileStyles.headerTitle}>Account</Text>
        <TouchableOpacity style={profileStyles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#6C757D" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={profileStyles.profileSection}>
        <Image 
          source={require('../../assets/images/user_name.png')}
          style={profileStyles.profileImage}
          resizeMode="contain"
        />
        
        <View style={profileStyles.profileInfo}>
          <Text style={profileStyles.userName}>
            {userProfile?.name || user?.firstName || 'Not set'}
          </Text>
          <Text style={profileStyles.userEmail}>
            {user?.emailAddresses[0]?.emailAddress || 'Not available'}
          </Text>
        </View>
      </View>

      {/* Store Plan Card */}
      <View style={profileStyles.planCard}>
        <View style={profileStyles.planHeader}>
          <View style={profileStyles.planIcon}>
            <Image 
              source={require('../../assets/images/keys.png')}
              style={profileStyles.planIconImage}
              resizeMode="contain"
            />
          </View>
          <View style={profileStyles.planInfo}>
            <Text style={profileStyles.planLabel}>Your store</Text>
            <Text style={profileStyles.planName}>
              {userProfile?.store_name || 'Not set'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={profileStyles.statsContainer}>
        <View style={profileStyles.statCard}>
          <View style={profileStyles.statIconRestock}>
            <Image 
              source={require('../../assets/images/restock_session.png')}
              style={profileStyles.statIconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={profileStyles.statTitle}>Restock Sessions</Text>
          <Text style={profileStyles.statValue}>12</Text>
          <Text style={profileStyles.statDescription}>This month</Text>
        </View>
        
        <View style={profileStyles.statCard}>
          <View style={profileStyles.statIconEmail}>
            <Image 
              source={require('../../assets/images/email_sent.png')}
              style={profileStyles.statIconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={profileStyles.statTitle}>Emails Sent</Text>
          <Text style={profileStyles.statValue}>48</Text>
          <Text style={profileStyles.statDescription}>This month</Text>
        </View>
      </View>

      {/* Sign Out */}
      <View style={profileStyles.signOutSection}>
        <SignOutButton />
      </View>
    </ScrollView>
  );
} 