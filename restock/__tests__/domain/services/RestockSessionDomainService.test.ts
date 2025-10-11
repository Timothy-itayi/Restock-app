// /**
//  * DOMAIN SERVICE TESTS: RestockSessionDomainService
//  * 
//  * Tests the domain service business logic and validation
//  * Ensures foreign key violations are prevented
//  */

// import { RestockSessionDomainService } from '../../../app/domain/services/RestockSessionDomainService';
// import { RestockSession, SessionStatus } from '../../../app/domain/entities/RestockSession';
// import { Product } from '../../../app/domain/entities/Product';
// import { Supplier } from '../../../app/domain/entities/Supplier';

// describe('RestockSessionDomainService', () => {
//   const mockUserId = 'user-123';
//   const mockSessionId = 'session-123';

//   let mockSession: RestockSession;
//   let mockProduct: Product;
//   let mockSupplier: Supplier;

//   beforeEach(() => {
//     // Create a fresh session for each test
//     mockSession = RestockSession.create({
//       id: mockSessionId,
//       userId: mockUserId,
//     });

//     // Create a fresh product for each test
//     mockProduct = Product.create({
//       id: 'product-123',
//       userId: mockUserId,
//       name: 'Test Product',
//       defaultQuantity: 10,
//     });

//     // Create a fresh supplier for each test
//     mockSupplier = Supplier.create({
//       id: 'supplier-123',
//       userId: mockUserId,
//       name: 'Test Supplier',
//       email: 'test@supplier.com',
//     });
//   });

//   describe('createSession', () => {
//     test('should create a new session with valid parameters', () => {
//       const session = RestockSessionDomainService.createSession({
//         id: 'new-session',
//         userId: mockUserId,
//         name: 'Test Session',
//       });

//       expect(session).toBeInstanceOf(RestockSession);
//       expect(session.toValue().id).toBe('new-session');
//       expect(session.toValue().userId).toBe(mockUserId);
//       expect(session.toValue().status).toBe(SessionStatus.DRAFT);
//     });
//   });

//   describe('addItemToSession', () => {
//     test('should add item to session and create new product/supplier if they don\'t exist', () => {
//       const addItemRequest = {
//         productName: 'New Product',
//         quantity: 5,
//         supplierName: 'New Supplier',
//         supplierEmail: 'new@supplier.com',
//         notes: 'Test notes',
//       };

//       const result = RestockSessionDomainService.addItemToSession(
//         mockSession,
//         addItemRequest,
//         [], // No existing products
//         []  // No existing suppliers
//       );

//       expect(result.session).toBeInstanceOf(RestockSession);
//       expect(result.session.items).toHaveLength(1);
//       expect(result.newProduct).toBeDefined();
//       expect(result.newSupplier).toBeDefined();
//       expect(result.item.productName).toBe('New Product');
//       expect(result.item.quantity).toBe(5);
//       expect(result.item.supplierName).toBe('New Supplier');
//       expect(result.item.supplierEmail).toBe('new@supplier.com');
//       expect(result.item.notes).toBe('Test notes');
//     });

//     test('should reuse existing product and supplier if they exist', () => {
//       const existingProducts = [mockProduct];
//       const existingSuppliers = [mockSupplier];

//       const addItemRequest = {
//         productName: 'Test Product', // Same name as existing product
//         quantity: 3,
//         supplierName: 'Test Supplier', // Same name as existing supplier
//         supplierEmail: 'test@supplier.com', // Same email as existing supplier
//       };

//       const result = RestockSessionDomainService.addItemToSession(
//         mockSession,
//         addItemRequest,
//         existingProducts,
//         existingSuppliers
//       );

//       expect(result.session).toBeInstanceOf(RestockSession);
//       expect(result.session.items).toHaveLength(1);
//       expect(result.newProduct).toBeUndefined(); // Should reuse existing
//       expect(result.newSupplier).toBeUndefined(); // Should reuse existing
//       expect(result.item.productId).toBe(mockProduct.id);
//       expect(result.item.supplierId).toBe(mockSupplier.id);
//     });

