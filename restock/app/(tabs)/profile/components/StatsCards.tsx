import React from 'react';
import { View, Text, Image } from 'react-native';
import { profileStyles } from '../../../../styles/components/profile';

interface StatsCardsProps {
  sessionCount: number;
  emailCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  sessionCount,
  emailCount
}) => {
  return (
    <View style={profileStyles.statsContainer}>
      <View style={profileStyles.statCard}>
        <View style={profileStyles.statIconRestock}>
          <Image 
            source={require('../../../../assets/images/restock_session.png')}
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
            source={require('../../../../assets/images/email_sent.png')}
            style={profileStyles.statIconImage}
            resizeMode="contain"
          />
        </View>
        <Text style={profileStyles.statTitle}>Emails Sent</Text>
        <Text style={profileStyles.statValue}>{emailCount}</Text>
        <Text style={profileStyles.statDescription}>Total emails</Text>
      </View>
    </View>
  );
};