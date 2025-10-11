// /**
//  * DOMAIN LAYER TESTS: RestockSession Entity (Actual Implementation)
//  * 
//  * Tests the actual business entity implementation
//  * This validates our domain model integrity
//  */

// import { RestockSession, SessionStatus } from '../../../app/domain/entities/RestockSession';

// describe('RestockSession Entity (Actual Implementation)', () => {
//   const validSessionValue = {
//     id: 'session-1',
//     userId: 'user-1',
//     name: 'Test Session',
//     status: SessionStatus.DRAFT,
//     items: [],
//     createdAt: new Date(),
//   };

//   const sampleItem = {
//     productId: 'product-1',
//     productName: 'Test Product',
//     quantity: 5,
//     supplierId: 'supplier-1',
//     supplierName: 'Test Supplier',
//     supplierEmail: 'test@supplier.com',
//     notes: 'Test notes'
//   };

//   describe('Factory Methods', () => {
//     test('should create new session with create factory', () => {
//       const session = RestockSession.create({
//         id: 'session-1',
//         userId: 'user-1',
//         name: 'Test Session'
//       });
      
//       expect(session).toBeInstanceOf(RestockSession);
//       expect(session.id).toBe('session-1');
//       expect(session.userId).toBe('user-1');
//       expect(session.name).toBe('Test Session');
//       expect(session.status).toBe(SessionStatus.DRAFT);
//       expect(session.items).toHaveLength(0);
//     });

//     test('should create session from value object', () => {
//       const session = RestockSession.fromValue(validSessionValue);
      
//       expect(session).toBeInstanceOf(RestockSession);
//       expect(session.toValue()).toEqual(validSessionValue);
//     });

//     test('should create session without name', () => {
//       const session = RestockSession.create({
//         id: 'session-1',
//         userId: 'user-1'
//       });
      
//       expect(session.name).toMatch(/^Restock Session \d{4}-\d{2}-\d{2}/);
//       expect(session.status).toBe(SessionStatus.DRAFT);
//     });
//   });

//   describe('Business Rules - Item Management', () => {
//     test('should add item to session', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const updatedSession = session.addItem(sampleItem);
      
//       expect(updatedSession.items).toHaveLength(1);
//       expect(updatedSession.items[0]).toEqual(sampleItem);
//       expect(updatedSession.updatedAt).toBeDefined();
//     });

//     test('should reject duplicate products', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
      
//       expect(() => sessionWithItem.addItem(sampleItem)).toThrow('Product Test Product is already in this session');
//     });

//     test('should reject items with zero or negative quantity', () => {
//       const session = RestockSession.fromValue(validSessionValue);
      
//       expect(() => session.addItem({ ...sampleItem, quantity: 0 })).toThrow('Quantity must be greater than zero');
//       expect(() => session.addItem({ ...sampleItem, quantity: -1 })).toThrow('Quantity must be greater than zero');
//     });

//     test('should remove item from session', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
//       const updatedSession = sessionWithItem.removeItem('product-1');
      
//       expect(updatedSession.items).toHaveLength(0);
//     });

//     test('should update item in session', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
//       const updatedSession = sessionWithItem.updateItem('product-1', {
//         quantity: 10,
//         notes: 'Updated notes'
//       });
      
//       expect(updatedSession.items[0].quantity).toBe(10);
//       expect(updatedSession.items[0].notes).toBe('Updated notes');
//     });

//     test('should reject invalid quantity updates', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
      
//       expect(() => sessionWithItem.updateItem('product-1', { quantity: 0 })).toThrow('Quantity must be greater than zero');
//     });
//   });

//   describe('Session Name Management', () => {
//     test('should set session name', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const updatedSession = session.setName('New Session Name');
      
//       expect(updatedSession.name).toBe('New Session Name');
//       expect(updatedSession.updatedAt).toBeDefined();
//     });

//     test('should reject empty session names', () => {
//       const session = RestockSession.fromValue(validSessionValue);
      
//       expect(() => session.setName('')).toThrow('Session name cannot be empty');
//       expect(() => session.setName('   ')).toThrow('Session name cannot be empty');
//     });

//     test('should trim session name', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const updatedSession = session.setName('  Trimmed Name  ');
      
//       expect(updatedSession.name).toBe('Trimmed Name');
//     });
//   });

//   describe('Status Transitions', () => {
//     test('should generate emails from draft with items', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
//       const updatedSession = sessionWithItem.generateEmails();
      
//       expect(updatedSession.status).toBe(SessionStatus.EMAIL_GENERATED);
//       expect(updatedSession.updatedAt).toBeDefined();
//     });

//     test('should reject email generation from empty session', () => {
//       const session = RestockSession.fromValue(validSessionValue);
      
//       expect(() => session.generateEmails()).toThrow('Cannot generate emails for empty session');
//     });

//     test('should reject email generation from non-draft status', () => {
//       const sessionValue = { ...validSessionValue, status: SessionStatus.EMAIL_GENERATED };
//       const session = RestockSession.fromValue(sessionValue);
      