//     test('should prevent adding items to completed session', () => {
//       // First add an item, then mark session as completed
//       const sessionWithItem = RestockSessionDomainService.addItemToSession(
//         mockSession,
//         {
//           productName: 'Test Product',
//           quantity: 5,
//           supplierName: 'Test Supplier',
//           supplierEmail: 'test@supplier.com',
//         },
//         [],
//         []
//       ).session;
      
//       const completedSession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );
//       const sentSession = RestockSessionDomainService.markSessionCompleted(
//         completedSession
//       );

//       const addItemRequest = {
//         productName: 'New Product',
//         quantity: 5,
//         supplierName: 'New Supplier',
//         supplierEmail: 'new@supplier.com',
//       };

//       expect(() => {
//         RestockSessionDomainService.addItemToSession(
//           sentSession,
//           addItemRequest,
//           [],
//           []
//         );
//       }).toThrow('Cannot add items to a completed session');
//     });

//     test('should validate quantity is positive', () => {
//       const addItemRequest = {
//         productName: 'New Product',
//         quantity: 0, // Invalid quantity
//         supplierName: 'New Supplier',
//         supplierEmail: 'new@supplier.com',
//       };

//       expect(() => {
//         RestockSessionDomainService.addItemToSession(
//           mockSession,
//           addItemRequest,
//           [],
//           []
//         );
//       }).toThrow('Quantity must be greater than zero');
//     });

//     test('should validate product name is not empty', () => {
//       const addItemRequest = {
//         productName: '', // Invalid product name
//         quantity: 5,
//         supplierName: 'New Supplier',
//         supplierEmail: 'new@supplier.com',
//       };

//       expect(() => {
//         RestockSessionDomainService.addItemToSession(
//           mockSession,
//           addItemRequest,
//           [],
//           []
//         );
//       }).toThrow('Product name cannot be empty');
//     });

//     test('should validate supplier name is not empty', () => {
//       const addItemRequest = {
//         productName: 'New Product',
//         quantity: 5,
//         supplierName: '', // Invalid supplier name
//         supplierEmail: 'new@supplier.com',
//       };

//       expect(() => {
//         RestockSessionDomainService.addItemToSession(
//           mockSession,
//           addItemRequest,
//           [],
//           []
//         );
//       }).toThrow('Supplier name cannot be empty');
//     });

//     test('should validate supplier email format', () => {
//       const addItemRequest = {
//         productName: 'New Product',
//         quantity: 5,
//         supplierName: 'New Supplier',
//         supplierEmail: 'invalid-email', // Invalid email format
//       };

//       expect(() => {
//         RestockSessionDomainService.addItemToSession(
//           mockSession,
//           addItemRequest,
//           [],
//           []
//         );
//       }).toThrow('Supplier email must be valid');
//     });

//     test('should prevent duplicate products in same session', () => {
//       // Add first item
//       const firstItem = {
//         productName: 'Test Product',
//         quantity: 5,
//         supplierName: 'Test Supplier',
//         supplierEmail: 'test@supplier.com',
//       };

//       const sessionWithItem = RestockSessionDomainService.addItemToSession(
//         mockSession,
//         firstItem,
//         [],
//         []
//       ).session;

//       // Try to add same product again
//       const duplicateItem = {
//         productName: 'Test Product', // Same product name
//         quantity: 3,
//         supplierName: 'Different Supplier',
//         supplierEmail: 'different@supplier.com',
//       };

//       expect(() => {
//         RestockSessionDomainService.addItemToSession(
//           sessionWithItem,
//           duplicateItem,
//           [],
//           []
//         );
//       }).toThrow('Product "Test Product" is already in this session');
//     });

//     test('should generate unique IDs for new products and suppliers', () => {
//       const addItemRequest = {
//         productName: 'New Product',
//         quantity: 5,
//         supplierName: 'New Supplier',
//         supplierEmail: 'new@supplier.com',
//       };

//       const result1 = RestockSessionDomainService.addItemToSession(
//         mockSession,
//         addItemRequest,
//         [],
//         []
//       );

//       const result2 = RestockSessionDomainService.addItemToSession(
//         mockSession,
//         {
//           ...addItemRequest,
//           productName: 'Another Product',
//           supplierName: 'Another Supplier',
//           supplierEmail: 'another@supplier.com',
//         },
//         [],
//         []
//       );

