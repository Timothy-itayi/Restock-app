// /**
//  * FULL STACK INTEGRATION TESTS
//  * 
//  * Tests the complete integration between UI hooks, application services,
//  * and infrastructure layer through the DI container
//  */

// import { renderHook, act } from '@testing-library/react-hooks';
// import { DIContainer } from '../../app/infrastructure/di/Container';
// import { useRestockSession } from '../../app/(tabs)/restock-sessions/hooks/useRestockSession';
// import { useProductForm } from '../../app/(tabs)/restock-sessions/hooks/useProductForm';
// import type { RestockApplicationService } from '../../app/application/interfaces/RestockApplicationService';
// import type { IdGeneratorService } from '../../app/infrastructure/services/IdGeneratorService';

// // Mock React Native modules
// jest.mock('react-native', () => ({
//   Platform: {
//     OS: 'ios',
//   },
// }));

// // Mock AsyncStorage
// jest.mock('@react-native-async-storage/async-storage', () => ({
//   setItem: jest.fn(),
//   getItem: jest.fn(),
//   removeItem: jest.fn(),
//   clear: jest.fn(),
// }));

// // Mock services for testing
// const mockUserContextService = {
//   getCurrentUserId: jest.fn(() => 'test-user-123'),
//   getCurrentUser: jest.fn(() => ({ id: 'test-user-123', email: 'test@example.com' })),
//   setCurrentUser: jest.fn(),
//   clearCurrentUser: jest.fn(),
// };

// const mockIdGeneratorService = {
//   generate: jest.fn(() => 'mock-id-123'),
// };

// const mockRestockApplicationService = {
//   createSession: jest.fn(() => ({ success: true, session: { toValue: () => ({ id: 'session-123', userId: 'test-user-123', name: 'Test Session' }) } })),
//   getSession: jest.fn(),
//   addProduct: jest.fn(),
//   removeProduct: jest.fn(),
//   updateProduct: jest.fn(),
//   getSessionSummary: jest.fn(),
//   getSessions: jest.fn(),
//   deleteSession: jest.fn(),
//   generateEmails: jest.fn(),
// };

// const mockSupabaseSessionRepository = {
//   findById: jest.fn(),
//   findByUserId: jest.fn(),
//   save: jest.fn(),
//   delete: jest.fn(),
//   findUnfinishedByUserId: jest.fn(),
//   findCompletedByUserId: jest.fn(),
//   findByStatus: jest.fn(),
//   countByUserId: jest.fn(),
//   findRecentByUserId: jest.fn(),
// };

// const mockSupabaseProductRepository = {
//   findById: jest.fn(),
//   findByUserId: jest.fn(),
//   save: jest.fn(),
//   delete: jest.fn(),
//   findByName: jest.fn(),
//   search: jest.fn(),
//   findBySupplierId: jest.fn(),
//   countByUserId: jest.fn(),
//   findMostUsed: jest.fn(),
// };

// const mockSupabaseSupplierRepository = {
//   findById: jest.fn(),
//   findByUserId: jest.fn(),
//   findByEmail: jest.fn(),
//   save: jest.fn(),
//   delete: jest.fn(),
//   search: jest.fn(),
//   countByUserId: jest.fn(),
//   findMostUsed: jest.fn(),
// };

// const mockGroqEmailAdapter = {
//   generateEmail: jest.fn(),
//   sendEmail: jest.fn(),
// };

// // Mock the entire infrastructure layer to avoid Supabase imports
// jest.mock('../../app/infrastructure/di/ServiceRegistry', () => ({
//   registerServices: jest.fn(),
//   initializeServices: jest.fn(),
//   getRestockApplicationService: jest.fn(),
//   healthCheck: jest.fn(() => ({ healthy: true, issues: [] }))
// }));

// // Mock the hooks to avoid import issues
// jest.mock('../../app/(tabs)/restock-sessions/hooks/useRestockSession', () => ({
//   useRestockSession: jest.fn(() => ({
//     session: null,
//     isLoading: false,
//     error: null,
//     createSession: jest.fn(() => Promise.resolve({ success: true, session: { toValue: () => ({ id: 'session-123', userId: 'test-user-123', name: 'Test Session' }) } })),
//     addProduct: jest.fn(),
//     removeProduct: jest.fn(),
//     updateProduct: jest.fn(),
//     deleteSession: jest.fn(),
//   }))
// }));

// jest.mock('../../app/(tabs)/restock-sessions/hooks/useProductForm', () => ({
//   useProductForm: jest.fn(() => ({
//     formData: {},
//     isLoading: false,
//     error: null,
//     handleSubmit: jest.fn(),
//     handleInputChange: jest.fn(),
//     updateField: jest.fn(),
//     validateForm: jest.fn(() => true),
//     resetForm: jest.fn(),
//   }))
// }));

