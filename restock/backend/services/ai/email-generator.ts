import { GroqEmailClient } from './groq-email-client';
import { PromptBuilder } from './prompts';
import { 
  EmailContext, 
  EmailGenerationOptions, 
  GeneratedEmail, 
  GenerationProgress 
} from './types';

export class EmailGenerator {
  private llmClient: GroqEmailClient;
  private isInitialized = false;

  constructor() {
    this.llmClient = new GroqEmailClient();
  }

  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.llmClient.initialize();
      this.isInitialized = true;
    }
  }

  async generateEmailsForSession(
    sessionData: any, // Session data from AsyncStorage
    userId: string,
    options: EmailGenerationOptions = {},
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GeneratedEmail[]> {
    
    try {
      // Step 1: Initialize
      onProgress?.({
        step: 'initializing',
        progress: 10,
        message: 'Initializing AI email generator...'
      });

      await this.initialize();

      // Step 2: Extract data from session with validation
      onProgress?.({
        step: 'loading_model',
        progress: 20,
        message: 'Processing session data...'
      });

      // Validate session data
      if (!sessionData) {
        throw new Error('No session data provided');
      }

      const { groupedItems, products, sessionId } = sessionData;
      
      // If we don't have groupedItems, try to create them from products
      let processedGroupedItems = groupedItems;
      if (!processedGroupedItems && products && Array.isArray(products)) {
        console.log('🔄 Creating grouped items from products array...');
        processedGroupedItems = this.createGroupedItemsFromProducts(products);
      }
      
      // Validate groupedItems
      if (!processedGroupedItems || typeof processedGroupedItems !== 'object' || Object.keys(processedGroupedItems).length === 0) {
        throw new Error('No supplier data found in session');
      }

      const storeName = 'Greenfields Grocery'; // Default store name

      // Step 3: Generate emails for each supplier
      const totalSuppliers = Object.keys(processedGroupedItems).length;
      const generatedEmails: GeneratedEmail[] = [];

      let supplierIndex = 0;
      for (const [supplierId, supplierData] of Object.entries(processedGroupedItems)) {
        supplierIndex++;
        
        // Validate supplier data
        if (!supplierData || typeof supplierData !== 'object') {
          console.warn(`Invalid supplier data for ${supplierId}, skipping...`);
          continue;
        }

        const supplier = (supplierData as any).supplier;
        const items = (supplierData as any).items;

        // Validate supplier and items
        if (!supplier || !supplier.name || !supplier.email) {
          console.warn(`Invalid supplier info for ${supplierId}, skipping...`);
          continue;
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
          console.warn(`No items found for supplier ${supplier.name}, skipping...`);
          continue;
        }
        
        onProgress?.({
          step: 'generating',
          progress: 20 + (supplierIndex / totalSuppliers) * 70,
          message: `Generating email for ${supplier.name}...`,
          currentSupplier: supplier.name,
          totalSuppliers
        });

        try {
          const emailContext = await this.buildEmailContext(
            storeName,
            supplier,
            items,
            userId,
            options
          );

          const generatedEmail = await this.generateSupplierEmail(emailContext, options);
          generatedEmails.push(generatedEmail);
        } catch (error) {
          console.error(`Failed to generate email for ${supplier.name}:`, error);
          // Continue with other suppliers
        }
      }

      if (generatedEmails.length === 0) {
        throw new Error('No emails could be generated from the session data');
      }

      // Step 4: Complete
      onProgress?.({
        step: 'complete',
        progress: 100,
        message: `Generated ${generatedEmails.length} emails successfully!`
      });

      return generatedEmails;

    } catch (error) {
      console.error('Error generating emails for session:', error);
      throw new Error(`Failed to generate emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createGroupedItemsFromProducts(products: any[]): any {
    const groupedItems: any = {};
    
    products.forEach(product => {
      const supplierName = product.supplierName || 'Unknown Supplier';
      const supplierEmail = product.supplierEmail || 'supplier@example.com';
      
      if (!groupedItems[supplierName]) {
        groupedItems[supplierName] = {
          supplier: {
            name: supplierName,
            email: supplierEmail
          },
          items: []
        };
      }
      
      groupedItems[supplierName].items.push({
        product: {
          name: product.name,
          id: product.id
        },
        quantity: product.quantity,
        notes: product.notes
      });
    });
    
    return groupedItems;
  }

  private async buildEmailContext(
    storeName: string,
    supplier: any,
    items: any[],
    userId: string,
    options: EmailGenerationOptions
  ): Promise<EmailContext> {
    // Validate inputs
    if (!supplier || !supplier.name || !supplier.email) {
      throw new Error('Invalid supplier data');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('No items provided for email generation');
    }

    // Convert items to ProductItem format with validation
    const products = items.map(item => {
      if (!item) {
        throw new Error('Invalid item data');
      }
      
      const name = item.product?.name || item.name;
      const quantity = item.quantity;
      
      if (!name || !quantity) {
        throw new Error('Invalid item: missing name or quantity');
      }
      
      return {
        name,
        quantity,
        notes: item.notes || undefined
      };
    });

    return {
      storeName: storeName || 'Greenfields Grocery',
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      products,
      tone: options.tone || 'professional',
      urgencyLevel: options.urgencyLevel || 'normal'
    };
  }

  private async generateSupplierEmail(
    context: EmailContext, 
    options: EmailGenerationOptions
  ): Promise<GeneratedEmail> {
    // Generate the email using the Groq client
    const generatedEmail = await this.llmClient.generateEmail(context, options.maxLength || 300);
    
    return generatedEmail;
  }

  async regenerateEmail(
    originalEmail: string, 
    feedback: string,
    context: EmailContext
  ): Promise<GeneratedEmail> {
    return this.llmClient.regenerateEmail(originalEmail, feedback);
  }

  async generatePersonalizedEmail(
    context: EmailContext,
    options: EmailGenerationOptions = {}
  ): Promise<GeneratedEmail> {
    return this.llmClient.generateEmail(context, options.maxLength || 300);
  }

  async getModelInfo() {
    return this.llmClient.getModelInfo();
  }

  async cleanup() {
    await this.llmClient.cleanup();
    this.isInitialized = false;
  }
} 