//       // IDs should be different
//       expect(result1.item.productId).not.toBe(result2.item.productId);
//       expect(result1.item.supplierId).not.toBe(result2.item.supplierId);

//       // IDs should follow expected format
//       expect(result1.item.productId).toMatch(/^product_\d+_[a-z0-9]+$/);
//       expect(result1.item.supplierId).toMatch(/^supplier_\d+_[a-z0-9]+$/);
//     });
//   });

//   describe('addProductToSession', () => {
//     test('should add existing product to session', () => {
//       const result = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5,
//         'Test notes'
//       );

//       expect(result).toBeInstanceOf(RestockSession);
//       expect(result.items).toHaveLength(1);
//       expect(result.items[0].productId).toBe(mockProduct.id);
//       expect(result.items[0].supplierId).toBe(mockSupplier.id);
//       expect(result.items[0].quantity).toBe(5);
//       expect(result.items[0].notes).toBe('Test notes');
//     });

//     test('should prevent adding items to completed session', () => {
//       // First add an item, then mark session as completed
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );
      
//       const completedSession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );
//       const sentSession = RestockSessionDomainService.markSessionCompleted(
//         completedSession
//       );

//       expect(() => {
//         RestockSessionDomainService.addProductToSession(
//           sentSession,
//           mockProduct,
//           mockSupplier,
//           5
//         );
//       }).toThrow('Cannot add items to a completed session');
//     });

//     test('should validate product belongs to same user', () => {
//       const otherUserProduct = Product.create({
//         id: 'other-product',
//         userId: 'other-user',
//         name: 'Other Product',
//         defaultQuantity: 10,
//       });

//       expect(() => {
//         RestockSessionDomainService.addProductToSession(
//           mockSession,
//           otherUserProduct,
//           mockSupplier,
//           5
//         );
//       }).toThrow('Product does not belong to the current user');
//     });

//     test('should validate supplier belongs to same user', () => {
//       const otherUserSupplier = Supplier.create({
//         id: 'other-supplier',
//         userId: 'other-user',
//         name: 'Other Supplier',
//         email: 'other@supplier.com',
//       });

//       expect(() => {
//         RestockSessionDomainService.addProductToSession(
//           mockSession,
//           mockProduct,
//           otherUserSupplier,
//           5
//         );
//       }).toThrow('Supplier does not belong to the current user');
//     });

//     test('should validate quantity is positive', () => {
//       expect(() => {
//         RestockSessionDomainService.addProductToSession(
//           mockSession,
//           mockProduct,
//           mockSupplier,
//           0
//         );
//       }).toThrow('Quantity must be greater than zero');
//     });

//     test('should prevent duplicate products in same session', () => {
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );

//       expect(() => {
//         RestockSessionDomainService.addProductToSession(
//           sessionWithItem,
//           mockProduct,
//           mockSupplier,
//           3
//         );
//       }).toThrow(`Product "${mockProduct.name}" is already in this session`);
//     });
//   });

//   describe('removeItemFromSession', () => {
//     test('should remove item from session', () => {
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );

//       const result = RestockSessionDomainService.removeItemFromSession(
//         sessionWithItem,
//         mockProduct.id
//       );

//       expect(result.items).toHaveLength(0);
//     });

//     test('should prevent removing items from completed session', () => {
//       // First add an item, then mark session as completed
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );
      
//       const completedSession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );
//       const sentSession = RestockSessionDomainService.markSessionCompleted(
//         completedSession
//       );

//       expect(() => {
//         RestockSessionDomainService.removeItemFromSession(
//           sentSession,
//           'any-product-id'
//         );
//       }).toThrow('Cannot modify a completed session');
//     });
//   });

//   describe('updateItemInSession', () => {
//     test('should update item in session', () => {
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );

//       const result = RestockSessionDomainService.updateItemInSession(
//         sessionWithItem,
//         mockProduct.id,
//         { quantity: 10, notes: 'Updated notes' }
//       );

//       expect(result.items[0].quantity).toBe(10);
//       expect(result.items[0].notes).toBe('Updated notes');
//     });

//     test('should prevent updating items in completed session', () => {
//       // First add an item, then mark session as completed
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );
      
//       const completedSession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );
//       const sentSession = RestockSessionDomainService.markSessionCompleted(
//         completedSession
//       );

