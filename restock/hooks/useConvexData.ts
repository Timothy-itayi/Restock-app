import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

/**
 * DIRECT CONVEX HOOKS
 * 
 * This demonstrates the new pattern for replacing the old service layer.
 * Instead of complex repositories and dependency injection, we use Convex hooks directly.
 */

// Products management
export const useProducts = () => {
  const products = useQuery(api.products.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const searchProducts = useQuery(api.products.search, { query: '' });

  return {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    isLoading: products === undefined,
  };
};

// Suppliers management
export const useSuppliers = () => {
  const suppliers = useQuery(api.suppliers.list);
  const createSupplier = useMutation(api.suppliers.create);
  const updateSupplier = useMutation(api.suppliers.update);
  const deleteSupplier = useMutation(api.suppliers.remove);
  const searchSuppliers = useQuery(api.suppliers.search, { query: '' });

  return {
    suppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    isLoading: suppliers === undefined,
  };
};

// User profile management
export const useUserProfile = () => {
  const profile = useQuery(api.users.get);
  const createProfile = useMutation(api.users.create);
  const updateProfile = useMutation(api.users.update);
  const profileCompletion = useQuery(api.users.checkProfileCompletion);

  return {
    profile,
    createProfile,
    updateProfile,
    profileCompletion,
    isLoading: profile === undefined,
    isProfileComplete: profileCompletion?.isComplete || false,
  };
};

// Email management
export const useEmails = () => {
  const createEmail = useMutation(api.emails.create);
  const updateEmailStatus = useMutation(api.emails.updateStatus);
  const emailAnalytics = useQuery(api.emails.getAnalytics, { days: 30 });

  return {
    createEmail,
    updateEmailStatus,
    emailAnalytics,
    isLoading: emailAnalytics === undefined,
  };
};

// Combined data hook for common operations
export const useAppData = () => {
  const products = useProducts();
  const suppliers = useSuppliers();
  const userProfile = useUserProfile();
  const emails = useEmails();

  return {
    products,
    suppliers,
    userProfile,
    emails,
    isLoading: products.isLoading || suppliers.isLoading || userProfile.isLoading,
  };
};
