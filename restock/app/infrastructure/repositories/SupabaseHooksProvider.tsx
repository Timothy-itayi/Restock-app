import React, { createContext, useContext, useMemo } from 'react';
import { SupabaseSessionRepository } from '../../../infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseProductRepository } from '../../../infrastructure/repositories/SupabaseProductRepository';
import { SupabaseSupplierRepository } from '../../../infrastructure/repositories/SupabaseSupplierRepository';
import { SupabaseEmailRepository } from '../../../infrastructure/repositories/SupabaseEmailRepository';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/SupabaseUserRepository';

// Create context for repositories
const RepositoryContext = createContext<{
  sessionRepository: SupabaseSessionRepository;
  productRepository: SupabaseProductRepository;
  supplierRepository: SupabaseSupplierRepository;
  emailRepository: SupabaseEmailRepository;
  userRepository: SupabaseUserRepository;
} | null>(null);

// Provider component
export const SupabaseHooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repositories = useMemo(() => {
    return {
      sessionRepository: new SupabaseSessionRepository(),
      productRepository: new SupabaseProductRepository(),
      supplierRepository: new SupabaseSupplierRepository(),
      emailRepository: new SupabaseEmailRepository(),
      userRepository: new SupabaseUserRepository(),
    };
  }, []);

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};

// Hook to use repositories
const useRepositories = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories must be used within a SupabaseHooksProvider');
  }
  return context;
};

// Individual repository hooks
export const useSessionRepository = () => {
  const { sessionRepository } = useRepositories();
  return sessionRepository;
};

export const useProductRepository = () => {
  const { productRepository } = useRepositories();
  return productRepository;
};

export const useSupplierRepository = () => {
  const { supplierRepository } = useRepositories();
  return supplierRepository;
};

export const useEmailRepository = () => {
  const { emailRepository } = useRepositories();
  return emailRepository;
};

export const useUserRepository = () => {
  const { userRepository } = useRepositories();
  return userRepository;
};
