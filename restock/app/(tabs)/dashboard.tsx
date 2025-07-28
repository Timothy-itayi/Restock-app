import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { dashboardStyles } from "../../styles/components/dashboard";
import { useAuth } from "@clerk/clerk-expo";
import { UserProfileService } from "../../backend/services/user-profile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function DashboardScreen() {
  const [userName, setUserName] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const result = await UserProfileService.getUserProfile(userId);
          if (result.data) {
            setUserName(result.data.name || "there");
            setStoreName(result.data.store_name || "");
          } else {
            setUserName("there");
            setStoreName("");
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName("there");
          setStoreName("");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <View style={dashboardStyles.container}>
        <ActivityIndicator size="large" color="#6B7F6B" />
      </View>
    );
  }

  const greeting = storeName 
    ? `Hello ${userName}! Welcome to your restocking dashboard for ${storeName}`
    : `Hello ${userName}! Welcome to your restocking dashboard`;

  return (
    <View style={dashboardStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={dashboardStyles.title}>Dashboard</Text>
        <Text style={dashboardStyles.subtitle}>{greeting}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/restock-sessions')}
          >
            <Ionicons name="add-circle" size={32} color="#6B7F6B" />
            <Text style={styles.actionText}>New Restock Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/emails')}
          >
            <Ionicons name="mail" size={32} color="#6B7F6B" />
            <Text style={styles.actionText}>View Emails</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Suppliers</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7F6B',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
}); 