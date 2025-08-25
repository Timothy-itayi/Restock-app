// // SupabaseHooksProvider.tsx
// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import { ActivityIndicator, View, Text } from 'react-native';
// import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';
// import { registerServices } from '../di/ServiceRegistry';

// import { SupabaseSessionRepository } from '../../../backend/infrastructure/repositories/SupabaseSessionRepository';
// import { SupabaseProductRepository } from '../../../backend/infrastructure/repositories/SupabaseProductRepository';
// import { SupabaseSupplierRepository } from '../../../backend/infrastructure/repositories/SupabaseSupplierRepository';
// import { SupabaseEmailRepository } from '../../../backend/infrastructure/repositories/SupabaseEmailRepository';
// import { SupabaseUserRepository } from '../../../backend/infrastructure/repositories/SupabaseUserRepository';

// interface RepositoryContextType {
//   sessionRepository: SupabaseSessionRepository;
//   productRepository: SupabaseProductRepository;
//   supplierRepository: SupabaseSupplierRepository;
//   emailRepository: SupabaseEmailRepository;
//   userRepository: SupabaseUserRepository;
//   setUserId: (uid: string) => void;
// }

// const RepositoryContext = createContext<RepositoryContextType | null>(null);

// export const SupabaseHooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isReady, userId } = useUnifiedAuth();

//   // Create repositories once (userId can be null)
//   const repositories = useMemo(() => {
//     const userRepo = new SupabaseUserRepository();
//     const sessionRepo = new SupabaseSessionRepository();
//     const productRepo = new SupabaseProductRepository();
//     const supplierRepo = new SupabaseSupplierRepository();
//     const emailRepo = new SupabaseEmailRepository();

//     const setUserId = (uid: string) => {
//       sessionRepo.setUserId(uid);
//       productRepo.setUserId(uid);
//       supplierRepo.setUserId(uid);
//       emailRepo.setUserId(uid);
//     };

//     return {
//       userRepository: userRepo,
//       sessionRepository: sessionRepo,
//       productRepository: productRepo,
//       supplierRepository: supplierRepo,
//       emailRepository: emailRepo,
//       setUserId,
//     };
//   }, []);

//   // Register DI services once
//   useEffect(() => {
//     registerServices(userId);
//   }, []);

//   // Update repositories when userId becomes available
//   useEffect(() => {
//     if (userId) {
//       repositories.setUserId(userId);
//     }
//   }, [userId, repositories]);

//   return (
//     <RepositoryContext.Provider value={repositories}>
//       {(!isReady || !userId) ? (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//           <ActivityIndicator size="large" color="#6B7F6B" />
//           <Text>Initializing repositories...</Text>
//         </View>
//       ) : (
//         children
//       )}
//     </RepositoryContext.Provider>
//   );
// };

// // Generic hook
// export const useRepositories = (): RepositoryContextType => {
//   const ctx = useContext(RepositoryContext);
//   if (!ctx) throw new Error('useRepositories must be used within SupabaseHooksProvider');
//   return ctx;
// };

// // Individual repository hooks
// export const useSessionRepository = () => useRepositories().sessionRepository;
// export const useProductRepository = () => useRepositories().productRepository;
// export const useSupplierRepository = () => useRepositories().supplierRepository;
// export const useEmailRepository = () => useRepositories().emailRepository;
// export const useUserRepository = () => useRepositories().userRepository;
