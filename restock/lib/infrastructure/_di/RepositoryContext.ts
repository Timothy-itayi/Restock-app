import { createContext } from 'react';

export interface RepositoryContextValue {
  userRepository: any | null;
  sessionRepository: any | null;
  productRepository: any | null;
  supplierRepository: any | null;
  emailRepository: any | null;
  isSupabaseReady: boolean;
  isUserContextSet: boolean;
}

export const RepositoryContext = createContext<RepositoryContextValue | null>(null);