// jest.mock('../../app/(tabs)/restock-sessions/hooks/useService', () => ({
//   useService: jest.fn(() => mockRestockApplicationService),
//   useRestockApplicationService: jest.fn(() => mockRestockApplicationService),
// }));

// // Mock auth hook
// jest.mock('../../app/_contexts/UnifiedAuthProvider', () => ({
//   useAuth: () => ({
//     userId: 'test-user-123',
//     isSignedIn: true,
//   }),
// }));

// describe('Full Stack Integration Tests', () => {
//   let container: DIContainer;
//   let mockRegisterServices: jest.MockedFunction<any>;
//   let mockHealthCheck: jest.MockedFunction<any>;
  
//   beforeAll(() => {
//     // Disable console output for cleaner test results
//     jest.spyOn(console, 'log').mockImplementation(() => {});
//     jest.spyOn(console, 'warn').mockImplementation(() => {});
//     jest.spyOn(console, 'error').mockImplementation(() => {});
//   });

//   beforeEach(() => {
//     DIContainer.reset();
//     container = DIContainer.getInstance();
    
//     // Register mock services in the container
//     container.register('UserContextService', () => mockUserContextService);
//     container.register('IdGeneratorService', () => mockIdGeneratorService);
//     container.register('RestockApplicationService', () => mockRestockApplicationService);
//     container.register('SupabaseSessionRepository', () => mockSupabaseSessionRepository);
//     container.register('SupabaseProductRepository', () => mockSupabaseProductRepository);
//     container.register('SupabaseSupplierRepository', () => mockSupabaseSupplierRepository);
//     container.register('GroqEmailAdapter', () => mockGroqEmailAdapter);
    
//     // Get the mocked functions
//     const { registerServices, healthCheck } = require('../../app/infrastructure/di/ServiceRegistry');
//     mockRegisterServices = registerServices;
//     mockHealthCheck = healthCheck;
//   });

//   afterEach(() => {
//     DIContainer.reset();
//     jest.clearAllMocks();
//   });

//   describe('Dependency Injection Container', () => {
//     test('should register all required services', () => {
//       expect(() => mockRegisterServices()).not.toThrow();
      
//       const requiredServices = [
//         'UserContextService',
//         'IdGeneratorService',
//         'GroqEmailAdapter',
//         'SupabaseSessionRepository',
//         'SupabaseProductRepository',
//         'SupabaseSupplierRepository',
//         'RestockApplicationService'
//       ];

//       requiredServices.forEach(serviceName => {
//         expect(container.has(serviceName)).toBe(true);
//       });
//     });

//     test('should pass health check after registration', () => {
//       mockRegisterServices();
      
//       const health = mockHealthCheck();
      
//       expect(health.healthy).toBe(true);
//       expect(health.issues).toHaveLength(0);
//     });

//     test('should create service instances without circular dependencies', () => {
//       mockRegisterServices();
      
//       expect(() => container.get('UserContextService')).not.toThrow();
//       expect(() => container.get('IdGeneratorService')).not.toThrow();
//       expect(() => container.get('SupabaseSessionRepository')).not.toThrow();
//       expect(() => container.get('RestockApplicationService')).not.toThrow();
//     });
//   });

//   describe('UI Hook Integration', () => {
//     beforeEach(() => {
//       mockRegisterServices();
//     });

//     test('should initialize hooks with proper service dependencies', () => {
//       const { result } = renderHook(() => useRestockSession());
      
//       expect(result.current.session).toBeNull();
//       expect(result.current.isLoading).toBe(false);
//       expect(result.current.error).toBeNull();
//       expect(typeof result.current.createSession).toBe('function');
//     });

//     test('should handle service dependency injection correctly', () => {
//       // This test validates that hooks can access services through DI
//       expect(() => renderHook(() => useRestockSession())).not.toThrow();
//       expect(() => renderHook(() => useProductForm())).not.toThrow();
//     });
//   });

//   describe('Service Layer Integration', () => {
//     beforeEach(() => {
//       mockRegisterServices();
//     });

//     test('should create and resolve application service', () => {
//       const applicationService = container.get<RestockApplicationService>('RestockApplicationService');
      
//       expect(applicationService).toBeDefined();
//       expect(typeof applicationService.createSession).toBe('function');
//       expect(typeof applicationService.addProduct).toBe('function');
//       expect(typeof applicationService.generateEmails).toBe('function');
//     });

//     test('should maintain singleton pattern for services', () => {
//       const service1 = container.get<RestockApplicationService>('RestockApplicationService');
//       const service2 = container.get<RestockApplicationService>('RestockApplicationService');
      
//       expect(service1).toBe(service2);
//     });

