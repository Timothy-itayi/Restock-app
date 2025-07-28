// Database types for Supabase integration

export interface User {
  id: string; // Clerk user ID (text, not UUID)
  email: string;
  store_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  user_id: string; // References Clerk user ID
  name: string;
  default_quantity: number;
  default_supplier_id?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  user_id: string; // References Clerk user ID
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

export interface RestockSession {
  id: string;
  user_id: string; // References Clerk user ID
  created_at: string;
  status: 'draft' | 'sent';
}

export interface RestockItem {
  id: string;
  session_id: string;
  product_id: string;
  supplier_id: string;
  quantity: number;
  notes?: string;
}

export interface EmailSent {
  id: string;
  session_id: string;
  supplier_id: string;
  email_content: string;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
}

// Insert types
export interface InsertUser {
  id: string;
  email: string;
  store_name?: string;
}

export interface InsertProduct {
  user_id: string;
  name: string;
  default_quantity: number;
  default_supplier_id?: string;
}

export interface InsertSupplier {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface InsertRestockSession {
  user_id: string;
  status?: 'draft' | 'sent';
}

export interface InsertRestockItem {
  session_id: string;
  product_id: string;
  supplier_id: string;
  quantity: number;
  notes?: string;
}

export interface InsertEmailSent {
  session_id: string;
  supplier_id: string;
  email_content: string;
  status?: 'pending' | 'sent' | 'failed';
  error_message?: string;
}

// Update types
export interface UpdateProduct {
  name?: string;
  default_quantity?: number;
  default_supplier_id?: string;
}

export interface UpdateSupplier {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateRestockSession {
  status?: 'draft' | 'sent';
}

export interface UpdateEmailSent {
  status?: 'pending' | 'sent' | 'failed';
  error_message?: string;
} 