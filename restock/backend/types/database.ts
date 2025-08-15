// Database types for Convex integration

export interface User {
  _id: string; // Convex document ID
  clerkUserId: string; // Clerk user ID
  email: string;
  name?: string; // User's first name for personalized greetings
  storeName?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface Product {
  _id: string; // Convex document ID
  userId: string; // References Clerk user ID
  name: string;
  defaultQuantity: number;
  defaultSupplierId?: string; // Convex document ID reference
  notes?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface Supplier {
  _id: string; // Convex document ID
  userId: string; // References Clerk user ID
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface RestockSession {
  _id: string; // Convex document ID
  userId: string; // References Clerk user ID
  name?: string;
  status: 'draft' | 'email_generated' | 'sent';
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  completedAt?: number; // Unix timestamp
}

export interface RestockItem {
  _id: string; // Convex document ID
  sessionId: string; // Convex document ID reference
  userId: string; // References Clerk user ID
  productName: string;
  quantity: number;
  supplierName: string;
  supplierEmail: string;
  notes?: string;
  createdAt: number; // Unix timestamp
}

export interface EmailSent {
  _id: string; // Convex document ID
  sessionId: string; // Convex document ID reference
  userId: string; // References Clerk user ID
  supplierEmail: string;
  supplierName: string;
  emailContent: string;
  sentAt: number; // Unix timestamp
  status: 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
}

// Insert types
export interface InsertUser {
  clerkUserId: string;
  email: string;
  name?: string;
  storeName?: string;
}

export interface InsertProduct {
  userId: string;
  name: string;
  defaultQuantity: number;
  defaultSupplierId?: string;
  notes?: string;
}

export interface InsertSupplier {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface InsertRestockSession {
  userId: string;
  name?: string;
  status?: 'draft' | 'email_generated' | 'sent';
}

export interface InsertRestockItem {
  sessionId: string;
  userId: string;
  productName: string;
  quantity: number;
  supplierName: string;
  supplierEmail: string;
  notes?: string;
}

export interface InsertEmailSent {
  sessionId: string;
  userId: string;
  supplierEmail: string;
  supplierName: string;
  emailContent: string;
}

// Update types
export interface UpdateUser {
  name?: string;
  storeName?: string;
}

export interface UpdateProduct {
  name?: string;
  defaultQuantity?: number;
  defaultSupplierId?: string;
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
  completedAt?: number;
}

export interface UpdateEmailSent {
  status?: 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
} 