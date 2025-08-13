/**
 * UI LAYER TESTS: useProductForm Hook
 * 
 * Tests the clean form management hook
 * Validates form state, validation, and UI concerns
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useProductForm } from '../../../app/(tabs)/restock-sessions/hooks/useProductForm';
import { DIContainer } from '../../../app/infrastructure/di/Container';

// Mock application service
const mockApplicationService = {
  createSession: jest.fn(),
  getSession: jest.fn(),
  addProduct: jest.fn(),
};

describe('useProductForm Hook', () => {
  let container: DIContainer;

  beforeEach(() => {
    DIContainer.reset();
    container = DIContainer.getInstance();
    container.registerInstance('RestockApplicationService', mockApplicationService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    DIContainer.reset();
  });

  describe('Hook Initialization', () => {
    test('should initialize with correct default form state', () => {
      const { result } = renderHook(() => useProductForm());
      
      expect(result.current.formData).toEqual({
        productName: '',
        quantity: '1',
        supplierName: '',
        supplierEmail: '',
        notes: ''
      });
      
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.showForm).toBe(false);
      expect(result.current.validationErrors).toEqual({});
    });

    test('should have all required methods', () => {
      const { result } = renderHook(() => useProductForm());
      
      expect(typeof result.current.updateField).toBe('function');
      expect(typeof result.current.validateForm).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
      expect(typeof result.current.showForm).toBe('function');
      expect(typeof result.current.hideForm).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.submitForm).toBe('function');
    });
  });

  describe('Form Field Updates', () => {
    test('should update form fields correctly', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('productName', 'Test Product');
      });
      
      expect(result.current.formData.productName).toBe('Test Product');
    });

    test('should update quantity field', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('quantity', '10');
      });
      
      expect(result.current.formData.quantity).toBe('10');
    });

    test('should update supplier fields', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('supplierName', 'Test Supplier');
        result.current.updateField('supplierEmail', 'test@supplier.com');
      });
      
      expect(result.current.formData.supplierName).toBe('Test Supplier');
      expect(result.current.formData.supplierEmail).toBe('test@supplier.com');
    });

    test('should clear validation errors when field is updated', () => {
      const { result } = renderHook(() => useProductForm());
      
      // First trigger validation error
      act(() => {
        result.current.validateForm();
      });
      
      expect(result.current.validationErrors.productName).toBeDefined();
      
      // Update the field
      act(() => {
        result.current.updateField('productName', 'Valid Name');
      });
      
      expect(result.current.validationErrors.productName).toBeUndefined();
    });

    test('should clear general error when field is updated', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.setError('Some error');
      });
      
      expect(result.current.error).toBe('Some error');
      
      act(() => {
        result.current.updateField('productName', 'Test');
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Form Validation', () => {
    test('should validate required fields', () => {
      const { result } = renderHook(() => useProductForm());
      
      let isValid: boolean;
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.validationErrors.productName).toBe('Product name is required');
      expect(result.current.validationErrors.supplierName).toBe('Supplier name is required');
      expect(result.current.validationErrors.supplierEmail).toBe('Supplier email is required');
    });

    test('should validate product name length', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('productName', 'a'); // Too short
      });
      
      let isValid: boolean;
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.validationErrors.productName).toBe('Product name must be at least 2 characters');
    });

    test('should validate quantity', () => {
      const { result } = renderHook(() => useProductForm());
      
      // Test invalid quantity
      act(() => {
        result.current.updateField('quantity', 'invalid');
      });
      
      let isValid: boolean;
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.validationErrors.quantity).toBe('Quantity is required');
      
      // Test zero quantity
      act(() => {
        result.current.updateField('quantity', '0');
      });
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(result.current.validationErrors.quantity).toBe('Quantity must be greater than 0');
      
      // Test excessive quantity
      act(() => {
        result.current.updateField('quantity', '15000');
      });
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(result.current.validationErrors.quantity).toBe('Quantity cannot exceed 10,000');
    });

    test('should validate email format', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('supplierEmail', 'invalid-email');
      });
      
      let isValid: boolean;
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.validationErrors.supplierEmail).toBe('Please enter a valid email address');
    });

    test('should pass validation with valid data', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('productName', 'Valid Product');
        result.current.updateField('quantity', '5');
        result.current.updateField('supplierName', 'Valid Supplier');
        result.current.updateField('supplierEmail', 'valid@supplier.com');
      });
      
      let isValid: boolean;
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      expect(isValid).toBe(true);
      expect(result.current.validationErrors).toEqual({});
    });
  });

  describe('Form Submission', () => {
    test('should submit valid form successfully', async () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up valid form data
      act(() => {
        result.current.updateField('productName', 'Test Product');
        result.current.updateField('quantity', '5');
        result.current.updateField('supplierName', 'Test Supplier');
        result.current.updateField('supplierEmail', 'test@supplier.com');
        result.current.updateField('notes', 'Test notes');
      });
      
      let submitResult: any;
      
      await act(async () => {
        submitResult = await result.current.submitForm();
      });
      
      expect(submitResult.success).toBe(true);
      expect(submitResult.formData).toEqual({
        productName: 'Test Product',
        quantity: 5,
        supplierName: 'Test Supplier',
        supplierEmail: 'test@supplier.com',
        notes: 'Test notes'
      });
    });

    test('should fail submission with invalid form', async () => {
      const { result } = renderHook(() => useProductForm());
      
      let submitResult: any;
      
      await act(async () => {
        submitResult = await result.current.submitForm();
      });
      
      expect(submitResult.success).toBe(false);
      expect(submitResult.error).toBe('Please fix validation errors');
    });

    test('should call success callback on successful submission', async () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up valid form data
      act(() => {
        result.current.updateField('productName', 'Test Product');
        result.current.updateField('quantity', '5');
        result.current.updateField('supplierName', 'Test Supplier');
        result.current.updateField('supplierEmail', 'test@supplier.com');
      });
      
      const onSuccess = jest.fn();
      
      await act(async () => {
        await result.current.submitForm(onSuccess);
      });
      
      expect(onSuccess).toHaveBeenCalled();
    });

    test('should handle loading states during submission', async () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up valid form data
      act(() => {
        result.current.updateField('productName', 'Test Product');
        result.current.updateField('quantity', '5');
        result.current.updateField('supplierName', 'Test Supplier');
        result.current.updateField('supplierEmail', 'test@supplier.com');
      });
      
      let submitPromise: Promise<any>;
      
      act(() => {
        submitPromise = result.current.submitForm();
      });
      
      expect(result.current.isSubmitting).toBe(true);
      
      await act(async () => {
        await submitPromise;
      });
      
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Form Reset and Management', () => {
    test('should reset form to initial state', () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up some form data
      act(() => {
        result.current.updateField('productName', 'Test Product');
        result.current.setError('Some error');
      });
      
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.formData).toEqual({
        productName: '',
        quantity: '1',
        supplierName: '',
        supplierEmail: '',
        notes: ''
      });
      
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
    });

    test('should show form correctly', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.showForm();
      });
      
      expect(result.current.showForm).toBe(true);
      expect(result.current.error).toBeNull();
    });

    test('should hide form and reset', () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up some form state
      act(() => {
        result.current.updateField('productName', 'Test');
        result.current.showForm();
      });
      
      act(() => {
        result.current.hideForm();
      });
      
      expect(result.current.showForm).toBe(false);
      expect(result.current.formData.productName).toBe(''); // Should reset
    });
  });

  describe('Error Management', () => {
    test('should set and clear errors', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.setError(null);
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Processing', () => {
    test('should trim and process form data correctly', async () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('productName', '  Test Product  ');
        result.current.updateField('supplierName', '  Test Supplier  ');
        result.current.updateField('supplierEmail', '  TEST@SUPPLIER.COM  ');
        result.current.updateField('quantity', '5');
      });
      
      let submitResult: any;
      
      await act(async () => {
        submitResult = await result.current.submitForm();
      });
      
      expect(submitResult.formData.productName).toBe('Test Product');
      expect(submitResult.formData.supplierName).toBe('Test Supplier');
      expect(submitResult.formData.supplierEmail).toBe('test@supplier.com');
      expect(submitResult.formData.quantity).toBe(5);
    });

    test('should handle empty notes correctly', async () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('productName', 'Test Product');
        result.current.updateField('quantity', '5');
        result.current.updateField('supplierName', 'Test Supplier');
        result.current.updateField('supplierEmail', 'test@supplier.com');
        result.current.updateField('notes', '   '); // Empty/whitespace notes
      });
      
      let submitResult: any;
      
      await act(async () => {
        submitResult = await result.current.submitForm();
      });
      
      expect(submitResult.formData.notes).toBeUndefined();
    });
  });
});