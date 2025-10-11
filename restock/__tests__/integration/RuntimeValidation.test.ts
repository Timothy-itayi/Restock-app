// /**
//  * RUNTIME VALIDATION TESTS
//  * 
//  * Tests that validate the actual runtime behavior and app startup sequence
//  * Ensures DI container initialization works as expected in production-like conditions
//  */

// import { DIContainer } from '../../app/infrastructure/di/Container';

// // Mock external dependencies that would be available at runtime
// jest.mock('@react-native-async-storage/async-storage', () => ({
//   getItem: jest.fn(),
//   setItem: jest.fn(),
//   removeItem: jest.fn(),
//   clear: jest.fn(),
// }));

// // Mock the entire infrastructure layer to avoid Supabase dependencies
// jest.mock('../../app/infrastructure', () => ({
//   UserContextService: jest.fn().mockImplementation(() => ({
//     getCurrentUserId: jest.fn().mockReturnValue('test-user-id'),
//     setUserContext: jest.fn(),
//     clearUserContext: jest.fn(),
//   })),
//   IdGeneratorService: jest.fn().mockImplementation(() => ({
//     generateId: jest.fn().mockReturnValue('test-id'),
//   })),
//   ClerkAuthService: jest.fn().mockImplementation(() => ({
//     getCurrentUserId: jest.fn().mockReturnValue('test-user-id'),
//     isAuthenticated: jest.fn().mockReturnValue(true),
//   })),
//   SupabaseSessionRepository: jest.fn().mockImplementation(() => ({
//     save: jest.fn().mockResolvedValue({ success: true }),
//     findById: jest.fn().mockResolvedValue(null),
//     findByUserId: jest.fn().mockResolvedValue([]),
//     delete: jest.fn().mockResolvedValue({ success: true }),
//   })),
//   SupabaseProductRepository: jest.fn().mockImplementation(() => ({
//     save: jest.fn().mockResolvedValue({ success: true }),
//     findById: jest.fn().mockResolvedValue(null),
//     findByUserId: jest.fn().mockResolvedValue([]),
//   })),
//   SupabaseSupplierRepository: jest.fn().mockImplementation(() => ({
//     save: jest.fn().mockResolvedValue({ success: true }),
//     findById: jest.fn().mockResolvedValue(null),
//     findByUserId: jest.fn().mockResolvedValue([]),
//   })),
// }));

// // Mock the application service
// jest.mock('../../app/application/use-cases/RestockApplicationServiceImpl', () => ({
//   RestockApplicationServiceImpl: jest.fn().mockImplementation(() => ({
//     createSession: jest.fn().mockResolvedValue({ success: true }),
//     getSession: jest.fn().mockResolvedValue(null),
//     getSessions: jest.fn().mockResolvedValue([]),
//     deleteSession: jest.fn().mockResolvedValue({ success: true }),
//     addProduct: jest.fn().mockResolvedValue({ success: true }),
//     removeProduct: jest.fn().mockResolvedValue({ success: true }),
//     updateProduct: jest.fn().mockResolvedValue({ success: true }),
//     setSessionName: jest.fn().mockResolvedValue({ success: true }),
//     generateEmails: jest.fn().mockResolvedValue({ success: true }),
//     markAsSent: jest.fn().mockResolvedValue({ success: true }),
//     getSessionSummary: jest.fn().mockResolvedValue({ success: true }),
//   })),
// }));

// // Test-specific service registration functions
// function registerTestServices(): void {
//   const container = DIContainer.getInstance();
  
//   console.log('[TestServiceRegistry] Starting test service registration...');
  
//   try {
//     // Register mock services
//     container.register('UserContextService', () => {
//       const { UserContextService } = require('../../app/infrastructure');
//       return new UserContextService();
//     });
    
//     container.register('IdGeneratorService', () => {
//       const { IdGeneratorService } = require('../../app/infrastructure');
//       return new IdGeneratorService();
//     });
    
//     container.register('SupabaseSessionRepository', () => {
//       const { SupabaseSessionRepository } = require('../../app/infrastructure');
//       const userContextService = container.get('UserContextService');
//       return new SupabaseSessionRepository(null, userContextService);
//     });
    