//       expect(() => {
//         RestockSessionDomainService.updateItemInSession(
//           sentSession,
//           'any-product-id',
//           { quantity: 10 }
//         );
//       }).toThrow('Cannot modify a completed session');
//     });
//   });

//   describe('markSessionReadyForEmails', () => {
//     test('should mark session ready for emails', () => {
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );

//       const result = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );

//       expect(result.status).toBe(SessionStatus.EMAIL_GENERATED);
//     });

//     test('should prevent marking empty session ready for emails', () => {
//       expect(() => {
//         RestockSessionDomainService.markSessionReadyForEmails(mockSession);
//       }).toThrow('Cannot generate emails for a session with no items');
//     });

//     test('should prevent marking non-draft session ready for emails', () => {
//       // First add an item, then mark session as ready for emails
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );
      
//       const emailGeneratedSession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );

//       expect(() => {
//         RestockSessionDomainService.markSessionReadyForEmails(emailGeneratedSession);
//       }).toThrow('Session is not in draft status');
//     });
//   });

//   describe('markSessionCompleted', () => {
//     test('should mark session as completed', () => {
//       // First add an item, then mark session as ready for emails
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );
      
//       const emailGeneratedSession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );

//       const result = RestockSessionDomainService.markSessionCompleted(
//         emailGeneratedSession
//       );

//       expect(result.status).toBe(SessionStatus.SENT);
//     });

//     test('should prevent marking non-email-generated session as completed', () => {
//       expect(() => {
//         RestockSessionDomainService.markSessionCompleted(mockSession);
//       }).toThrow('Session must be ready for emails before marking as completed');
//     });
//   });

//   describe('generateEmailContent', () => {
//     test('should generate email content for session', () => {
//       const sessionWithItem = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );

//       const emailReadySession = RestockSessionDomainService.markSessionReadyForEmails(
//         sessionWithItem
//       );

//       const emailContent = RestockSessionDomainService.generateEmailContent(
//         emailReadySession,
//         'Test Store',
//         'Test Manager'
//       );

//       expect(emailContent).toHaveLength(1);
//       expect(emailContent[0].supplierName).toBe(mockSupplier.name);
//       expect(emailContent[0].supplierEmail).toBe(mockSupplier.email);
//       expect(emailContent[0].items).toHaveLength(1);
//       expect(emailContent[0].items[0].productName).toBe(mockProduct.name);
//       expect(emailContent[0].items[0].quantity).toBe(5);
//     });

//     test('should prevent generating email content for draft session', () => {
//       expect(() => {
//         RestockSessionDomainService.generateEmailContent(
//           mockSession,
//           'Test Store',
//           'Test Manager'
//         );
//       }).toThrow('Session must be ready for emails before generating content');
//     });

//     test('should group items by supplier correctly', () => {
//       const secondSupplier = Supplier.create({
//         id: 'supplier-456',
//         userId: mockUserId,
//         name: 'Second Supplier',
//         email: 'second@supplier.com',
//       });

//       const secondProduct = Product.create({
//         id: 'product-456',
//         userId: mockUserId,
//         name: 'Second Product',
//         defaultQuantity: 3,
//       });

//       let session = RestockSessionDomainService.addProductToSession(
//         mockSession,
//         mockProduct,
//         mockSupplier,
//         5
//       );

//       session = RestockSessionDomainService.addProductToSession(
//         session,
//         secondProduct,
//         secondSupplier,
//         3
//       );

//       const emailReadySession = RestockSessionDomainService.markSessionReadyForEmails(
//         session
//       );

//       const emailContent = RestockSessionDomainService.generateEmailContent(
//         emailReadySession,
//         'Test Store',
//         'Test Manager'
//       );

//       expect(emailContent).toHaveLength(2);
      
//       // First supplier
//       expect(emailContent[0].supplierName).toBe(mockSupplier.name);
//       expect(emailContent[0].items).toHaveLength(1);
//       expect(emailContent[0].items[0].productName).toBe(mockProduct.name);
      
//       // Second supplier
//       expect(emailContent[1].supplierName).toBe(secondSupplier.name);
//       expect(emailContent[1].items).toHaveLength(1);
//       expect(emailContent[1].items[0].productName).toBe(secondProduct.name);
//     });
//   });
// });
