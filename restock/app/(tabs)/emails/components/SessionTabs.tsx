import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSessionColorTheme } from '../../restock-sessions/utils/colorUtils';

interface EmailSession {
  id: string;
  emails: any[];
  totalProducts: number;
  createdAt: Date;
}

interface SessionTabsProps {
  sessions: EmailSession[];
  activeSessionId: string;
  onSessionChange: (sessionId: string) => void;
}

export const SessionTabs: React.FC<SessionTabsProps> = ({
  sessions,
  activeSessionId,
  onSessionChange
}) => {
  const formatDate = (dateLike: Date | string) => {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionColor = (sessionId: string, index: number) => {
    const theme = getSessionColorTheme(sessionId, index);
    return theme.primary;
  };

  const getSessionStatus = (session: EmailSession) => {
    const allSent = session.emails.every(e => e.status === 'sent');
    const anySending = session.emails.some(e => e.status === 'sending');
    const anyFailed = session.emails.some(e => e.status === 'failed');
    
    if (anySending) return { status: 'sending', icon: 'sync', color: '#F59E0B' };
    if (allSent) return { status: 'sent', icon: 'checkmark-circle', color: '#10B981' };
    if (anyFailed) return { status: 'failed', icon: 'alert-circle', color: '#EF4444' };
    return { status: 'draft', icon: 'create', color: '#6B7280' };
  };

  if (sessions.length <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Sessions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {sessions.map((session, index) => {
          const statusInfo = getSessionStatus(session);
          return (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.tab,
                {
                  borderColor: getSessionColor(session.id, index),
                  backgroundColor: activeSessionId === session.id 
                    ? getSessionColor(session.id, index) + '20' 
                    : 'transparent'
                }
              ]}
              onPress={() => onSessionChange(session.id)}
            >
              <View style={styles.tabHeader}>
                <View 
                  style={[
                    styles.tabIndicator, 
                    { backgroundColor: getSessionColor(session.id, index) }
                  ]} 
                />
                <Ionicons 
                  name={statusInfo.icon as any} 
                  size={14} 
                  color={statusInfo.color} 
                />
              </View>
              <Text style={[
                styles.tabText,
                {
                  color: activeSessionId === session.id 
                    ? getSessionColor(session.id, index) 
                    : '#6C757D'
                }
              ]}>
                Session #{index + 1}
              </Text>
              <Text style={styles.tabDate}>
                {formatDate(session.createdAt)}
              </Text>
              <Text style={styles.tabInfo}>
                {session.emails.length} emails • {session.totalProducts} products
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    minWidth: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 8,
    paddingHorizontal: 4,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabDate: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  tabInfo: {
    fontSize: 11,
    color: '#95A5A6',
  },
});