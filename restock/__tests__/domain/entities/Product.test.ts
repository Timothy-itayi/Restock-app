// /**
//  * DOMAIN LAYER TESTS: Product Entity
//  * 
//  * Tests the Product entity and its business rules
//  */

// import { Product } from '../../../app/domain/entities/Product';

// describe('Product Entity', () => {
//   const validProductData = {
//     id: 'product-1',
//     name: 'Test Product',
//     defaultQuantity: 10,
//     defaultSupplierId: 'supplier-1',
//     userId: 'user-1',
//     createdAt: new Date()
//   };

//   describe('Creation and Validation', () => {
//     test('should create a valid Product from data', () => {
//       const product = Product.fromValue(validProductData);
      
//       expect(product).toBeInstanceOf(Product);
//       expect(product.toValue()).toEqual(validProductData);
//     });

//     test('should throw error for invalid product name', () => {
//       const invalidData = { ...validProductData, name: '' };
      
//       expect(() => Product.fromValue(invalidData)).toThrow('Product name cannot be empty');
//     });

//     test('should throw error for invalid product ID', () => {
//       const invalidData = { ...validProductData, id: '' };
      
//       expect(() => Product.fromValue(invalidData)).toThrow('Product ID is required');
//     });

//     test('should throw error for invalid user ID', () => {
//       const invalidData = { ...validProductData, userId: '' };
      
//       expect(() => Product.fromValue(invalidData)).toThrow('User ID is required');
//     });

//     test('should validate product name length', () => {
//       const longName = 'a'.repeat(256);
//       const invalidData = { ...validProductData, name: longName };
      
//       expect(() => Product.fromValue(invalidData)).toThrow('Product name cannot exceed 255 characters');
//     });

//     test('should validate default quantity is positive', () => {
//       const invalidData = { ...validProductData, defaultQuantity: 0 };
      
//       expect(() => Product.fromValue(invalidData)).toThrow('Default quantity must be greater than zero');
//     });
//   });

//   describe('Business Rules', () => {
//     test('should correctly identify products with default supplier', () => {
//       const productWithSupplier = Product.fromValue({
//         ...validProductData,
//         defaultSupplierId: 'supplier-1'
//       });
      
//       expect(productWithSupplier.hasDefaultSupplier()).toBe(true);
//     });

//     test('should correctly identify products without default supplier', () => {
//       const productWithoutSupplier = Product.fromValue({
//         ...validProductData,
//         defaultSupplierId: undefined
//       });
      
//       expect(productWithoutSupplier.hasDefaultSupplier()).toBe(false);
//     });

//     test('should match search terms correctly', () => {
//       const product = Product.fromValue(validProductData);
      
//       expect(product.matches('Test')).toBe(true);
//       expect(product.matches('test')).toBe(true);
//       expect(product.matches('Product')).toBe(true);
//       expect(product.matches('Nonexistent')).toBe(false);
//     });
//   });

//   describe('Modification Methods', () => {
//     test('should update product name', () => {
//       const product = Product.fromValue(validProductData);
//       const newName = 'Updated Product Name';
      
//       const updatedProduct = product.updateName(newName);
      
//       expect(updatedProduct.name).toBe(newName);
//       expect(updatedProduct.toValue().name).toBe(newName);
//       expect(product.toValue().name).toBe(validProductData.name); // Original unchanged
//     });

//     test('should reject empty name updates', () => {
//       const product = Product.fromValue(validProductData);
      
//       expect(() => product.updateName('')).toThrow('Product name cannot be empty');
//       expect(() => product.updateName('   ')).toThrow('Product name cannot be empty');
//     });

//     test('should update default quantity', () => {
//       const product = Product.fromValue(validProductData);
//       const newQuantity = 25;
      
//       const updatedProduct = product.updateDefaultQuantity(newQuantity);
      
//       expect(updatedProduct.defaultQuantity).toBe(newQuantity);
//       expect(updatedProduct.toValue().defaultQuantity).toBe(newQuantity);
//       expect(product.toValue().defaultQuantity).toBe(validProductData.defaultQuantity); // Original unchanged
//     });

//     test('should reject invalid quantity updates', () => {
//       const product = Product.fromValue(validProductData);
      
//       expect(() => product.updateDefaultQuantity(0)).toThrow('Default quantity must be greater than zero');
//       expect(() => product.updateDefaultQuantity(-5)).toThrow('Default quantity must be greater than zero');
//     });

//     test('should update default supplier', () => {
//       const product = Product.fromValue(validProductData);
//       const newSupplierId = 'supplier-2';
      
