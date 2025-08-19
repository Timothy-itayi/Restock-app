// Database types for Supabase integration

export interface User {
  id: string; // Supabase UUID
  clerk_id: string; // Clerk user ID
  email: string;
  name?: string; // User's first name for personalized greetings
  store_name?: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

export interface Product {
  id: string; // Supabase UUID
  user_id: string; // References Clerk user ID
  name: string;
  default_quantity: number;
  default_supplier_id?: string; // Supabase UUID reference
  notes?: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

export interface Supplier {
  id: string; // Supabase UUID
  user_id: string; // References Clerk user ID
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

export interface RestockSession {
  id: string; // Supabase UUID
  user_id: string; // References Clerk user ID
  name?: string;
  status: 'draft' | 'email_generated' | 'sent';
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
  completed_at?: string; // ISO timestamp string
}

export interface RestockItem {
  id: string; // Supabase UUID
  session_id: string; // Supabase UUID reference
  user_id: string; // References Clerk user ID
  product_name: string;
  quantity: number;
  supplier_name: string;
  supplier_email: string;
  notes?: string;
  created_at: string; // ISO timestamp string
}

export interface EmailSent {
  id: string; // Supabase UUID
  session_id: string; // Supabase UUID reference
  user_id: string; // References Clerk user ID
  supplier_email: string;
  supplier_name: string;
  email_content: string;
  sent_at: string; // ISO timestamp string
  status: 'sent' | 'delivered' | 'failed';
  error_message?: string;
}

export interface AuditLog {
  id: string; // Supabase UUID
  user_id: string; // References Clerk user ID
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  timestamp: string; // ISO timestamp string
  ip_address?: string;
  user_agent?: string;
}

// Insert types
export interface InsertUser {
  clerk_id: string;
  email: string;
  name?: string;
  store_name?: string;
}

export interface InsertProduct {
  user_id: string;
  name: string;
  default_quantity: number;
  default_supplier_id?: string;
  notes?: string;
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
  name?: string;
  status?: 'draft' | 'email_generated' | 'sent';
}

export interface InsertRestockItem {
  session_id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  supplier_name: string;
  supplier_email: string;
  notes?: string;
}

export interface InsertEmailSent {
  session_id: string;
  user_id: string;
  supplier_email: string;
  supplier_name: string;
  email_content: string;
}

export interface InsertAuditLog {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

// Update types
export interface UpdateUser {
  name?: string;
  store_name?: string;
}

export interface UpdateProduct {
  name?: string;
  default_quantity?: number;
  default_supplier_id?: string;
  notes?: string;
}

export interface UpdateSupplier {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateRestockSession {
  name?: string;
  status?: 'draft' | 'email_generated' | 'sent';
  completed_at?: string;
}

export interface UpdateEmailSent {
  status?: 'sent' | 'delivered' | 'failed';
  error_message?: string;
}

// Database table names
export const TABLES = {
  USERS: 'users',
  SUPPLIERS: 'suppliers',
  PRODUCTS: 'products',
  RESTOCK_SESSIONS: 'restock_sessions',
  RESTOCK_ITEMS: 'restock_items',
  EMAILS_SENT: 'emails_sent',
  AUDIT_LOGS: 'audit_logs',
} as const;

// Supabase Database type definition
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: InsertUser;
        Update: UpdateUser;
      };
      products: {
        Row: Product;
        Insert: InsertProduct;
        Update: UpdateProduct;
      };
      suppliers: {
        Row: Supplier;
        Insert: InsertSupplier;
        Update: UpdateSupplier;
      };
      restock_sessions: {
        Row: RestockSession;
        Insert: InsertRestockSession;
        Update: UpdateRestockSession;
      };
      restock_items: {
        Row: RestockItem;
        Insert: InsertRestockItem;
        Update: Partial<InsertRestockItem>;
      };
      emails_sent: {
        Row: EmailSent;
        Insert: InsertEmailSent;
        Update: UpdateEmailSent;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: InsertAuditLog;
        Update: Partial<InsertAuditLog>;
      };
    };
  };
} 