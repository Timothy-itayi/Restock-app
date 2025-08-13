/**
 * INFRASTRUCTURE ADAPTER: GroqEmailAdapter
 * 
 * Adapts the GROQ email generation service for use in the infrastructure layer
 * Isolates AI service concerns from domain logic
 */

import { EmailGenerator } from '../../../backend/services/ai/email-generator';
import type { 
  EmailContext, 
  EmailGenerationOptions, 
  GeneratedEmail 
} from '../../../backend/services/ai/types';

export interface EmailRequest {
  supplierName: string;
  supplierEmail: string;
  products: Array<{
    name: string;
    quantity: number;
    notes?: string;
  }>;
  userInfo: {
    name: string;
    email: string;
    storeName: string;
  };
  options?: {
    tone?: 'professional' | 'friendly' | 'urgent';
    urgencyLevel?: 'normal' | 'urgent' | 'rush';
    customInstructions?: string;
    maxLength?: number;
  };
}

export interface EmailResult {
  subject: string;
  body: string;
  confidence: number;
  generationTimeMs: number;
  success: boolean;
  error?: string;
}

export class EmailGenerationError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'EmailGenerationError';
  }
}

/**
 * GroqEmailAdapter provides email generation abstraction
 * 
 * This adapter:
 * - Isolates GROQ-specific concerns from domain logic
 * - Provides clean error handling and type conversion
 * - Makes it easy to swap email generation providers
 */
export class GroqEmailAdapter {
  private emailGenerator: EmailGenerator;
  private isInitialized = false;

  constructor() {
    this.emailGenerator = new EmailGenerator();
  }

  /**
   * Initialize the email adapter
   */
  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      try {
        await this.emailGenerator.initialize();
        this.isInitialized = true;
        console.log('[GroqEmailAdapter] Initialized successfully');
      } catch (error) {
        console.error('[GroqEmailAdapter] Failed to initialize:', error);
        throw new EmailGenerationError('Failed to initialize email generation service', error);
      }
    }
  }

  /**
   * Generate a professional email for a supplier
   */
  async generateEmail(request: EmailRequest): Promise<EmailResult> {
    await this.ensureInitialized();

    try {
      // Convert our request format to the AI service format
      const context = this.mapToEmailContext(request);
      const options = this.mapToGenerationOptions(request.options || {});

      console.log(`[GroqEmailAdapter] Generating email for supplier: ${request.supplierName}`);

      // Generate the email using the underlying service
      const generatedEmail = await this.emailGenerator.generatePersonalizedEmail(
        context,
        options
      );

      return {
        subject: generatedEmail.subject,
        body: generatedEmail.body,
        confidence: generatedEmail.confidence,
        generationTimeMs: generatedEmail.generationTime,
        success: true
      };

    } catch (error) {
      console.error('[GroqEmailAdapter] Email generation failed:', error);
      
      return {
        subject: '',
        body: '',
        confidence: 0,
        generationTimeMs: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate emails for multiple suppliers
   */
  async generateEmailsForSuppliers(requests: EmailRequest[]): Promise<EmailResult[]> {
    await this.ensureInitialized();

    const results: EmailResult[] = [];

    // Process each supplier's email generation
    for (const request of requests) {
      const result = await this.generateEmail(request);
      results.push(result);
    }

    return results;
  }

  /**
   * Regenerate an email with feedback
   */
  async regenerateEmail(
    originalRequest: EmailRequest,
    feedback: string,
    originalEmail: string
  ): Promise<EmailResult> {
    await this.ensureInitialized();

    try {
      const context = this.mapToEmailContext(originalRequest);
      
      const regeneratedEmail = await this.emailGenerator.regenerateEmail(
        originalEmail,
        feedback,
        context
      );

      return {
        subject: regeneratedEmail.subject,
        body: regeneratedEmail.body,
        confidence: regeneratedEmail.confidence,
        generationTimeMs: regeneratedEmail.generationTime,
        success: true
      };

    } catch (error) {
      console.error('[GroqEmailAdapter] Email regeneration failed:', error);
      
      return {
        subject: '',
        body: '',
        confidence: 0,
        generationTimeMs: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if the adapter is ready for use
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // Private helper methods

  /**
   * Ensure the adapter is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Map our request format to the AI service's EmailContext format
   */
  private mapToEmailContext(request: EmailRequest): EmailContext {
    return {
      storeName: request.userInfo.storeName,
      supplierName: request.supplierName,
      supplierEmail: request.supplierEmail,
      products: request.products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        notes: p.notes
      })),
      supplierHistory: [], // Could be enhanced with actual history
      tone: request.options?.tone || 'professional',
      specialInstructions: request.options?.customInstructions,
      urgencyLevel: request.options?.urgencyLevel || 'normal',
      userEmail: request.userInfo.email,
      userName: request.userInfo.name
    };
  }

  /**
   * Map our options format to the AI service's EmailGenerationOptions format
   */
  private mapToGenerationOptions(options: EmailRequest['options']): EmailGenerationOptions {
    return {
      tone: options?.tone || 'professional',
      includePricing: false, // Default to not include pricing
      urgencyLevel: options?.urgencyLevel || 'normal',
      customInstructions: options?.customInstructions,
      maxLength: options?.maxLength || 300
    };
  }
}

/**
 * Factory function to create a GroqEmailAdapter instance
 */
export function createGroqEmailAdapter(): GroqEmailAdapter {
  return new GroqEmailAdapter();
}