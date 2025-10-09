import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { useSessionContext } from '../_context/SessionContext';
import { useUnifiedAuth } from '../../../../lib/auth/UnifiedAuthProvider';
import { ProfileService } from '../../../auth/_services/profileService';

interface FinishSectionProps {
  session: any | null; // domain session or legacy type
  onFinishSession?: () => void; // Made optional since we handle the flow internally
}

export const FinishSection: React.FC<FinishSectionProps> = ({
  session
}) => {
  const router = useRouter();
  const sessionContext = useSessionContext();
  const { userId } = useUnifiedAuth();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);
  const [userProfile, setUserProfile] = useState<{ storeName: string; name: string; email: string }>({
    storeName: 'Your Store',
    name: 'Store Manager',
    email: 'manager@store.com'
  });
  
  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      
      try {
        const profileService = ProfileService.getInstance();
        const profileResult = await profileService.getUserProfile(userId);
        
        if (profileResult.data) {
          console.log('📝 FinishSection: Loaded user profile data:', profileResult.data);
          setUserProfile({
            storeName: profileResult.data.store_name || 'Your Store',
            name: profileResult.data.name || 'Store Manager',
            email: profileResult.data.email || 'manager@store.com'
          });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Keep default values
      }
    };
    
    loadUserProfile();
  }, [userId]);
  
  const productsCount = session && typeof session.toValue === 'function'
    ? (session.toValue().items?.length || 0)
    : (session?.products?.length || 0);
    
  const canGenerateEmails = session && typeof session.canGenerateEmails === 'function' 
    ? session.canGenerateEmails()
    : (session?.toValue?.().status === 'draft' && productsCount > 0);

  // Only show if we have products and can generate emails
  if (!session || productsCount === 0 || !canGenerateEmails) {
    return null;
  }

  const handleGenerateEmails = async () => {
    if (!sessionContext.currentSession) {
      console.error('No active session to generate emails for');
      return;
    }

    // Check if session can generate emails
    if (!sessionContext.currentSession.canGenerateEmails()) {
      console.error('Session cannot generate emails - status or items issue');
      return;
    }

    setIsGeneratingEmails(true);
    
    try {
      console.log('🚀 Starting email generation for session:', sessionContext.currentSession.toValue().id);
      
      // Pass user profile data for email generation
      const result = await sessionContext.generateEmails({
        userStoreName: userProfile.storeName,
        userName: userProfile.name,
        userEmail: userProfile.email
      });
      
      if (result.success) {
        console.log('✅ Emails generated successfully, navigating to email screen');
        // Navigate to the emails screen to show the generated emails
        router.push({
          pathname: '/(tabs)/emails' as any,
          params: { sessionId: sessionContext.currentSession.toValue().id }
        });
      } else {
        console.error('❌ Failed to generate emails:', result.error);
        // You could show a toast or alert here
        // For now, we'll just log the error
      }
    } catch (error) {
      console.error('❌ Error during email generation:', error);
      // You could show a toast or alert here
    } finally {
      setIsGeneratingEmails(false);
    }
  };

  return (
    <View style={restockSessionsStyles.bottomFinishSection}>
      <TouchableOpacity 
        style={restockSessionsStyles.bottomFinishButton} 
        onPress={handleGenerateEmails}
        disabled={isGeneratingEmails || !canGenerateEmails}
      >
        {isGeneratingEmails ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            <Text style={restockSessionsStyles.bottomFinishButtonText}>
              Generating Emails...
            </Text>
          </View>
        ) : (
          <Text style={restockSessionsStyles.bottomFinishButtonText}>
            Finish & Generate Emails
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};