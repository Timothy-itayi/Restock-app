import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../../backend/services/user-profile';
import { SessionService } from '../../backend/services/sessions';
import { EmailService } from '../../backend/services/emails';
import { useAuthContext } from '../_contexts/AuthContext';
import SignOutButton from '../components/SignOutButton';
import { profileStyles } from '../../styles/components/profile';
import { Ionicons } from '@expo/vector-icons';
import { ProfileSkeleton } from '../components/skeleton';

export default function ProfileScreen() {
  const { user } = useUser();
  const { userId } = useAuthContext();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  // Show skeleton until both user and profile data are loaded, plus minimum loading time
  const isDataReady = !loading && user && userProfile !== null && !minLoadingTime;

  // Minimum loading time to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 300); // 300ms minimum loading time
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const result = await UserProfileService.verifyUserProfile(user.id);
          if (result.data) {
            setUserProfile(result.data);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      } else if (user === null) {
        // User is not available, stop loading
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, user]);

  // Fetch session and email counts
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // Get session count
        const sessionsResult = await SessionService.getUserSessions(userId);
        if (sessionsResult.data) {
          setSessionCount(sessionsResult.data.length);
        }

        // Get email count
        const emailsResult = await EmailService.getUserEmails(userId);
        if (emailsResult.data) {
          setEmailCount(emailsResult.data.length);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [userId]);

  const handleSettingsPress = () => {
    Alert.alert(
      'Settings',
      'Settings functionality coming soon!',
      [{ text: 'OK' }]
    );
  };

  if (!isDataReady) {
    return <ProfileSkeleton />;
  }

  return (
    <ScrollView style={profileStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={profileStyles.header}>
        <Text style={profileStyles.headerTitle}>Account</Text>
        <TouchableOpacity style={profileStyles.settingsButton} onPress={handleSettingsPress}>
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
          <Text style={profileStyles.statValue}>{sessionCount}</Text>
          <Text style={profileStyles.statDescription}>Total sessions</Text>
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
          <Text style={profileStyles.statValue}>{emailCount}</Text>
          <Text style={profileStyles.statDescription}>Total emails</Text>
        </View>
      </View>

      {/* Sign Out */}
      <View style={profileStyles.signOutSection}>
        <SignOutButton />
      </View>
    </ScrollView>
  );
} 