import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import SignOutButton from "../components/SignOutButton";
import { UserProfileService } from "../../backend/services/user-profile";

export default function ProfileScreen() {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const result = await UserProfileService.getUserProfile(user.id);
          if (result.data) {
            setUserProfile(result.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6B7F6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>

      {/* User Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {userProfile?.name || user?.firstName || 'Not set'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Store Name</Text>
          <Text style={[styles.value, styles.storeName]}>
            {userProfile?.store_name || 'Not set'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>
            {user?.emailAddresses[0]?.emailAddress || 'Not available'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Member Since</Text>
          <Text style={styles.value}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>
        <SignOutButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B7F6B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  storeName: {
    fontWeight: 'bold',
    color: '#6B7F6B',
  },
}); 