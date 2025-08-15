/**
 * INFRASTRUCTURE LAYER TESTS: DI Container
 * 
 * Tests the dependency injection container implementation
 * Critical for validating our clean architecture setup
 */

import { DIContainer } from '../../../app/infrastructure/di/Container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    // Reset singleton before each test
    DIContainer.reset();
    container = DIContainer.getInstance();
  });

  afterEach(() => {
    DIContainer.reset();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance across calls', () => {
      const instance1 = DIContainer.getInstance();
      const instance2 = DIContainer.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should reset singleton correctly', () => {
      const instance1 = DIContainer.getInstance();
      DIContainer.reset();
      const instance2 = DIContainer.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Service Registration', () => {
    test('should register service with factory function', () => {
      const mockService = { name: 'test-service' };
      const factory = jest.fn(() => mockService);
      
      container.register('TestService', factory);
      
      expect(container.has('TestService')).toBe(true);
      expect(container.getRegisteredServices()).toContain('TestService');
    });

    test('should register singleton services by default', () => {
      const mockService = { name: 'test-service' };
      const factory = jest.fn(() => mockService);
      
      container.register('TestService', factory);
      
      const service1 = container.get('TestService');
      const service2 = container.get('TestService');
      
      expect(service1).toBe(service2);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    test('should register transient services when specified', () => {
      const factory = jest.fn(() => ({ name: 'test-service' }));
      
      container.register('TestService', factory, { singleton: false });
      
      const service1 = container.get('TestService');
      const service2 = container.get('TestService');
      
      expect(service1).not.toBe(service2);
      expect(factory).toHaveBeenCalledTimes(2);
    });

    test('should register service instance directly', () => {
      const mockService = { name: 'test-service' };
      
      container.registerInstance('TestService', mockService);
      
      const retrievedService = container.get('TestService');
      expect(retrievedService).toBe(mockService);
    });
  });

  describe('Service Resolution', () => {
    test('should resolve registered service', () => {
      const mockService = { name: 'test-service' };
      container.register('TestService', () => mockService);
      
      const service = container.get('TestService');
      
      expect(service).toBe(mockService);
    });

    test('should throw error for unregistered service', () => {
      expect(() => container.get('NonExistentService')).toThrow(
        /Service 'NonExistentService' not found in container/
      );
    });

    test('should provide available services in error message', () => {
      container.register('ServiceA', () => ({}));
      container.register('ServiceB', () => ({}));
      
      try {
        container.get('NonExistentService');
      } catch (error) {
        expect((error as Error).message).toContain('ServiceA, ServiceB');
      }
    });

    test('should handle factory errors gracefully', () => {
      const factory = jest.fn(() => {
        throw new Error('Factory error');
      });
      
      container.register('FaultyService', factory);
      
      expect(() => container.get('FaultyService')).toThrow(
        /Failed to create service 'FaultyService': Factory error/
      );
    });
  });

  describe('Service Dependencies', () => {
    test('should resolve dependencies correctly', () => {
      const dependencyService = { name: 'dependency' };
      const mainService = { name: 'main', dependency: dependencyService };
      
      container.register('DependencyService', () => dependencyService);
      container.register('MainService', () => {
        const dependency = container.get('DependencyService');
        return { ...mainService, dependency };
      });
      
      const service = container.get('MainService') as any;
      
      expect(service.dependency).toBe(dependencyService);
    });

    test('should handle circular dependencies gracefully', () => {
      container.register('ServiceA', () => {
        const serviceB = container.get('ServiceB');
        return { name: 'A', dependency: serviceB };
      });
      
      container.register('ServiceB', () => {
        const serviceA = container.get('ServiceA');
        return { name: 'B', dependency: serviceA };
      });
      
      // This will cause a stack overflow due to circular dependency
      expect(() => container.get('ServiceA')).toThrow();
    });
  });

  describe('Service Information', () => {
    test('should provide service registration info', () => {
      container.register('TestService', () => ({}), { singleton: true });
      
      const info = container.getServiceInfo('TestService');
      
      expect(info).toEqual({
        registered: true,
        singleton: true,
        hasInstance: false
      });
    });

    test('should show instance info after instantiation', () => {
      container.register('TestService', () => ({}));
      container.get('TestService'); // Instantiate
      
      const info = container.getServiceInfo('TestService');
      
      expect(info!.hasInstance).toBe(true);
    });

    test('should return null for unregistered service info', () => {
      const info = container.getServiceInfo('NonExistentService');
      
      expect(info).toBeNull();
    });
  });

  describe('Container Management', () => {
    test('should clear all services', () => {
      container.register('ServiceA', () => ({}));
      container.register('ServiceB', () => ({}));
      
      expect(container.getRegisteredServices()).toHaveLength(2);
      
      container.clear();
      
      expect(container.getRegisteredServices()).toHaveLength(0);
    });

    test('should list all registered services', () => {
      container.register('ServiceA', () => ({}));
      container.register('ServiceB', () => ({}));
      container.register('ServiceC', () => ({}));
      
      const services = container.getRegisteredServices();
      
      expect(services).toEqual(['ServiceA', 'ServiceB', 'ServiceC']);
    });
  });

  describe('Type Safety', () => {
    interface TestService {
      getName(): string;
    }

    class MockTestService implements TestService {
      getName(): string {
        return 'mock-service';
      }
    }

    test('should maintain type safety with generics', () => {
      container.register<TestService>('TestService', () => new MockTestService());
      
      const service = container.get<TestService>('TestService');
      
      expect(service.getName()).toBe('mock-service');
    });

    test('should work with registerInstance with types', () => {
      const mockService = new MockTestService();
      
      container.registerInstance<TestService>('TestService', mockService);
      
      const service = container.get<TestService>('TestService');
      
      expect(service).toBe(mockService);
    });
  });

  describe('Debug and Logging', () => {
    test('should log service registration', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      container.register('TestService', () => ({}));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DIContainer] Registered service: TestService (singleton: true)'
      );
      
      consoleSpy.mockRestore();
    });

    test('should debug services correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      container.register('ServiceA', () => ({}));
      container.register('ServiceB', () => ({}), { singleton: false });
      
      container.debugServices();
      
      expect(consoleSpy).toHaveBeenCalledWith('[DIContainer] Registered services:');
      expect(consoleSpy).toHaveBeenCalledWith('  - ServiceA: singleton=true, hasInstance=false');
      expect(consoleSpy).toHaveBeenCalledWith('  - ServiceB: singleton=false, hasInstance=false');
      
      consoleSpy.mockRestore();
    });
  });
});