//       expect(() => session.generateEmails()).toThrow('Emails can only be generated from draft sessions');
//     });

//     test('should mark session as sent', () => {
//       const sessionValue = { ...validSessionValue, status: SessionStatus.EMAIL_GENERATED };
//       const session = RestockSession.fromValue(sessionValue);
//       const updatedSession = session.markAsSent();
      
//       expect(updatedSession.status).toBe(SessionStatus.SENT);
//     });

//     test('should reject marking as sent from non-email-generated status', () => {
//       const session = RestockSession.fromValue(validSessionValue); // DRAFT status
      
//       expect(() => session.markAsSent()).toThrow('Can only send emails that have been generated');
//     });
//   });

//   describe('Query Methods', () => {
//     test('should check if product exists', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
      
//       expect(sessionWithItem.hasProduct('product-1')).toBe(true);
//       expect(sessionWithItem.hasProduct('non-existent')).toBe(false);
//     });

//     test('should calculate total items', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItems = session
//         .addItem(sampleItem)
//         .addItem({ ...sampleItem, productId: 'product-2', quantity: 3 });
      
//       expect(sessionWithItems.getTotalItems()).toBe(8); // 5 + 3
//     });

//     test('should get unique suppliers', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const item2 = {
//         ...sampleItem,
//         productId: 'product-2',
//         supplierId: 'supplier-2',
//         supplierName: 'Supplier 2',
//         supplierEmail: 'supplier2@test.com'
//       };
      
//       const sessionWithItems = session
//         .addItem(sampleItem)
//         .addItem(item2);
      
//       const suppliers = sessionWithItems.getUniqueSuppliers();
//       expect(suppliers).toHaveLength(2);
//       expect(suppliers[0]).toEqual({
//         id: 'supplier-1',
//         name: 'Test Supplier',
//         email: 'test@supplier.com'
//       });
//     });

//     test('should get items by supplier', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
//       const items = sessionWithItem.getItemsBySupplier('supplier-1');
      
//       expect(items).toHaveLength(1);
//       expect(items[0]).toEqual(sampleItem);
//     });
//   });

//   describe('State Checks', () => {
//     test('should check if can add items', () => {
//       const draftSession = RestockSession.fromValue(validSessionValue);
//       const emailGeneratedSession = RestockSession.fromValue({
//         ...validSessionValue,
//         status: SessionStatus.EMAIL_GENERATED
//       });
      
//       expect(draftSession.canAddItems()).toBe(true);
//       expect(emailGeneratedSession.canAddItems()).toBe(false);
//     });

//     test('should check if can generate emails', () => {
//       const emptySession = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = emptySession.addItem(sampleItem);
      
//       expect(emptySession.canGenerateEmails()).toBe(false);
//       expect(sessionWithItem.canGenerateEmails()).toBe(true);
//     });

//     test('should check if can send emails', () => {
//       const draftSession = RestockSession.fromValue(validSessionValue);
//       const emailGeneratedSession = RestockSession.fromValue({
//         ...validSessionValue,
//         status: SessionStatus.EMAIL_GENERATED
//       });
      
//       expect(draftSession.canSendEmails()).toBe(false);
//       expect(emailGeneratedSession.canSendEmails()).toBe(true);
//     });

//     test('should check session state', () => {
//       const draftSession = RestockSession.fromValue(validSessionValue);
//       const sentSession = RestockSession.fromValue({
//         ...validSessionValue,
//         status: SessionStatus.SENT
//       });
      
//       expect(draftSession.isDraft()).toBe(true);
//       expect(draftSession.isCompleted()).toBe(false);
//       expect(sentSession.isDraft()).toBe(false);
//       expect(sentSession.isCompleted()).toBe(true);
//     });
//   });

//   describe('Immutability', () => {
//     test('should not mutate original session when adding items', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const originalValue = session.toValue();
      
//       session.addItem(sampleItem);
      
//       // Original should remain unchanged
//       expect(session.toValue()).toEqual(originalValue);
//       expect(session.items).toHaveLength(0);
//     });

//     test('should return new instance on modifications', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const updatedSession = session.setName('New Name');
      
//       expect(updatedSession).not.toBe(session);
//       expect(updatedSession.name).toBe('New Name');
//       expect(session.name).toBe(validSessionValue.name);
//     });
//   });

//   describe('Value Object Export', () => {
//     test('should export complete value object', () => {
//       const session = RestockSession.fromValue(validSessionValue);
//       const sessionWithItem = session.addItem(sampleItem);
      
//       const exported = sessionWithItem.toValue();
      
//       expect(exported).toHaveProperty('id');
//       expect(exported).toHaveProperty('userId');
//       expect(exported).toHaveProperty('name');
//       expect(exported).toHaveProperty('status');
//       expect(exported).toHaveProperty('items');
//       expect(exported).toHaveProperty('createdAt');
//       expect(exported.items).toHaveLength(1);
//     });
//   });
// });