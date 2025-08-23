import { clerkLogger } from '../../logging/logger';
import { ClerkClientService as BackendClerkService } from '../../../backend/services/clerk-client';

export class ClerkClientService {
  private static instance: ClerkClientService;
  
  static getInstance(): ClerkClientService {
    if (!ClerkClientService.instance) {
      ClerkClientService.instance = new ClerkClientService();
    }
    return ClerkClientService.instance;
  }
  
  async isNewSSOSignUp(): Promise<boolean> {
    try {
      clerkLogger.log('Checking if user is new SSO signup');
      const result = await BackendClerkService.isNewSSOSignUp();
      clerkLogger.log('SSO signup check result:', result);
      return result;
    } catch (error) {
      clerkLogger.error('Failed to check SSO signup status:', error);
      return false;
    }
  }
  
  async clearSSOSignUpFlags(): Promise<void> {
    try {
      clerkLogger.log('Clearing SSO signup flags');
      await BackendClerkService.clearSSOSignUpFlags();
      clerkLogger.log('SSO signup flags cleared successfully');
    } catch (error) {
      clerkLogger.error('Failed to clear SSO signup flags:', error);
      throw error;
    }
  }
  
  async detectUserType(user: any): Promise<'google' | 'email'> {
    try {
      clerkLogger.log('Detecting user type from Clerk user object');
      
      // Check OAuth accounts first (most reliable)
      if (user?.externalAccounts && Array.isArray(user.externalAccounts)) {
        const hasGoogleOAuth = user.externalAccounts.some((account: any) => 
          account?.provider === 'oauth_google' || account?.provider === 'google'
        );
        
        if (hasGoogleOAuth) {
          clerkLogger.log('Detected Google OAuth account');
          return 'google';
        }
      }
      
      // Fallback: Check email domain
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || 
                       user?.primaryEmailAddress?.emailAddress;
      
      if (!userEmail) {
        clerkLogger.log('No email found, defaulting to email auth');
        return 'email';
      }
      
      const hasGoogleEmail = userEmail.includes('@gmail.com') || 
                           userEmail.includes('@googlemail.com') || 
                           userEmail.includes('@google.com');
      
      if (hasGoogleEmail) {
        clerkLogger.log('Detected Google email domain');
        return 'google';
      } else {
        clerkLogger.log('Detected non-Google email domain');
        return 'email';
      }
    } catch (error) {
      clerkLogger.error('Error detecting user type:', error);
      return 'email'; // Safe fallback
    }
  }
  
  async getUserEmail(user: any): Promise<string | null> {
    try {
      const email = user?.emailAddresses?.[0]?.emailAddress || 
                   user?.primaryEmailAddress?.emailAddress;
      
      clerkLogger.log('Extracted user email:', email ? 'present' : 'null');
      return email || null;
    } catch (error) {
      clerkLogger.error('Error extracting user email:', error);
      return null;
    }
  }
  
  async getUserName(user: any): Promise<string | null> {
    try {
      const name = user?.fullName || user?.firstName || null;
      clerkLogger.log('Extracted user name:', name);
      return name;
    } catch (error) {
      clerkLogger.error('Error extracting user name:', error);
      return null;
    }
  }
}