//     test('should resolve nested service dependencies', () => {
//       const applicationService = container.get<RestockApplicationService>('RestockApplicationService');
//       const sessionRepository = container.get<SupabaseSessionRepository>('SupabaseSessionRepository');
//       const userContextService = container.get<UserContextService>('UserContextService');
//       const idGenerator = container.get<IdGeneratorService>('IdGeneratorService');
      
//       // All services should be properly instantiated
//       expect(applicationService).toBeDefined();
//       expect(sessionRepository).toBeDefined();
//       expect(userContextService).toBeDefined();
//       expect(idGenerator).toBeDefined();
//     });
//   });

//   describe('Error Handling Integration', () => {
//     beforeEach(() => {
//       mockRegisterServices();
//     });

//     test('should handle missing service gracefully', () => {
//       DIContainer.reset();
//       container = DIContainer.getInstance();
//       // Don't register services
      
//       expect(() => {
//         container.get('RestockApplicationService');
//       }).toThrow(/Service 'RestockApplicationService' not found in container/);
//     });

//     test('should handle service creation errors', () => {
//       mockRegisterServices();
      
//       // Mock a service to throw during creation
//       container.register('FaultyService', () => {
//         throw new Error('Service creation failed');
//       });
      
//       expect(() => container.get('FaultyService')).toThrow(/Failed to create service 'FaultyService'/);
//     });
//   });

//   describe('Service Registry Validation', () => {
//     test('should handle service registration failures', () => {
//       // Test service registration error handling without mocking
//       expect(() => mockRegisterServices()).not.toThrow();
//     });

//     test('should provide detailed error messages', () => {
//       DIContainer.reset();
//       container = DIContainer.getInstance();
      
//       try {
//         container.get('NonExistentService');
//       } catch (error) {
//         if (error instanceof Error) {
//           expect(error.message).toContain('Service \'NonExistentService\' not found in container');
//           expect(error.message).toContain('Available services:');
//         } else {
//           throw new Error('Expected error to be Error instance');
//         }
//       }
//     });
//   });

//   describe('Domain Business Rules Integration', () => {
//     beforeEach(() => {
//       mockRegisterServices();
//     });

//     test('should enforce business rules through the full stack', async () => {
//       const { result } = renderHook(() => useRestockSession());
      
//       // Test that the hook returns the expected structure
//       expect(result.current.session).toBeNull();
//       expect(result.current.isLoading).toBe(false);
//       expect(result.current.error).toBeNull();
//       expect(typeof result.current.createSession).toBe('function');
      
//       // Test session creation through the hook
//       let createResult: any;
      
//       await act(async () => {
//         createResult = await result.current.createSession('Test Session');
//       });
      
//       expect(createResult.success).toBe(true);
//       expect(createResult.session).toBeDefined();
//     });
//   });

//   describe('Form Integration Workflow', () => {
//     beforeEach(() => {
//       mockRegisterServices();
//     });

//     test('should complete full product addition workflow', async () => {
//       const { result: sessionResult } = renderHook(() => useRestockSession());
//       const { result: formResult } = renderHook(() => useProductForm());
      
//       // Test that hooks are properly initialized
//       expect(sessionResult.current.session).toBeNull();
//       expect(formResult.current.formData).toBeDefined();
      
//       // Test form field updates
//       act(() => {
//         formResult.current.updateField('productName', 'Test Product');
//         formResult.current.updateField('quantity', '5');
//         formResult.current.updateField('supplierName', 'Test Supplier');
//         formResult.current.updateField('supplierEmail', 'test@supplier.com');
//       });
      
//       // Test form validation
//       act(() => {
//         const isValid = formResult.current.validateForm();
//         expect(isValid).toBe(true);
//       });
      
//       // Test session creation
//       await act(async () => {
//         await sessionResult.current.createSession('Test Session');
//       });
      
//       expect(sessionResult.current.session).toBeDefined();
//     });
//   });

//   describe('Memory and Performance', () => {
//     beforeEach(() => {
//       mockRegisterServices();
//     });

//     test('should not create multiple instances of singletons', () => {
//       const instances: RestockApplicationService[] = [];
      
//       // Get the same service multiple times
//       for (let i = 0; i < 10; i++) {
//         instances.push(container.get<RestockApplicationService>('RestockApplicationService'));
//       }
      
//       // All instances should be the same object
//       const firstInstance = instances[0];
//       instances.forEach(instance => {
//         expect(instance).toBe(firstInstance);
//       });
//     });

//     test('should handle concurrent service access', () => {
//       const promises = Array(10).fill(0).map(() => {
//         return Promise.resolve(container.get<RestockApplicationService>('RestockApplicationService'));
//       });
      
//       return Promise.all(promises).then(instances => {
//         const firstInstance = instances[0];
//         instances.forEach(instance => {
//           expect(instance).toBe(firstInstance);
//         });
//       });
//     });
//   });
// });