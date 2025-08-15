# Domain Layer - User-Friendly Interface

## Problem Solved

Previously, users were required to provide Product IDs and Supplier IDs when adding items to restock sessions. This was problematic because:

1. **Users don't have access to IDs** - they only know product names and supplier names/emails
2. **IDs are a technical concern** - they belong to the persistence layer, not the domain
3. **Poor user experience** - forces users to work with system internals instead of business concepts

## Solution

The domain layer now provides **two interfaces**:

### 1. User-Friendly Interface (Recommended)

```typescript
// Users only provide business information
const result = RestockSessionDomainService.addItemToSession(
  session,
  {
    productName: "Red Tomatoes",
    quantity: 5,
    supplierName: "Fresh Farms",
    supplierEmail: "orders@freshfarms.com",
    notes: "Organic preferred"
  }
);
```

**Benefits:**
- ✅ No IDs required
- ✅ Works with natural business language
- ✅ Temporary IDs generated internally
- ✅ Seamless user experience

### 2. ID-Based Interface (Backward Compatibility)

```typescript
// Existing method for when you have full entities
const result = RestockSessionDomainService.addProductToSession(
  session,
  productEntity,
  supplierEntity,
  quantity,
  notes
);
```

## How It Works

### Temporary ID Generation
When users add items without IDs, the system generates temporary IDs:
- `temp_1234567890_abc123def`
- These are unique within the session
- They get replaced with real database IDs during persistence

### ID Resolution
When the session is saved, the `resolveSessionForPersistence` method:
1. Looks up existing products/suppliers by name/email
2. Creates new ones if they don't exist
3. Replaces temporary IDs with real database IDs
4. Returns the entities that need to be persisted

## Usage Examples

### Adding Items to Session
```typescript
// Simple user input
const addItemRequest: AddItemRequest = {
  productName: "Organic Bananas",
  quantity: 10,
  supplierName: "Tropical Fruits Co",
  supplierEmail: "orders@tropicalfruits.com"
};

const result = RestockSessionDomainService.addItemToSession(
  session,
  addItemRequest
);
```

### Resolving for Persistence
```typescript
const { session: resolvedSession, newProducts, newSuppliers } = 
  RestockSessionDomainService.resolveSessionForPersistence(
    session,
    (name) => existingProducts.find(p => p.name === name) || null,
    (name, email) => existingSuppliers.find(s => 
      s.name === name && s.email === email
    ) || null
  );

// Save new entities first
for (const product of newProducts) {
  await productRepository.save(product);
}
for (const supplier of newSuppliers) {
  await supplierRepository.save(supplier);
}

// Then save the resolved session
await sessionRepository.save(resolvedSession);
```

## Business Rules Enforced

The domain service still enforces all business rules:
- ✅ Session must be editable (not completed)
- ✅ Quantity must be positive
- ✅ Product names cannot be empty
- ✅ Supplier names cannot be empty
- ✅ Supplier emails must be valid
- ✅ No duplicate products in same session
- ✅ User ownership validation (when using entities)

## Migration Path

1. **Immediate**: Use `addItemToSession` for new user interactions
2. **Gradual**: Update UI forms to use the new interface
3. **Long-term**: The ID-based methods remain for advanced use cases

## Benefits

- **Better UX**: Users work with business concepts, not technical IDs
- **Cleaner Domain**: Business logic separated from persistence concerns
- **Flexibility**: Works with or without existing products/suppliers
- **Backward Compatible**: Existing code continues to work
- **Testable**: Easy to test business logic without database setup
