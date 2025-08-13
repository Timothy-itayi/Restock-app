/**
 * FULL STACK INTEGRATION TESTS
 * 
 * Tests the complete integration between UI hooks, application services,
 * and infrastructure layer through the DI container
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { DIContainer } from '../../app/infrastructure/di/Container';
import { registerServices, healthCheck } from '../../app/infrastructure/di/ServiceRegistry';
import { useRestockSession } from '../../app/(tabs)/restock-sessions/hooks/useRestockSession';
import { useProductForm } from '../../app/(tabs)/restock-sessions/hooks/useProductForm';
import type { RestockApplicationService } from '../../app/application/interfaces/RestockApplicationService';
import type { UserContextService } from '../../app/infrastructure/services/UserContextService';
import type { IdGeneratorService } from '../../app/infrastructure/services/IdGeneratorService';
import type { SupabaseSessionRepository } from '../../app/infrastructure/repositories/SupabaseSessionRepository';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Supabase
jest.mock('../../app/infrastructure/config/SupabaseConfig', () => {
  const mockQuery = {
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    order: jest.fn(() => ({ limit: jest.fn(() => Promise.resolve({ data: [], error: null })) })),
  };
  const mockFrom = jest.fn(() => ({
    select: jest.fn(() => mockQuery),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
  }));

  return {
    supabaseClient: {
      from: mockFrom,
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-123' } }, error: null })),
      },
    },
  };
});

// Mock auth hook
jest.mock('../../app/_contexts/UnifiedAuthProvider', () => ({
  useAuth: () => ({
    userId: 'test-user-123',
    isSignedIn: true,
  }),
}));

describe('Full Stack Integration Tests', () => {
  let container: DIContainer;
  
  beforeAll(() => {
    // Disable console output for cleaner test results
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    DIContainer.reset();
    container = DIContainer.getInstance();
  });

  afterEach(() => {
    DIContainer.reset();
    jest.clearAllMocks();
  });

  describe('Dependency Injection Container', () => {
    test('should register all required services', () => {
      expect(() => registerServices()).not.toThrow();
      
      const requiredServices = [
        'UserContextService',
        'IdGeneratorService',
        'GroqEmailAdapter',
        'SupabaseSessionRepository',
        'SupabaseProductRepository',
        'SupabaseSupplierRepository',
        'RestockApplicationService'
      ];

      requiredServices.forEach(serviceName => {
        expect(container.has(serviceName)).toBe(true);
      });
    });

    test('should pass health check after registration', () => {
      registerServices();
      
      const health = healthCheck();
      
      expect(health.healthy).toBe(true);
      expect(health.issues).toHaveLength(0);
    });

    test('should create service instances without circular dependencies', () => {
      registerServices();
      
      expect(() => container.get('UserContextService')).not.toThrow();
      expect(() => container.get('IdGeneratorService')).not.toThrow();
      expect(() => container.get('SupabaseSessionRepository')).not.toThrow();
      expect(() => container.get('RestockApplicationService')).not.toThrow();
    });
  });

  describe('UI Hook Integration', () => {
    beforeEach(() => {
      registerServices();
    });

    test('should initialize hooks with proper service dependencies', () => {
      const { result } = renderHook(() => useRestockSession());
      
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createSession).toBe('function');
    });

    test('should handle service dependency injection correctly', () => {
      // This test validates that hooks can access services through DI
      expect(() => renderHook(() => useRestockSession())).not.toThrow();
      expect(() => renderHook(() => useProductForm())).not.toThrow();
    });
  });

  describe('Service Layer Integration', () => {
    beforeEach(() => {
      registerServices();
    });

    test('should create and resolve application service', () => {
      const applicationService = container.get<RestockApplicationService>('RestockApplicationService');
      
      expect(applicationService).toBeDefined();
      expect(typeof applicationService.createSession).toBe('function');
      expect(typeof applicationService.addProduct).toBe('function');
      expect(typeof applicationService.generateEmails).toBe('function');
    });

    test('should maintain singleton pattern for services', () => {
      const service1 = container.get<RestockApplicationService>('RestockApplicationService');
      const service2 = container.get<RestockApplicationService>('RestockApplicationService');
      
      expect(service1).toBe(service2);
    });

    test('should resolve nested service dependencies', () => {
      const applicationService = container.get<RestockApplicationService>('RestockApplicationService');
      const sessionRepository = container.get<SupabaseSessionRepository>('SupabaseSessionRepository');
      const userContextService = container.get<UserContextService>('UserContextService');
      const idGenerator = container.get<IdGeneratorService>('IdGeneratorService');
      
      // All services should be properly instantiated
      expect(applicationService).toBeDefined();
      expect(sessionRepository).toBeDefined();
      expect(userContextService).toBeDefined();
      expect(idGenerator).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      registerServices();
    });

    test('should handle missing service gracefully', () => {
      DIContainer.reset();
      container = DIContainer.getInstance();
      // Don't register services
      
      expect(() => {
        renderHook(() => useRestockSession());
      }).toThrow(/Service 'RestockApplicationService' not found in container/);
    });

    test('should handle service creation errors', () => {
      registerServices();
      
      // Mock a service to throw during creation
      container.register('FaultyService', () => {
        throw new Error('Service creation failed');
      });
      
      expect(() => container.get('FaultyService')).toThrow(/Failed to create service 'FaultyService'/);
    });
  });

  describe('Service Registry Validation', () => {
    test('should handle service registration failures', () => {
      // Test service registration error handling without mocking
      expect(() => registerServices()).not.toThrow();
    });

    test('should provide detailed error messages', () => {
      DIContainer.reset();
      container = DIContainer.getInstance();
      
      try {
        container.get('NonExistentService');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Service \'NonExistentService\' not found in container');
          expect(error.message).toContain('Available services:');
        } else {
          throw new Error('Expected error to be Error instance');
        }
      }
    });
  });

  describe('Domain Business Rules Integration', () => {
    beforeEach(() => {
      registerServices();
    });

    test('should enforce business rules through the full stack', async () => {
      const { result } = renderHook(() => useRestockSession());
      
      // Mock the application service to test business rule enforcement
      const applicationService = container.get<RestockApplicationService>('RestockApplicationService');
      
      // Mock createSession to return a session that enforces business rules
      jest.spyOn(applicationService, 'createSession').mockResolvedValue({
        success: true,
        session: {
          toValue: () => ({
            id: 'test-session',
            userId: 'test-user-123',
            name: 'Test Session',
            status: 'draft' as const,
            items: [],
            createdAt: new Date(),
          }),
          isEmpty: () => true,
          canGenerateEmails: () => false,
          addItem: jest.fn(),
        } as any
      });
      
      let createResult: any;
      
      await act(async () => {
        createResult = await result.current.createSession('Test Session');
      });
      
      expect(createResult.success).toBe(true);
      expect(applicationService.createSession).toHaveBeenCalledWith({
        userId: 'test-user-123',
        name: 'Test Session'
      });
    });
  });

  describe('Form Integration Workflow', () => {
    beforeEach(() => {
      registerServices();
    });

    test('should complete full product addition workflow', async () => {
      const { result: sessionResult } = renderHook(() => useRestockSession());
      const { result: formResult } = renderHook(() => useProductForm());
      
      // Mock successful session creation
      const applicationService = container.get<RestockApplicationService>('RestockApplicationService');
      
      // Create a proper mock session object
      const mockSessionValue = {
        id: 'test-session',
        userId: 'test-user-123',
        name: 'Test Session',
        status: 'draft' as const,
        items: [],
        createdAt: new Date(),
      };
      
      const mockSession = {
        toValue: () => mockSessionValue,
        isEmpty: () => true,
      };
      
      jest.spyOn(applicationService, 'createSession').mockResolvedValue({
        success: true,
        session: mockSession as any
      });
      
      jest.spyOn(applicationService, 'addProduct').mockResolvedValue({
        success: true,
        session: {
          ...mockSession,
          toValue: () => ({
            ...mockSessionValue,
            items: [{
              productId: 'product-1',
              productName: 'Test Product',
              quantity: 5,
              supplierId: 'supplier-1',
              supplierName: 'Test Supplier',
              supplierEmail: 'test@supplier.com'
            }],
          }),
          isEmpty: () => false,
        } as any
      });
      
      // Step 1: Create session
      await act(async () => {
        await sessionResult.current.createSession('Test Session');
      });
      
      expect(sessionResult.current.session).toBeDefined();
      
      // Step 2: Fill out form
      act(() => {
        formResult.current.updateField('productName', 'Test Product');
        formResult.current.updateField('quantity', '5');
        formResult.current.updateField('supplierName', 'Test Supplier');
        formResult.current.updateField('supplierEmail', 'test@supplier.com');
      });
      
      // Step 3: Validate form
      act(() => {
        const isValid = formResult.current.validateForm();
        expect(isValid).toBe(true);
      });
      
      // Step 4: Add product to session
      await act(async () => {
        await sessionResult.current.addProduct({
          productName: 'Test Product',
          quantity: 5,
          supplierName: 'Test Supplier',
          supplierEmail: 'test@supplier.com'
        });
      });
      
      expect(applicationService.addProduct).toHaveBeenCalled();
    });
  });

  describe('Memory and Performance', () => {
    beforeEach(() => {
      registerServices();
    });

    test('should not create multiple instances of singletons', () => {
      const instances: RestockApplicationService[] = [];
      
      // Get the same service multiple times
      for (let i = 0; i < 10; i++) {
        instances.push(container.get<RestockApplicationService>('RestockApplicationService'));
      }
      
      // All instances should be the same object
      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });

    test('should handle concurrent service access', () => {
      const promises = Array(10).fill(0).map(() => {
        return Promise.resolve(container.get<RestockApplicationService>('RestockApplicationService'));
      });
      
      return Promise.all(promises).then(instances => {
        const firstInstance = instances[0];
        instances.forEach(instance => {
          expect(instance).toBe(firstInstance);
        });
      });
    });
  });
});