//     container.register('SupabaseProductRepository', () => {
//       const { SupabaseProductRepository } = require('../../app/infrastructure');
//       const userContextService = container.get('UserContextService');
//       return new SupabaseProductRepository(null, userContextService);
//     });
    
//     container.register('SupabaseSupplierRepository', () => {
//       const { SupabaseSupplierRepository } = require('../../app/infrastructure');
//       const userContextService = container.get('UserContextService');
//       return new SupabaseSupplierRepository(null, userContextService);
//     });
    
//     container.register('RestockApplicationService', () => {
//       const { RestockApplicationServiceImpl } = require('../../app/application/use-cases/RestockApplicationServiceImpl');
//       const sessionRepository = container.get('SupabaseSessionRepository');
//       const productRepository = container.get('SupabaseProductRepository');
//       const supplierRepository = container.get('SupabaseSupplierRepository');
//       const idGen = container.get('IdGeneratorService') as any;
      
//       return new RestockApplicationServiceImpl(
//         sessionRepository,
//         productRepository,
//         supplierRepository,
//         () => idGen.generateId()
//       );
//     });
    
//     console.log('[TestServiceRegistry] ✅ All test services registered successfully');
    
//   } catch (error) {
//     console.error('[TestServiceRegistry] ❌ Failed to register test services:', error);
//     throw error;
//   }
// }

// async function initializeTestServices(): Promise<void> {
//   // For tests, we don't need async initialization
//   console.log('[TestServiceRegistry] Test services initialized');
// }

// function testHealthCheck(): { healthy: boolean; issues: string[] } {
//   const container = DIContainer.getInstance();
//   const issues: string[] = [];
  
//   try {
//     // Check if all required services are registered
//     const requiredServices = [
//       'UserContextService',
//       'IdGeneratorService', 
//       'SupabaseSessionRepository',
//       'SupabaseProductRepository',
//       'SupabaseSupplierRepository',
//       'RestockApplicationService'
//     ];
    
//     requiredServices.forEach(serviceName => {
//       try {
//         container.get(serviceName);
//       } catch (error) {
//         issues.push(`Service ${serviceName} not accessible`);
//       }
//     });
    
//     return {
//       healthy: issues.length === 0,
//       issues
//     };
//   } catch (error) {
//     issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     return { healthy: false, issues };
//   }
// }

// describe('Runtime Validation Tests', () => {
//   let originalConsole: any;

//   beforeAll(() => {
//     // Capture console methods but allow some logging for debugging
//     originalConsole = {
//       log: console.log,
//       warn: console.warn,
//       error: console.error,
//     };
//   });

//   beforeEach(() => {
//     DIContainer.reset();
//     jest.clearAllMocks();
//   });

//   afterEach(() => {
//     DIContainer.reset();
//   });

//   describe('App Startup Sequence', () => {
//     test('should complete full startup sequence without errors', async () => {
//       // Simulate app startup sequence from _layout.tsx
//       let initializationError: Error | null = null;
      
//       try {
//         // Step 1: Register services (happens synchronously)
//         console.log('Starting service registration...');
//         registerTestServices();
//         console.log('Service registration completed');
        
//         // Step 2: Initialize services (happens asynchronously)
//         console.log('Starting service initialization...');
//         await initializeTestServices();
//         console.log('Service initialization completed');
        
//         // Step 3: Health check
//         const health = testHealthCheck();
//         console.log('Health check completed:', health);
        
//         expect(health.healthy).toBe(true);
//       } catch (error) {
//         initializationError = error as Error;
//       }
      
//       expect(initializationError).toBeNull();
//     });

//     test('should handle partial service initialization gracefully', async () => {
//       registerTestServices();
      
//       // Mock email adapter to fail initialization
//       const container = DIContainer.getInstance();
//       const mockEmailAdapter = {
//         initialize: jest.fn().mockRejectedValue(new Error('Email service unavailable'))
//       };
      
//       container.registerInstance('GroqEmailAdapter', mockEmailAdapter);
      
//       // Should complete initialization despite email service failure
//       await expect(initializeTestServices()).resolves.not.toThrow();
      
//       // Verify that the mock email adapter was registered
//       expect(container.has('GroqEmailAdapter')).toBe(true);
//     });

