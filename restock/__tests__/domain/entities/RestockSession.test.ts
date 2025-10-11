// /**
//  * DOMAIN LAYER TESTS: RestockSession Entity
//  * 
//  * Tests the core business entity and its business rules
//  * This validates our domain model integrity
//  */

// import { RestockSession, SessionStatus } from '../../../app/domain/entities/RestockSession';

// describe('RestockSession Entity', () => {
//   const validSessionData = {
//     id: 'session-1',
//     userId: 'user-1',
//     name: 'Test Session',
//     status: SessionStatus.DRAFT,
//     items: [],
//     createdAt: new Date(),
//     updatedAt: new Date()
//   };

//   describe('Creation and Validation', () => {
//     test('should create a valid RestockSession from data', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       expect(session).toBeInstanceOf(RestockSession);
//       expect(session.toValue()).toEqual(validSessionData);
//     });

//     test('should generate default name if not provided', () => {
//       const session = RestockSession.create({
//         id: 'session-2',
//         userId: 'user-1'
//       });
//       const value = session.toValue();
      
//       expect(value.name).toMatch(/^Restock Session \d{4}-\d{2}-\d{2}/);
//     });

//     test('should throw error for invalid userId', () => {
//       const invalidData = { ...validSessionData, userId: '' };
      
//       expect(() => RestockSession.fromValue(invalidData)).toThrow('User ID is required');
//     });

//     test('should throw error for invalid session ID', () => {
//       const invalidData = { ...validSessionData, id: '' };
      
//       expect(() => RestockSession.fromValue(invalidData)).toThrow('Session ID is required');
//     });

//     test('should validate session name length', () => {
//       const longName = 'a'.repeat(256);
//       const invalidData = { ...validSessionData, name: longName };
      
//       expect(() => RestockSession.fromValue(invalidData)).toThrow('Session name cannot exceed 255 characters');
//     });
//   });

//   describe('Business Rules', () => {
//     test('should correctly identify empty session', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       expect(session.isEmpty()).toBe(true);
//       expect(session.getTotalItems()).toBe(0);
//       expect(session.getUniqueSupplierCount()).toBe(0);
//     });

//     test('should calculate session metrics correctly with items', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com',
//             notes: 'Test notes'
//           },
//           {
//             productId: 'product-2',
//             productName: 'Product B',
//             quantity: 3,
//             supplierId: 'supplier-2',
//             supplierName: 'Supplier B',
//             supplierEmail: 'supplier-b@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
      
//       expect(session.isEmpty()).toBe(false);
//       expect(session.getTotalItems()).toBe(8); // 5 + 3
//       expect(session.getUniqueSupplierCount()).toBe(2);
//       expect(session.getItemsBySupplier('supplier-1')).toHaveLength(1);
//     });

//     test('should enforce status transition rules', () => {
//       const draftSession = RestockSession.fromValue(validSessionData);
      
//       expect(draftSession.canGenerateEmails()).toBe(false); // Empty session
//       expect(draftSession.canSendEmails()).toBe(false); // Must go through EMAIL_GENERATED first
//     });

//     test('should allow status transitions for valid sessions', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
      
//       expect(session.canGenerateEmails()).toBe(true);
//       expect(session.canSendEmails()).toBe(false); // Must go through EMAIL_GENERATED first
//     });
//   });

//   describe('Item Management', () => {
//     test('should add items to session', () => {
//       const session = RestockSession.fromValue(validSessionData);
//       const newItem = {
//         productId: 'product-1',
//         productName: 'Product A',
//         quantity: 5,
//         supplierId: 'supplier-1',
//         supplierName: 'Supplier A',
//         supplierEmail: 'supplier-a@test.com'
//       };

//       const updatedSession = session.addItem(newItem);
      
//       expect(updatedSession.getTotalItems()).toBe(5);
//       expect(updatedSession.hasProduct('product-1')).toBe(true);
//       expect(updatedSession.getItemsBySupplier('supplier-1')).toHaveLength(1);
//     });

//     test('should reject duplicate products', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
//       const duplicateItem = {
//         productId: 'product-1',
//         productName: 'Product A',
//         quantity: 3,
//         supplierId: 'supplier-1',
//         supplierName: 'Supplier A',
//         supplierEmail: 'supplier-a@test.com'
//       };

