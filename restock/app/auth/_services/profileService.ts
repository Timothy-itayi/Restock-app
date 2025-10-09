import { profileLogger } from '../../../lib/logging/_logger';
import { UserProfileService as BackendProfileService } from '../../../backend/_services/user-profile';
import { SessionManager } from "../../../backend/_services/session-manager";
import { registerClerkUser } from '../../../backend/_config/supabase';

export class ProfileService {
  private static instance: ProfileService;
  
  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }
  
  async hasCompletedProfileSetup(userId: string): Promise<boolean> {
    try {
      profileLogger.log('Checking if user has completed profile setup:', userId);
      const result = await BackendProfileService.hasCompletedProfileSetupByClerkId(userId);
      profileLogger.log('Profile setup check result:', result.hasCompletedSetup);
      return result.hasCompletedSetup;
    } catch (error) {
      profileLogger.error('Failed to check profile setup status:', error);
      return false;
    }
  }
  
  async getUserProfile(userId: string): Promise<any> {
    try {
      profileLogger.log('Fetching user profile:', userId);
      const result = await BackendProfileService.getUserProfileByClerkId(userId);
      
      if (result.data) {
        profileLogger.log('Profile found:', {
          hasStoreName: !!result.data.store_name,
          hasName: !!result.data.name
        });
      } else {
        profileLogger.log('No profile found for user');
      }
      
      return result;
    } catch (error) {
      profileLogger.error('Failed to fetch user profile:', error);
      throw error;
    }
  }
  
  async registerUserWithSupabase(
    userId: string, 
    email: string, 
    name: string | null
  ): Promise<string> {
    try {
      profileLogger.log('Registering user with Supabase:', { userId, email, name });
      
      const supabaseUserId = await registerClerkUser(
        userId,
        email,
        name,
        ''
      );
      
      profileLogger.log('User registered with Supabase successfully:', supabaseUserId);
      return supabaseUserId;
    } catch (error) {
      profileLogger.error('Failed to register user with Supabase:', error);
      throw error;
    }
  }
  
  async saveUserSession(
    userId: string,
    email: string,
    storeName: string,
    authMethod: 'google' | 'email'
  ): Promise<void> {
    try {
      profileLogger.log('Saving user session:', { userId, email, storeName, authMethod });
      
      await SessionManager.saveUserSession({
        userId,
        email,
        storeName,
        wasSignedIn: true,
        lastSignIn: Date.now(),
        lastAuthMethod: authMethod,
      });
      
      profileLogger.log('User session saved successfully');
    } catch (error) {
      profileLogger.error('Failed to save user session:', error);
      throw error;
    }
  }
  
  async isProfileComplete(profileData: any): Promise<boolean> {
    try {
      const hasRequiredFields = profileData?.store_name && profileData?.name;
      profileLogger.log('Profile completeness check:', {
        hasStoreName: !!profileData?.store_name,
        hasName: !!profileData?.name,
        isComplete: hasRequiredFields
      });
      return hasRequiredFields;
    } catch (error) {
      profileLogger.error('Error checking profile completeness:', error);
      return false;
    }
  }
}