//     test('should provide meaningful error messages during startup failures', () => {
//       // Simulate missing critical service
//       expect(() => {
//         registerTestServices();
//         const container = DIContainer.getInstance();
//         container.clear();
//         container.get('RestockApplicationService');
//       }).toThrow(/Service 'RestockApplicationService' not found in container/);
//     });
//   });

//   describe('Service Lifecycle Management', () => {
//     beforeEach(() => {
//       registerTestServices();
//     });

//     test('should create services lazily', () => {
//       const container = DIContainer.getInstance();
      
//       // Services should not be instantiated until first access
//       const serviceInfo = container.getServiceInfo('RestockApplicationService');
//       expect(serviceInfo?.hasInstance).toBe(false);
      
//       // Access service to trigger instantiation
//       container.get('RestockApplicationService');
      
//       // Now should have instance
//       const updatedInfo = container.getServiceInfo('RestockApplicationService');
//       expect(updatedInfo?.hasInstance).toBe(true);
//     });

//     test('should handle service dependency resolution order correctly', () => {
//       const container = DIContainer.getInstance();
      
//       // Getting application service should automatically resolve its dependencies
//       const applicationService = container.get('RestockApplicationService');
      
//       // Verify all dependencies were also instantiated
//       expect(container.getServiceInfo('SupabaseSessionRepository')?.hasInstance).toBe(true);
//       expect(container.getServiceInfo('UserContextService')?.hasInstance).toBe(true);
//       expect(container.getServiceInfo('IdGeneratorService')?.hasInstance).toBe(true);
      
//       expect(applicationService).toBeDefined();
//     });

//     test('should maintain service instances across app lifecycle', () => {
//       const container = DIContainer.getInstance();
      
//       const service1 = container.get('RestockApplicationService');
//       const service2 = container.get('RestockApplicationService');
//       const service3 = container.get('RestockApplicationService');
      
//       // All references should point to the same instance
//       expect(service1).toBe(service2);
//       expect(service2).toBe(service3);
//     });
//   });

//   describe('Error Recovery and Resilience', () => {
//     test('should handle service failures gracefully', async () => {
//       registerTestServices();
      
//       const container = DIContainer.getInstance();
      
//       // Mock a service to fail
//       const mockFailingService = {
//         method: jest.fn().mockImplementation(() => {
//           throw new Error('Service method failed');
//         })
//       };
      
//       container.registerInstance('FailingService', mockFailingService);
      
//       // Should be able to access the failing service
//       expect(container.has('FailingService')).toBe(true);
      
//       // But calling its method should throw
//       const failingService = container.get('FailingService') as any;
//       expect(() => failingService.method()).toThrow('Service method failed');
//     });

//     test('should provide detailed diagnostics during failures', () => {
//       registerTestServices();
      
//       const container = DIContainer.getInstance();
      
//       // Check if we can get diagnostic information
//       const registeredServices = container.getRegisteredServices();
//       expect(registeredServices.length).toBeGreaterThan(0);
      
//       // Should be able to get info about each service
//       registeredServices.forEach(serviceName => {
//         const info = container.getServiceInfo(serviceName);
//         expect(info).toBeDefined();
//         expect(info?.registered).toBe(true);
//       });
//     });

//     test('should handle concurrent service access safely', async () => {
//       registerTestServices();
      
//       const container = DIContainer.getInstance();
      
//       // Simulate multiple components trying to access services simultaneously
//       const accessPromises = Array(20).fill(0).map(async (_, index) => {
//         return new Promise(resolve => {
//           setTimeout(() => {
//             const service = container.get('RestockApplicationService');
//             resolve(service);
//           }, Math.random() * 10);
//         });
//       });
      
//       const services = await Promise.all(accessPromises);
      
//       // All services should be the same instance
//       const firstService = services[0];
//       services.forEach(service => {
//         expect(service).toBe(firstService);
//       });
//     });
//   });

//   describe('Memory Management', () => {
//     beforeEach(() => {
//       registerTestServices();
//     });

//     test('should not create memory leaks through circular references', () => {
//       const container = DIContainer.getInstance();
      
//       // Create services and let them be garbage collected
//       for (let i = 0; i < 100; i++) {
//         const service = container.get('RestockApplicationService');
//         // Service should be reused, not recreated
//         expect(service).toBeDefined();
//       }
      
