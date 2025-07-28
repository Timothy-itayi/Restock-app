# Backend Services

This directory contains all backend services and utilities for the Restock app, built with Supabase.

## 📁 Directory Structure

```
backend/
├── config/
│   └── supabase.ts          # Supabase client configuration
├── services/
│   ├── auth.ts              # Authentication service
│   ├── products.ts          # Product management service
│   ├── suppliers.ts         # Supplier management service
│   ├── sessions.ts          # Restock session service
│   └── emails.ts            # Email tracking service
├── types/
│   └── database.ts          # TypeScript types for database
├── utils/
│   └── helpers.ts           # Utility functions
├── index.ts                 # Main exports
└── README.md               # This file
```

## 🔧 Services Overview

### AuthService
- User authentication (sign up, sign in, sign out)
- User profile management
- Session handling

### ProductService
- CRUD operations for products
- Product search and autocomplete
- Product-supplier relationships

### SupplierService
- CRUD operations for suppliers
- Supplier search and autocomplete
- Supplier-product relationships

### SessionService
- Restock session management
- Session items (products and quantities)
- Session status tracking

### EmailService
- Email tracking and status management
- Email statistics
- Failed email handling

## 🚀 Usage

### Import Services
```typescript
import { 
  AuthService, 
  ProductService, 
  SupplierService,
  SessionService,
  EmailService 
} from '../backend';
```

### Example: Create a Product
```typescript
const { data, error } = await ProductService.createProduct({
  user_id: userId,
  name: 'Organic Bananas',
  default_quantity: 50,
  default_supplier_id: supplierId
});
```

### Example: Get User Sessions
```typescript
const { data, error } = await SessionService.getUserSessions(userId);
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema

The backend supports the following tables:
- `users` - User authentication and profiles
- `products` - User's restock items
- `suppliers` - Contact information for ordering
- `restock_sessions` - Session tracking
- `restock_items` - Products and quantities per session
- `emails_sent` - Email tracking and delivery status

## 🛠️ Error Handling

All services return consistent error objects:
```typescript
{ data: T | null, error: any }
```

Use the `handleSupabaseError` utility to format error messages:
```typescript
import { handleSupabaseError } from '../backend';

const { data, error } = await ProductService.createProduct(product);
if (error) {
  console.error(handleSupabaseError(error));
}
```

## 🔄 Data Flow

1. **Authentication** → AuthService handles user login/signup
2. **Product Management** → ProductService manages user's products
3. **Supplier Management** → SupplierService manages supplier contacts
4. **Session Creation** → SessionService creates restock sessions
5. **Email Generation** → EmailService tracks sent emails

## 📝 Type Safety

All database operations are fully typed with TypeScript interfaces that match the Supabase schema. This ensures type safety and better developer experience. 