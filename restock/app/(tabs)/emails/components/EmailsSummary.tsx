import React from 'react';
import { View, Text } from 'react-native';
import { emailsStyles } from '../../../../styles/components/emails';
import { UserProfile } from '../hooks';

interface EmailsSummaryProps {
  emailCount: number;
  userProfile: UserProfile;
}

export function EmailsSummary({ emailCount, userProfile }: EmailsSummaryProps) {
  const { storeName, userName, email } = userProfile;
  const hasUserInfo = storeName || email || userName;

  return (
    <View style={emailsStyles.emailSummary}>
      <Text style={emailsStyles.headerSubtitle}>
        {emailCount} emails ready to send
      </Text>
      <Text style={emailsStyles.summaryText}>
        Emails auto-generated using your session data
      </Text>
      {hasUserInfo && (
        <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 4 }}>
            Sender Information:
          </Text>
          {storeName && <Text style={{ fontSize: 11, color: '#6C757D' }}>Store: {storeName}</Text>}
          {userName && <Text style={{ fontSize: 11, color: '#6C757D' }}>Name: {userName}</Text>}
          {email && <Text style={{ fontSize: 11, color: '#6C757D' }}>Email: {email}</Text>}
        </View>
      )}
    </View>
  );
}