// /**
//  * INFRASTRUCTURE LAYER TESTS: Service Registry
//  * 
//  * Tests the service registration and initialization logic
//  * Validates our dependency graph setup
//  */

// import { DIContainer } from '../../../app/infrastructure/di/Container';
// import { registerServices } from '../../../app/infrastructure/di/ServiceRegistry';

// // Mock all the dependencies
// jest.mock('../../../app/infrastructure/config/SupabaseConfig', () => ({
//   supabaseClient: {
//     from: jest.fn(),
//     auth: jest.fn()
//   }
// }));

// jest.mock('../../../app/infrastructure/index', () => ({
//   SupabaseSessionRepository: jest.fn().mockImplementation(() => ({
//     name: 'SupabaseSessionRepository'
//   })),
//   SupabaseProductRepository: jest.fn().mockImplementation(() => ({
//     name: 'SupabaseProductRepository'
//   })),
//   SupabaseSupplierRepository: jest.fn().mockImplementation(() => ({
//     name: 'SupabaseSupplierRepository'
//   })),
//   UserContextService: jest.fn().mockImplementation(() => ({
//     name: 'UserContextService'
//   })),
//   IdGeneratorService: jest.fn().mockImplementation(() => ({
//     name: 'IdGeneratorService'
//   })),
//   GroqEmailAdapter: jest.fn().mockImplementation(() => ({
//     name: 'GroqEmailAdapter',
//     initialize: jest.fn().mockResolvedValue(undefined)
//   }))
// }));

// jest.mock('../../../app/application/use-cases/RestockApplicationServiceImpl', () => ({
//   RestockApplicationServiceImpl: jest.fn().mockImplementation(() => ({
//     name: 'RestockApplicationServiceImpl'
//   }))
// }));

// describe('ServiceRegistry', () => {
//   let container: DIContainer;

//   beforeEach(() => {
//     DIContainer.reset();
//     container = DIContainer.getInstance();
    
//     // Reset console methods to avoid noise
//     jest.spyOn(console, 'log').mockImplementation();
//     jest.spyOn(console, 'warn').mockImplementation();
//     jest.spyOn(console, 'error').mockImplementation();
//   });

//   afterEach(() => {
//     DIContainer.reset();
//     jest.restoreAllMocks();
//   });

//   describe('Service Registration', () => {
//     test('should register all required services', () => {
//       // Mock Convex client for testing
//       const mockConvexClient = {} as any;
//       registerServices(mockConvexClient);
      
//       const expectedServices = [
//         'IdGeneratorService',
//         'GroqEmailAdapter',
//         'SessionRepository',
//         'ProductRepository',
//         'SupplierRepository',
//         'UserRepository',
//         'EmailRepository'
//       ];

//       expectedServices.forEach(serviceName => {
//         expect(container.has(serviceName)).toBe(true);
//       });
//     });

//     test('should register services in correct dependency order', () => {
//       const mockConvexClient = {} as any;
//       registerServices(mockConvexClient);
      
//       // Infrastructure services should be registered first
//       expect(container.has('IdGeneratorService')).toBe(true);
//       expect(container.has('GroqEmailAdapter')).toBe(true);
      
//       // Repository implementations depend on infrastructure
//       expect(container.has('SessionRepository')).toBe(true);
      
//       // All repositories should be available
//       expect(container.has('ProductRepository')).toBe(true);
//       expect(container.has('SupplierRepository')).toBe(true);
//       expect(container.has('UserRepository')).toBe(true);
//       expect(container.has('EmailRepository')).toBe(true);
//     });

//     test('should handle registration errors gracefully', () => {
//       // Mock the container to throw during registration
//       const mockContainer = {
//         register: jest.fn().mockImplementation(() => {
//           throw new Error('Mock registration error');
//         }),
//         get: jest.fn(),
//         has: jest.fn(),
//         debugServices: jest.fn()
//       };
      
//       // Mock the DIContainer.getInstance to return our mock
//       const originalGetInstance = DIContainer.getInstance;
//       DIContainer.getInstance = jest.fn().mockReturnValue(mockContainer);

//       expect(() => registerServices()).toThrow(/Service registration failed/);
      
//       // Restore the original method
//       DIContainer.getInstance = originalGetInstance;
//     });

//     test('should log successful registration', () => {
//       const consoleSpy = jest.spyOn(console, 'log');
      
//       registerServices();
      
//       expect(consoleSpy).toHaveBeenCalledWith('[ServiceRegistry] Starting service registration...');
//       expect(consoleSpy).toHaveBeenCalledWith('[ServiceRegistry] ✅ All services registered successfully');
//     });
//   });

//   describe('Service Resolution', () => {
//     beforeEach(() => {
//       registerServices();
//     });

//     test('should resolve infrastructure services correctly', () => {
//       const userContextService = container.get('UserContextService');
//       const idGeneratorService = container.get('IdGeneratorService');
      
//       expect(userContextService).toBeDefined();
//       expect(idGeneratorService).toBeDefined();
//     });

