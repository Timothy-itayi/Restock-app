import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/theme/colors';
import { emailsStyles } from '../../../../styles/components/emails';
import { UserProfile } from '../hooks';

interface EmailsSummaryProps {
  emailCount: number;
  userProfile: UserProfile;
}

export function EmailsSummary({ emailCount, userProfile }: EmailsSummaryProps) {
  const { storeName, userName, email } = userProfile;
  
  return (
    <View style={emailsStyles.emailSummary}>
      {/* Professional Header */}
      <View style={{
        backgroundColor: colors.neutral.lighter,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral.light,
        marginBottom: 16
      }}>
        {/* Email Count */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: colors.brand.primary,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            <Ionicons name="mail" size={20} color={colors.neutral.lightest} />
          </View>
          <View>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.neutral.darkest,
              marginBottom: 2
            }}>
              {emailCount} Emails Ready
            </Text>
            <Text style={{
              fontSize: 13,
              color: colors.neutral.medium
            }}>
              Auto-generated supplier communications
            </Text>
          </View>
        </View>

        {/* Sender Information */}
        <View style={{
          backgroundColor: colors.neutral.lightest,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.neutral.light
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="person-circle-outline" size={16} color={colors.neutral.medium} />
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.neutral.medium,
              marginLeft: 6,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              SENDER
            </Text>
          </View>
          
          <View style={{ paddingLeft: 22 }}>
            {storeName && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral.darkest }}>
                  {storeName}
                </Text>
              </View>
            )}
            
            {userName && (
              <Text style={{ fontSize: 13, color: colors.neutral.medium, marginBottom: 2 }}>
                {userName}
              </Text>
            )}
            
            {email && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={12} color={colors.neutral.medium} />
                <Text style={{ 
                  fontSize: 12, 
                  color: colors.neutral.medium,
                  marginLeft: 4,
                  fontFamily: 'monospace'
                }}>
                  {email}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}