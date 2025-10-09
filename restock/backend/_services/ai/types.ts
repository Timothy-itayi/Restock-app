// AI Service Types

export interface EmailContext {
  storeName: string;
  supplierName: string;
  supplierEmail: string;
  products: ProductItem[];
  supplierHistory?: SupplierInteraction[];
  tone: 'professional' | 'friendly' | 'urgent';
  specialInstructions?: string;
  urgencyLevel: 'normal' | 'urgent' | 'rush';
  // User/sender information
  userEmail: string;
  userName?: string;
}

export interface ProductItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface SupplierInteraction {
  date: string;
  type: 'order' | 'inquiry' | 'complaint';
  summary: string;
  outcome: 'positive' | 'neutral' | 'negative';
}

export interface EmailGenerationOptions {
  tone?: 'professional' | 'friendly' | 'urgent';
  includePricing?: boolean;
  urgencyLevel?: 'normal' | 'urgent' | 'rush';
  customInstructions?: string;
  maxLength?: number;
}

export interface AISettings {
  tone: 'professional' | 'friendly' | 'casual';
  includePricing: boolean;
  urgencyLevel: 'normal' | 'urgent' | 'rush';
  customInstructions: string;
  modelPreference: 'fast' | 'balanced' | 'quality';
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  confidence: number;
  generationTime: number;
}

export interface ModelInfo {
  name: string;
  size: number; // in MB
  downloadUrl: string;
  isDownloaded: boolean;
  lastUsed: Date | null;
  performance: {
    avgGenerationTime: number;
    successRate: number;
  };
}

export interface GenerationProgress {
  step: 'initializing' | 'loading_model' | 'generating' | 'formatting' | 'complete';
  progress: number; // 0-100
  message: string;
  currentSupplier?: string;
  totalSuppliers?: number;
} 