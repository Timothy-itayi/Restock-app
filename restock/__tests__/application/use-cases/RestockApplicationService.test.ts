/**
 * APPLICATION LAYER TESTS: RestockApplicationService
 * 
 * Tests the main application service that coordinates use cases
 * This is the core of our business logic orchestration
 */

import { RestockApplicationServiceImpl } from '../../../app/application/use-cases/RestockApplicationServiceImpl';
import type { 
  SessionRepository,
  ProductRepository,
  SupplierRepository 
} from '../../../app/domain/interfaces';
import type { RestockSession } from '../../../app/domain/entities/RestockSession';
import type { Product } from '../../../app/domain/entities/Product';
import type { Supplier } from '../../../app/domain/entities/Supplier';

// Mock implementations
class MockSessionRepository implements SessionRepository {
  private sessions: Map<string, RestockSession> = new Map();
  
  async findById(sessionId: string): Promise<RestockSession | null> {
    return this.sessions.get(sessionId) || null;
  }
  
  async findByUserId(userId: string): Promise<RestockSession[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.toValue().userId === userId
    );
  }
  
  async save(session: RestockSession): Promise<RestockSession> {
    this.sessions.set(session.toValue().id, session);
    return session;
  }
  
  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}

class MockProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();
  
  async findById(productId: string): Promise<Product | null> {
    return this.products.get(productId) || null;
  }
  
  async findByUserId(userId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.toValue().userId === userId
    );
  }
  
  async save(product: Product): Promise<Product> {
    this.products.set(product.toValue().id, product);
    return product;
  }
  
  async delete(productId: string): Promise<void> {
    this.products.delete(productId);
  }
}

class MockSupplierRepository implements SupplierRepository {
  private suppliers: Map<string, Supplier> = new Map();
  
  async findById(supplierId: string): Promise<Supplier | null> {
    return this.suppliers.get(supplierId) || null;
  }
  
  async findByUserId(userId: string): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(
      supplier => supplier.toValue().userId === userId
    );
  }
  
  async findByEmail(email: string): Promise<Supplier | null> {
    return Array.from(this.suppliers.values()).find(
      supplier => supplier.toValue().email === email
    ) || null;
  }
  
  async save(supplier: Supplier): Promise<Supplier> {
    this.suppliers.set(supplier.toValue().id, supplier);
    return supplier;
  }
  
  async delete(supplierId: string): Promise<void> {
    this.suppliers.delete(supplierId);
  }
}

class MockIdGeneratorService {
  generate(): string {
    return `mock-id-${Date.now()}-${Math.random()}`;
  }
}

class MockEmailAdapter {
  async initialize(): Promise<void> {
    // Mock initialization
  }
  
  async generateEmails(session: RestockSession, options: any): Promise<any[]> {
    return [];
  }
}