//       expect(() => session.addItem(duplicateItem)).toThrow('Product Product A is already in this session');
//     });

//     test('should reject items with invalid quantity', () => {
//       const session = RestockSession.fromValue(validSessionData);
//       const invalidItem = {
//         productId: 'product-1',
//         productName: 'Product A',
//         quantity: 0,
//         supplierId: 'supplier-1',
//         supplierName: 'Supplier A',
//         supplierEmail: 'supplier-a@test.com'
//       };

//       expect(() => session.addItem(invalidItem)).toThrow('Quantity must be greater than zero');
//     });

//     test('should remove items from session', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
//       const updatedSession = session.removeItem('product-1');
      
//       expect(updatedSession.getTotalItems()).toBe(0);
//       expect(updatedSession.hasProduct('product-1')).toBe(false);
//     });

//     test('should update item quantity', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
//       const updatedSession = session.updateItem('product-1', { quantity: 10 });
      
//       expect(updatedSession.getTotalItems()).toBe(10);
//       expect(updatedSession.getItemsBySupplier('supplier-1')[0].quantity).toBe(10);
//     });
//   });

//   describe('Session Name Management', () => {
//     test('should set session name', () => {
//       const session = RestockSession.fromValue(validSessionData);
//       const newName = 'Updated Session Name';
      
//       const updatedSession = session.setName(newName);
      
//       expect(updatedSession.name).toBe(newName);
//       expect(updatedSession.toValue().name).toBe(newName);
//       expect(session.name).toBe(validSessionData.name); // Original unchanged
//     });

//     test('should reject empty session names', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       expect(() => session.setName('')).toThrow('Session name cannot be empty');
//       expect(() => session.setName('   ')).toThrow('Session name cannot be empty');
//     });

//     test('should trim session names', () => {
//       const session = RestockSession.fromValue(validSessionData);
//       const trimmedName = '  Trimmed Name  ';
      
//       const updatedSession = session.setName(trimmedName);
      
//       expect(updatedSession.name).toBe('Trimmed Name');
//     });
//   });

//   describe('Status Transitions', () => {
//     test('should generate emails from draft with items', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
//       const emailGeneratedSession = session.generateEmails();
      
//       expect(emailGeneratedSession.status).toBe(SessionStatus.EMAIL_GENERATED);
//       expect(emailGeneratedSession.toValue().status).toBe(SessionStatus.EMAIL_GENERATED);
//     });

//     test('should reject email generation from empty session', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       expect(() => session.generateEmails()).toThrow('Cannot generate emails for empty session');
//     });

//     test('should reject email generation from non-draft status', () => {
//       const emailGeneratedSession = {
//         ...validSessionData,
//         status: SessionStatus.EMAIL_GENERATED,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(emailGeneratedSession);
      
//       expect(() => session.generateEmails()).toThrow('Emails can only be generated from draft sessions');
//     });

//     test('should mark session as sent', () => {
//       const emailGeneratedSession = {
//         ...validSessionData,
//         status: SessionStatus.EMAIL_GENERATED,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(emailGeneratedSession);
//       const sentSession = session.markAsSent();
      
//       expect(sentSession.status).toBe(SessionStatus.SENT);
//       expect(sentSession.toValue().status).toBe(SessionStatus.SENT);
//     });

//     test('should reject marking as sent from non-email-generated status', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       expect(() => session.markAsSent()).toThrow('Can only send emails that have been generated');
//     });
//   });

//   describe('Query Methods', () => {
//     test('should check if product exists', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
      
//       expect(session.hasProduct('product-1')).toBe(true);
//       expect(session.hasProduct('product-2')).toBe(false);
//     });

//     test('should calculate total items', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           },
//           {
//             productId: 'product-2',
//             productName: 'Product B',
//             quantity: 3,
//             supplierId: 'supplier-2',
//             supplierName: 'Supplier B',
//             supplierEmail: 'supplier-b@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
      
//       expect(session.getTotalItems()).toBe(8);
//     });

//     test('should get unique suppliers', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           },
//           {
//             productId: 'product-2',
//             productName: 'Product B',
//             quantity: 3,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
      
//       expect(session.getUniqueSupplierCount()).toBe(1);
//     });

//     test('should get items by supplier', () => {
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           },
//           {
//             productId: 'product-2',
//             productName: 'Product B',
//             quantity: 3,
//             supplierId: 'supplier-2',
//             supplierName: 'Supplier B',
//             supplierEmail: 'supplier-b@test.com'
//           }
//         ]
//       };