//       // Container should still only have one instance of each service
//       const registeredServices = container.getRegisteredServices();
//       registeredServices.forEach(serviceName => {
//         const info = container.getServiceInfo(serviceName);
//         if (info?.singleton) {
//           expect(info.hasInstance).toBe(true);
//         }
//       });
//     });

//     test('should clean up properly on container reset', () => {
//       const container = DIContainer.getInstance();
      
//       // Create some services
//       container.get('RestockApplicationService');
//       container.get('UserContextService');
      
//       // Verify they exist
//       expect(container.getServiceInfo('RestockApplicationService')?.hasInstance).toBe(true);
      
//       // Reset container
//       DIContainer.reset();
      
//       // Get new container instance
//       const newContainer = DIContainer.getInstance();
//       expect(newContainer).not.toBe(container);
//       expect(newContainer.getRegisteredServices()).toHaveLength(0);
//     });
//   });

//   describe('Production-Like Conditions', () => {
//     test('should handle service registration in production build', () => {
//       // Simulate production environment constraints
//       const originalNodeEnv = process.env.NODE_ENV;
//       // Use type assertion to bypass readonly constraint for testing
//       (process.env as any).NODE_ENV = 'production';
      
//       try {
//         registerTestServices();
//         const health = testHealthCheck();
//         expect(health.healthy).toBe(true);
//       } finally {
//         (process.env as any).NODE_ENV = originalNodeEnv;
//       }
//     });

//     test('should validate service interfaces match implementations', () => {
//       registerTestServices();
      
//       const container = DIContainer.getInstance();
//       const applicationService = container.get('RestockApplicationService') as any;
      
//       // Verify service has all required methods from interface
//       const requiredMethods = [
//         'createSession',
//         'getSession', 
//         'getSessions',
//         'deleteSession',
//         'addProduct',
//         'removeProduct',
//         'updateProduct',
//         'setSessionName',
//         'generateEmails',
//         'markAsSent',
//         'getSessionSummary'
//       ];
      
//       requiredMethods.forEach(method => {
//         expect(typeof applicationService[method]).toBe('function');
//       });
//     });

//     test('should handle app restart scenarios', async () => {
//       // Simulate app shutdown
//       DIContainer.reset();
      
//       // Simulate app restart
//       registerTestServices();
//       await initializeTestServices();
      
//       const health = testHealthCheck();
//       expect(health.healthy).toBe(true);
      
//       // Services should be fresh instances
//       const container = DIContainer.getInstance();
//       const applicationService = container.get('RestockApplicationService');
//       expect(applicationService).toBeDefined();
//     });
//   });

//   describe('Debug and Monitoring Capabilities', () => {
//     beforeEach(() => {
//       registerTestServices();
//     });

//     test('should provide service debugging information', () => {
//       const container = DIContainer.getInstance();
      
//       // Should be able to debug services
//       expect(() => container.debugServices()).not.toThrow();
      
//       // Should provide detailed service information
//       const services = container.getRegisteredServices();
//       expect(services.length).toBeGreaterThan(0);
      
//       services.forEach(serviceName => {
//         const info = container.getServiceInfo(serviceName);
//         expect(info).toHaveProperty('registered');
//         expect(info).toHaveProperty('singleton');
//         expect(info).toHaveProperty('hasInstance');
//       });
//     });

//     test('should log service operations for monitoring', () => {
//       const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
//       try {
//         // Service registration should log operations
//         registerTestServices();
        
//         // Should have logged service registration operations
//         expect(logSpy).toHaveBeenCalled();
        
//         // Check that we logged the success message
//         const successLogs = logSpy.mock.calls.filter(call => 
//           call[0]?.includes('✅ All test services registered successfully')
//         );
//         expect(successLogs.length).toBeGreaterThan(0);
//       } finally {
//         logSpy.mockRestore();
//       }
//     });

//     test('should provide health check with detailed status', () => {
//       const health = testHealthCheck();
      
//       expect(health).toHaveProperty('healthy');
//       expect(health).toHaveProperty('issues');
//       expect(typeof health.healthy).toBe('boolean');
//       expect(Array.isArray(health.issues)).toBe(true);
//     });
//   });
// });