describe('RestockApplicationService', () => {
  let applicationService: RestockApplicationServiceImpl;
  let mockSessionRepository: MockSessionRepository;
  let mockProductRepository: MockProductRepository;
  let mockSupplierRepository: MockSupplierRepository;
  let mockIdGenerator: MockIdGeneratorService;
  let mockEmailAdapter: MockEmailAdapter;

  beforeEach(() => {
    mockSessionRepository = new MockSessionRepository();
    mockProductRepository = new MockProductRepository();
    mockSupplierRepository = new MockSupplierRepository();
    mockIdGenerator = new MockIdGeneratorService();
    mockEmailAdapter = new MockEmailAdapter();
    
    applicationService = new RestockApplicationServiceImpl(
      mockSessionRepository,
      mockProductRepository,
      mockSupplierRepository,
      mockIdGenerator,
      mockEmailAdapter
    );
  });

  describe('Session Management', () => {
    test('should create new session successfully', async () => {
      const command = {
        userId: 'user-1',
        name: 'Test Session'
      };
      
      const result = await applicationService.createSession(command);
      
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session!.toValue().name).toBe('Test Session');
      expect(result.session!.toValue().userId).toBe('user-1');
      expect(result.error).toBeUndefined();
    });

    test('should create session with default name if not provided', async () => {
      const command = {
        userId: 'user-1'
      };
      
      const result = await applicationService.createSession(command);
      
      expect(result.success).toBe(true);
      expect(result.session!.toValue().name).toMatch(/^Restock Session \d{4}-\d{2}-\d{2}/);
    });

    test('should handle session creation errors', async () => {
      const command = {
        userId: '', // Invalid user ID
        name: 'Test Session'
      };
      
      const result = await applicationService.createSession(command);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
      expect(result.session).toBeUndefined();
    });

    test('should retrieve existing session', async () => {
      // First create a session
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      
      const sessionId = createResult.session!.toValue().id;
      
      // Then retrieve it
      const result = await applicationService.getSession(sessionId);
      
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session!.toValue().id).toBe(sessionId);
    });

    test('should handle non-existent session retrieval', async () => {
      const result = await applicationService.getSession('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
      expect(result.session).toBeUndefined();
    });

    test('should get sessions by user ID', async () => {
      // Create multiple sessions for the same user
      await applicationService.createSession({ userId: 'user-1', name: 'Session 1' });
      await applicationService.createSession({ userId: 'user-1', name: 'Session 2' });
      await applicationService.createSession({ userId: 'user-2', name: 'Session 3' });
      
      const result = await applicationService.getSessions({ userId: 'user-1' });
      
      expect(result.success).toBe(true);
      expect(result.sessions).toBeDefined();
      expect(result.sessions!.all).toHaveLength(2);
    });

    test('should delete session successfully', async () => {
      // Create a session first
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      
      const sessionId = createResult.session!.toValue().id;
      
      // Delete the session
      const deleteResult = await applicationService.deleteSession(sessionId);
      
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.error).toBeUndefined();
      
      // Verify session is deleted
      const getResult = await applicationService.getSession(sessionId);
      expect(getResult.success).toBe(false);
    });
  });

  describe('Product Management', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a session for testing
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      sessionId = createResult.session!.toValue().id;
    });

    test('should add product to session successfully', async () => {
      const command = {
        sessionId,
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 5,
        notes: 'Test notes'
      };
      
      const result = await applicationService.addProduct(command);
      
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session!.toValue().items).toHaveLength(1);
      expect(result.session!.toValue().items[0].quantity).toBe(5);
    });

    test('should handle adding product to non-existent session', async () => {
      const command = {
        sessionId: 'non-existent-session',
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 5
      };
      
      const result = await applicationService.addProduct(command);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });

    test('should validate product quantity', async () => {
      const command = {
        sessionId,
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 0 // Invalid quantity
      };
      
      const result = await applicationService.addProduct(command);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Quantity must be greater than 0');
    });

    test('should remove product from session', async () => {
      // First add a product
      const addCommand = {
        sessionId,
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 5
      };
      
      await applicationService.addProduct(addCommand);
      
      // Then remove it
      const result = await applicationService.removeProduct(sessionId, 'product-1');
      
      expect(result.success).toBe(true);
      expect(result.session!.toValue().items).toHaveLength(0);
    });

    test('should update product quantity', async () => {
      // First add a product
      await applicationService.addProduct({
        sessionId,
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 5
      });
      
      // Then update quantity
      const result = await applicationService.updateProduct(sessionId, 'product-1', 10, 'Updated notes');
      
      expect(result.success).toBe(true);
      expect(result.session!.toValue().items[0].quantity).toBe(10);
      expect(result.session!.toValue().items[0].notes).toBe('Updated notes');
    });
  });

  describe('Session Summary', () => {
    test('should provide session summary for empty session', async () => {
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Empty Session'
      });
      
      const sessionId = createResult.session!.toValue().id;
      const result = await applicationService.getSessionSummary(sessionId);
      
      expect(result.success).toBe(true);
      expect(result.summary).toEqual({
        totalItems: 0,
        totalProducts: 0,
        supplierCount: 0,
        status: 'draft',
        isEmpty: true,
        canGenerateEmails: false,
        canSendEmails: false
      });
    });

    test('should provide session summary with items', async () => {
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      
      const sessionId = createResult.session!.toValue().id;
      
      // Add some products
      await applicationService.addProduct({
        sessionId,
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 5
      });
      
      await applicationService.addProduct({
        sessionId,
        productId: 'product-2',
        supplierId: 'supplier-2',
        quantity: 3
      });
      
      const result = await applicationService.getSessionSummary(sessionId);
      
      expect(result.success).toBe(true);
      expect(result.summary).toEqual({
        totalItems: 8, // 5 + 3
        totalProducts: 2,
        supplierCount: 2,
        status: 'draft',
        isEmpty: false,
        canGenerateEmails: true,
        canSendEmails: false
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle repository errors gracefully', async () => {
      // Mock repository to throw error
      jest.spyOn(mockSessionRepository, 'save').mockRejectedValue(new Error('Database error'));
      
      const result = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    test('should handle validation errors', async () => {
      const result = await applicationService.createSession({
        userId: '', // Invalid
        name: 'Test Session'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Business Rules Enforcement', () => {
    test('should enforce session state transitions', async () => {
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      
      const sessionId = createResult.session!.toValue().id;
      
      // Try to mark as sent without generating emails first
      const result = await applicationService.markAsSent(sessionId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot mark session as sent');
    });

    test('should validate business constraints', async () => {
      const createResult = await applicationService.createSession({
        userId: 'user-1',
        name: 'Test Session'
      });
      
      const sessionId = createResult.session!.toValue().id;
      
      // Try to generate emails for empty session
      const emailResult = await applicationService.generateEmails({
        sessionId,
        userStoreName: 'Test Store'
      });
      
      expect(emailResult.success).toBe(false);
      expect(emailResult.error).toContain('Cannot generate emails for empty session');
    });
  });
});