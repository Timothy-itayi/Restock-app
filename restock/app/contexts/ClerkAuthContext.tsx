import React, { createContext, useContext } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

interface ClerkAuthContextType {
  isSignedIn: boolean;
  user: any;
  isLoading: boolean;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (!context) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
};

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const value: ClerkAuthContextType = {
    isSignedIn: isSignedIn || false,
    user,
    isLoading: !isLoaded,
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
}; 