//     test('should resolve repository services with dependencies', () => {
//       const sessionRepository = container.get('SupabaseSessionRepository');
//       const productRepository = container.get('SupabaseProductRepository');
//       const supplierRepository = container.get('SupabaseSupplierRepository');
      
//       expect(sessionRepository).toBeDefined();
//       expect(productRepository).toBeDefined();
//       expect(supplierRepository).toBeDefined();
//     });

//     test('should resolve application service with all dependencies', () => {
//       const applicationService = container.get('RestockApplicationService') as any;
      
//       expect(applicationService).toBeDefined();
//       expect(applicationService.name).toBe('RestockApplicationServiceImpl');
//     });

//     test('should maintain singleton instances', () => {
//       const service1 = container.get('RestockApplicationService');
//       const service2 = container.get('RestockApplicationService');
      
//       expect(service1).toBe(service2);
//     });
//   });

//   describe('Service Initialization', () => {
//     beforeEach(() => {
//       registerServices();
//     });

//     test('should initialize email adapter successfully', async () => {
//       const mockEmailAdapter = {
//         initialize: jest.fn().mockResolvedValue(undefined)
//       };
      
//       container.registerInstance('GroqEmailAdapter', mockEmailAdapter);
      
//       await initializeServices();
      
//       expect(mockEmailAdapter.initialize).toHaveBeenCalled();
//     });

//     test('should handle initialization failures gracefully', async () => {
//       const mockEmailAdapter = {
//         initialize: jest.fn().mockRejectedValue(new Error('Initialization failed'))
//       };
      
//       container.registerInstance('GroqEmailAdapter', mockEmailAdapter);
      
//       // Should not throw, but log warning
//       await expect(initializeServices()).resolves.not.toThrow();
      
//       expect(console.warn).toHaveBeenCalledWith(
//         expect.stringContaining('Service initialization completed with warnings'),
//         expect.any(Error)
//       );
//     });

//     test('should log successful initialization', async () => {
//       const consoleSpy = jest.spyOn(console, 'log');
      
//       await initializeServices();
      
//       expect(consoleSpy).toHaveBeenCalledWith('[ServiceRegistry] Starting service initialization...');
//       expect(consoleSpy).toHaveBeenCalledWith('[ServiceRegistry] ✅ All services initialized successfully');
//     });
//   });

//   describe('Health Check', () => {
//     test('should pass health check when all services registered', () => {
//       registerServices();
      
//       const health = healthCheck();
      
//       expect(health.healthy).toBe(true);
//       expect(health.issues).toHaveLength(0);
//     });

//     test('should fail health check when services missing', () => {
//       // Don't register services
      
//       const health = healthCheck();
      
//       expect(health.healthy).toBe(false);
//       expect(health.issues.length).toBeGreaterThan(0);
//       expect(health.issues[0]).toContain('Missing required service');
//     });

//     test('should detect service creation failures', () => {
//       registerServices();
      
//       // Mock application service to throw during creation
//       container.register('RestockApplicationService', () => {
//         throw new Error('Service creation failed');
//       });
      
//       const health = healthCheck();
      
//       expect(health.healthy).toBe(false);
//       expect(health.issues).toContainEqual(
//         expect.stringContaining('Failed to create RestockApplicationService')
//       );
//     });

//     test('should log health check results', () => {
//       registerServices();
      
//       const consoleSpy = jest.spyOn(console, 'log');
      
//       const health = healthCheck();
      
//       expect(consoleSpy).toHaveBeenCalledWith(
//         '[ServiceRegistry] Health check:',
//         { healthy: health.healthy, issues: health.issues }
//       );
//     });
//   });

//   describe('Dependency Graph Validation', () => {
//     test('should create valid dependency chain', () => {
//       registerServices();
      
//       // Test that we can create the full chain without circular dependencies
//       const applicationService = container.get('RestockApplicationService');
      
//       // Should not throw any errors
//       expect(applicationService).toBeDefined();
//     });

//     test('should handle missing dependencies gracefully', () => {
//       // Register only some services to simulate missing dependencies
//       container.register('UserContextService', () => ({}));
      
//       // Try to register a service that depends on missing services
//       container.register('TestService', () => {
//         const missingService = container.get('MissingDependency');
//         return { dependency: missingService };
//       });
      
//       expect(() => container.get('TestService')).toThrow(/not found in container/);
//     });
//   });

//   describe('Error Handling', () => {
//     test('should provide meaningful error messages for missing services', () => {
//       registerServices();
      
//       try {
//         container.get('NonExistentService');
//       } catch (error) {
//         expect((error as Error).message).toContain('Service \'NonExistentService\' not found in container');
//         expect((error as Error).message).toContain('Available services:');
//       }
//     });

//     test('should handle service factory errors', () => {
//       container.register('FaultyService', () => {
//         throw new Error('Service factory error');
//       });
      
//       expect(() => container.get('FaultyService')).toThrow(
//         /Failed to create service 'FaultyService': Service factory error/
//       );
//     });
//   });
// });