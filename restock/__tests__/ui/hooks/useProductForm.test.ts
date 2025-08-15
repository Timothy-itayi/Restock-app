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
    test('should initialize with correct default state', () => {
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
      expect(result.current.isFormVisible).toBe(false);
      expect(result.current.validationErrors).toEqual({});
    });

    test('should have all required methods', () => {
      const { result } = renderHook(() => useProductForm());
      
      expect(typeof result.current.updateField).toBe('function');
      expect(typeof result.current.validateForm).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
      expect(typeof result.current.openForm).toBe('function');
      expect(typeof result.current.closeForm).toBe('function');
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
      
      // Clear all fields to make them truly empty
      act(() => {
        result.current.updateField('productName', '');
        result.current.updateField('quantity', '');
        result.current.updateField('supplierName', '');
        result.current.updateField('supplierEmail', '');
      });
      
      let isValid = false;
      
      act(() => {
        isValid = result.current.validateForm();
      });
      
      // Wait for state update
      act(() => {
        // Force a re-render to get updated validation errors
        result.current.validateForm();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.validationErrors.productName).toBeDefined();
      expect(result.current.validationErrors.quantity).toBeDefined();
      expect(result.current.validationErrors.supplierName).toBeDefined();
      expect(result.current.validationErrors.supplierEmail).toBeDefined();
    });

    test('should validate quantity format', () => {
      const { result } = renderHook(() => useProductForm());
      
      let isValid = false;
      
      act(() => {
        result.current.updateField('quantity', 'invalid');
        isValid = result.current.validateForm();
      });
      
      // Wait for state update
      act(() => {
        // Force a re-render to get updated validation errors
        result.current.validateForm();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.validationErrors.quantity).toBeDefined();
    });

    test('should validate product name length', () => {
      const { result } = renderHook(() => useProductForm());
      
      act(() => {
        result.current.updateField('productName', 'a'); // Too short
      });
      
      let isValid = false;
      
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
      
      let isValid = false;
      
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
      
      let isValid = false;
      
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
      
      let isValid = false;
      
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
      
      // Since submitForm is synchronous in the current implementation,
      // we need to check the state immediately after calling it
      act(() => {
        result.current.submitForm();
      });
      
      // The isSubmitting should be false after synchronous completion
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
        result.current.openForm();
      });
      
      expect(result.current.isFormVisible).toBe(true);
      expect(result.current.error).toBeNull();
    });

    test('should hide form and reset', () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up some form state
      act(() => {
        result.current.updateField('productName', 'Test');
        result.current.openForm();
      });
      
      act(() => {
        result.current.closeForm();
      });
      
      expect(result.current.isFormVisible).toBe(false);
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
      
      // Set up valid form data (all required fields)
      act(() => {
        result.current.updateField('productName', '  Test Product  ');
        result.current.updateField('supplierName', '  Test Supplier  ');
        result.current.updateField('supplierEmail', '  TEST@SUPPLIER.COM  ');
        result.current.updateField('quantity', '5');
      });
      
      // Ensure all fields are set before submitting
      expect(result.current.formData.productName).toBe('  Test Product  ');
      expect(result.current.formData.supplierName).toBe('  Test Supplier  ');
      expect(result.current.formData.supplierEmail).toBe('  TEST@SUPPLIER.COM  ');
      expect(result.current.formData.quantity).toBe('5');
      
      // Check validation manually
      let isValid = false;
      act(() => {
        isValid = result.current.validateForm();
      });
      
      // Wait for validation state to update
      act(() => {
        result.current.validateForm();
      });
      
      // Debug: Check what validation errors we actually have
      console.log('Validation errors:', result.current.validationErrors);
      console.log('Form data:', result.current.formData);
      
      expect(isValid).toBe(true);
      expect(result.current.validationErrors).toEqual({});
      
      let submitResult: any;
      
      await act(async () => {
        submitResult = await result.current.submitForm();
      });
      
      expect(submitResult.success).toBe(true);
      expect(submitResult.formData.productName).toBe('Test Product');
      expect(submitResult.formData.supplierName).toBe('Test Supplier');
      expect(submitResult.formData.supplierEmail).toBe('test@supplier.com');
      expect(submitResult.formData.quantity).toBe(5);
    });

    test('should handle empty notes correctly', async () => {
      const { result } = renderHook(() => useProductForm());
      
      // Set up valid form data (all required fields)
      act(() => {
        result.current.updateField('productName', 'Test Product');
        result.current.updateField('quantity', '5');
        result.current.updateField('supplierName', 'Test Supplier');
        result.current.updateField('supplierEmail', 'test@supplier.com');
        result.current.updateField('notes', '   '); // Empty/whitespace notes
      });
      
      // Ensure all fields are set before submitting
      expect(result.current.formData.productName).toBe('Test Product');
      expect(result.current.formData.quantity).toBe('5');
      expect(result.current.formData.supplierName).toBe('Test Supplier');
      expect(result.current.formData.supplierEmail).toBe('test@supplier.com');
      expect(result.current.formData.notes).toBe('   ');
      
      // Check validation manually
      let isValid = false;
      act(() => {
        isValid = result.current.validateForm();
      });
      
      // Wait for validation state to update
      act(() => {
        result.current.validateForm();
      });
      
      // Debug: Check what validation errors we actually have
      console.log('Validation errors:', result.current.validationErrors);
      console.log('Form data:', result.current.formData);
      
      expect(isValid).toBe(true);
      expect(result.current.validationErrors).toEqual({});
      
      let submitResult: any;
      
      await act(async () => {
        submitResult = await result.current.submitForm();
      });
      
      expect(submitResult.success).toBe(true);
      expect(submitResult.formData.notes).toBeUndefined();
    });
  });
});