//       const updatedProduct = product.updateDefaultSupplier(newSupplierId);
      
//       expect(updatedProduct.defaultSupplierId).toBe(newSupplierId);
//       expect(updatedProduct.toValue().defaultSupplierId).toBe(newSupplierId);
//       expect(product.toValue().defaultSupplierId).toBe(validProductData.defaultSupplierId); // Original unchanged
//     });

//     test('should remove default supplier', () => {
//       const product = Product.fromValue(validProductData);
      
//       const updatedProduct = product.updateDefaultSupplier(undefined);
      
//       expect(updatedProduct.defaultSupplierId).toBeUndefined();
//       expect(updatedProduct.toValue().defaultSupplierId).toBeUndefined();
//     });
//   });

//   describe('Factory Methods', () => {
//     test('should create product with create factory', () => {
//       const product = Product.create({
//         id: 'new-product',
//         userId: 'user-1',
//         name: 'New Product',
//         defaultQuantity: 15,
//         defaultSupplierId: 'supplier-1'
//       });
      
//       expect(product).toBeInstanceOf(Product);
//       expect(product.id).toBe('new-product');
//       expect(product.name).toBe('New Product');
//       expect(product.defaultQuantity).toBe(15);
//       expect(product.defaultSupplierId).toBe('supplier-1');
//     });

//     test('should create product without default supplier', () => {
//       const product = Product.create({
//         id: 'no-supplier-product',
//         userId: 'user-1',
//         name: 'No Supplier Product',
//         defaultQuantity: 20
//       });
      
//       expect(product).toBeInstanceOf(Product);
//       expect(product.defaultSupplierId).toBeUndefined();
//     });

//     test('should use current date if not provided', () => {
//       const beforeCreation = new Date();
//       const product = Product.create({
//         id: 'date-test-product',
//         userId: 'user-1',
//         name: 'Date Test Product',
//         defaultQuantity: 10
//       });
//       const afterCreation = new Date();
      
//       expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
//       expect(product.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
//     });
//   });

//   describe('Immutability', () => {
//     test('should not mutate original product when updating', () => {
//       const product = Product.fromValue(validProductData);
//       const originalValue = product.toValue();
      
//       product.updateName('New Name');
//       product.updateDefaultQuantity(100);
//       product.updateDefaultSupplier('new-supplier');
      
//       expect(product.toValue()).toEqual(originalValue);
//     });

//     test('should return new instance on modifications', () => {
//       const product = Product.fromValue(validProductData);
      
//       const updatedProduct = product.updateName('New Name');
      
//       expect(updatedProduct).not.toBe(product);
//       expect(updatedProduct.id).toBe(product.id);
//       expect(updatedProduct.name).toBe('New Name');
//     });
//   });

//   describe('Value Object Export', () => {
//     test('should export complete value object', () => {
//       const product = Product.fromValue(validProductData);
//       const exportedValue = product.toValue();
      
//       expect(exportedValue).toEqual(validProductData);
//       expect(exportedValue.id).toBe(validProductData.id);
//       expect(exportedValue.name).toBe(validProductData.name);
//       expect(exportedValue.defaultQuantity).toBe(validProductData.defaultQuantity);
//       expect(exportedValue.defaultSupplierId).toBe(validProductData.defaultSupplierId);
//       expect(exportedValue.userId).toBe(validProductData.userId);
//       expect(exportedValue.createdAt).toBe(validProductData.createdAt);
//     });

//     test('should export value object with undefined supplier', () => {
//       const productWithoutSupplier = Product.fromValue({
//         ...validProductData,
//         defaultSupplierId: undefined
//       });
      
//       const exportedValue = productWithoutSupplier.toValue();
      
//       expect(exportedValue.defaultSupplierId).toBeUndefined();
//     });
//   });

//   describe('Edge Cases', () => {
//     test('should handle products with very long names', () => {
//       const longName = 'a'.repeat(255); // Maximum allowed length
//       const product = Product.create({
//         id: 'long-name-product',
//         userId: 'user-1',
//         name: longName,
//         defaultQuantity: 10
//       });
      
//       expect(product.name).toBe(longName);
//       expect(product.name.length).toBe(255);
//     });

//     test('should handle products with minimum quantity', () => {
//       const product = Product.create({
//         id: 'min-qty-product',
//         userId: 'user-1',
//         name: 'Min Qty Product',
//         defaultQuantity: 1
//       });
      
//       expect(product.defaultQuantity).toBe(1);
//     });
//   });
// });
