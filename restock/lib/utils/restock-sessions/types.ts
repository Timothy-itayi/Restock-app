// Types for restock sessions functionality

export interface Product {
  id: string;
  name: string;
  quantity: number;
  supplierName: string;
  supplierEmail: string;
}

export interface RestockSession {
  id: string;
  products: Product[];
  createdAt: Date;
  status: 'draft' | 'email_generated' | 'sent';
  name?: string;
}

export interface StoredProduct {
  id: string;
  name: string;
  default_quantity: number;
  default_supplier_id?: string;
  supplier?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StoredSupplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  title?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorContext?: any;
  timestamp: Date;
}

export interface FormState {
  productName: string;
  quantity: string;
  supplierName: string;
  supplierEmail: string;
  errorMessage: string;
}

export interface LoadingState {
  isLoadingData: boolean;
  minLoadingTime: boolean;
  hasLoaded: boolean;
}