//       const session = RestockSession.fromValue(sessionWithItems);
      
//       const supplier1Items = session.getItemsBySupplier('supplier-1');
//       expect(supplier1Items).toHaveLength(1);
//       expect(supplier1Items[0].productId).toBe('product-1');
      
//       const supplier2Items = session.getItemsBySupplier('supplier-2');
//       expect(supplier2Items).toHaveLength(1);
//       expect(supplier2Items[0].productId).toBe('product-2');
//     });
//   });

//   describe('State Checks', () => {
//     test('should check if can add items', () => {
//       const draftSession = RestockSession.fromValue(validSessionData);
//       const emailGeneratedSession = {
//         ...validSessionData,
//         status: SessionStatus.EMAIL_GENERATED
//       };
//       const sentSession = {
//         ...validSessionData,
//         status: SessionStatus.SENT
//       };

//       expect(RestockSession.fromValue(draftSession).canAddItems()).toBe(true);
//       expect(RestockSession.fromValue(emailGeneratedSession).canAddItems()).toBe(false);
//       expect(RestockSession.fromValue(sentSession).canAddItems()).toBe(false);
//     });

//     test('should check if can generate emails', () => {
//       const emptySession = RestockSession.fromValue(validSessionData);
//       const sessionWithItems = {
//         ...validSessionData,
//         items: [
//           {
//             productId: 'product-1',
//             productName: 'Product A',
//             quantity: 5,
//             supplierId: 'supplier-1',
//             supplierName: 'Supplier A',
//             supplierEmail: 'supplier-a@test.com'
//           }
//         ]
//       };

//       expect(emptySession.canGenerateEmails()).toBe(false);
//       expect(RestockSession.fromValue(sessionWithItems).canGenerateEmails()).toBe(true);
//     });

//     test('should check if can send emails', () => {
//       const draftSession = RestockSession.fromValue(validSessionData);
//       const emailGeneratedSession = {
//         ...validSessionData,
//         status: SessionStatus.EMAIL_GENERATED
//       };

//       expect(draftSession.canSendEmails()).toBe(false);
//       expect(RestockSession.fromValue(emailGeneratedSession).canSendEmails()).toBe(true);
//     });

//     test('should check session state', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       expect(session.isDraft()).toBe(true);
//       expect(session.isCompleted()).toBe(false);
//     });
//   });

//   describe('Immutability', () => {
//     test('should not mutate original session when adding items', () => {
//       const session = RestockSession.fromValue(validSessionData);
//       const originalValue = session.toValue();
      
//       session.addItem({
//         productId: 'product-1',
//         productName: 'Product A',
//         quantity: 5,
//         supplierId: 'supplier-1',
//         supplierName: 'Supplier A',
//         supplierEmail: 'supplier-a@test.com'
//       });
      
//       expect(session.toValue()).toEqual(originalValue);
//     });

//     test('should return new instance on modifications', () => {
//       const session = RestockSession.fromValue(validSessionData);
      
//       const updatedSession = session.addItem({
//         productId: 'product-1',
//         productName: 'Product A',
//         quantity: 5,
//         supplierId: 'supplier-1',
//         supplierName: 'Supplier A',
//         supplierEmail: 'supplier-a@test.com'
//       });
      
//       expect(updatedSession).not.toBe(session);
//       expect(updatedSession.id).toBe(session.id);
//       expect(updatedSession.getTotalItems()).toBe(5);
//     });
//   });

//   describe('Value Object Export', () => {
//     test('should export complete value object', () => {
//       const session = RestockSession.fromValue(validSessionData);
//       const exportedValue = session.toValue();
      
//       expect(exportedValue).toEqual(validSessionData);
//       expect(exportedValue.id).toBe(validSessionData.id);
//       expect(exportedValue.userId).toBe(validSessionData.userId);
//       expect(exportedValue.name).toBe(validSessionData.name);
//       expect(exportedValue.status).toBe(validSessionData.status);
//       expect(exportedValue.items).toEqual(validSessionData.items);
//       expect(exportedValue.createdAt).toBe(validSessionData.createdAt);
//       expect(exportedValue.updatedAt).toBe(validSessionData.updatedAt);
//     });
//   });
// });