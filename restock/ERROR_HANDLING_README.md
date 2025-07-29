# 🔧 Error Handling & Logging System

## Overview

This document describes the comprehensive error handling and logging system implemented in the Restock app. The system provides structured logging, error tracking, performance monitoring, and user interaction tracking to help debug issues and monitor app performance.

## 🏗️ Architecture

### Core Components

1. **ErrorLogger** - Centralized logging with different levels
2. **ErrorHandler** - Common error handling patterns
3. **PerformanceLogger** - Performance monitoring and timing
4. **UserActionLogger** - User interaction tracking

### File Structure

```
restock/
├── backend/
│   └── utils/
│       └── error-logger.ts          # Main logging utilities
├── app/
│   └── (tabs)/
│       └── restock-sessions.tsx     # Example implementation
├── tests/
│   └── error-logging-test.js        # Test suite
└── ERROR_HANDLING_README.md         # This documentation
```

## 📝 Usage Examples

### Basic Logging

```typescript
import { log, perf, userAction, handleError } from '../backend/utils/error-logger';

// Info logging
log.info('Component mounted', { userId: 'user123' }, { component: 'RestockSessions' });

// Success logging
log.success('Data loaded successfully', { count: 5 }, { component: 'RestockSessions' });

// Warning logging
log.warning('Network connection slow', { latency: 2000 }, { component: 'RestockSessions' });

// Error logging
try {
  // Some operation that might fail
} catch (error) {
  log.error('Operation failed', error, { 
    component: 'RestockSessions',
    operation: 'loadProducts',
    userId: 'user123'
  });
}

// Debug logging (only in development)
log.debug('Form validation passed', { fields: ['name', 'email'] }, { component: 'RestockSessions' });
```

### Error Handling

```typescript
// Database errors
const result = handleError.handleDatabaseError(error, 'loadProducts', { 
  component: 'RestockSessions',
  userId: 'user123'
});

// Network errors
const result = handleError.handleNetworkError(error, 'fetchProducts', { 
  component: 'RestockSessions'
});

// Validation errors
const errorMessage = handleError.handleValidationError('email', 'invalid-email', 'must be valid email', {
  component: 'RestockSessions'
});

// Authentication errors
const result = handleError.handleAuthError(error, 'verifyUser', { 
  component: 'AuthGuard'
});

// API errors
const result = handleError.handleApiError(error, '/api/products', { 
  component: 'RestockSessions'
});

// AsyncStorage errors
const result = handleError.handleAsyncStorageError(error, 'saveSession', { 
  component: 'RestockSessions'
});
```

### Performance Monitoring

```typescript
// Simple timing
perf.startTimer('dataLoad');
// ... perform operation
perf.endTimer('dataLoad', { component: 'RestockSessions' });

// Async operation timing
const result = await perf.measureAsync('asyncOperation', async () => {
  // Your async operation here
  return { success: true, data: 'test' };
}, { component: 'RestockSessions' });
```

### User Interaction Tracking

```typescript
// Button clicks
userAction.logButtonClick('Add Product', { component: 'RestockSessions' });

// Navigation
userAction.logNavigation('Dashboard', 'RestockSessions', { component: 'App' });

// Form submissions
userAction.logFormSubmission('AddProductForm', { 
  productName: 'Apple',
  quantity: 10 
}, { component: 'RestockSessions' });

// General actions
userAction.logAction('Session Started', { sessionId: '123' }, { component: 'RestockSessions' });
```

## 🔍 Log Levels

### Info (ℹ️)
- General information about app state
- Component lifecycle events
- Data loading status

### Success (✅)
- Successful operations
- Data saved successfully
- User actions completed

### Warning (⚠️)
- Non-critical issues
- Performance degradation
- Validation failures

### Error (❌)
- Critical errors
- Failed operations
- Exception handling

### Debug (🔍)
- Detailed debugging information
- Only shown in development mode
- Form validation details

## 📊 Log Structure

Each log entry contains:

```typescript
{
  level: 'info' | 'success' | 'warning' | 'error' | 'debug',
  message: string,
  data?: any,
  context?: {
    component?: string,
    userId?: string,
    operation?: string,
    timestamp?: string,
    [key: string]: any
  },
  timestamp: string
}
```

## 🛠️ Error Handling Patterns

### Database Operations

```typescript
const saveProductToDatabase = async (productName: string, supplierName: string, supplierEmail: string) => {
  if (!userId) {
    log.warning('Cannot save product: no userId');
    return { success: false, error: 'No user ID available' };
  }
  
  try {
    log.info('Saving product to database', { productName, supplierName, supplierEmail, userId });
    
    // Database operation
    const result = await ProductService.createProduct({...});
    
    if (result.error) {
      log.error('Failed to create product', result.error, { productName, supplierId });
      return handleError.handleDatabaseError(result.error, 'createProduct', { productName, supplierId });
    }
    
    log.success('Product created successfully', { productId: result.data.id, productName });
    return { success: true };
    
  } catch (error) {
    log.error('Unexpected error saving product', error, { productName, supplierName, supplierEmail });
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
```

### Form Validation

```typescript
const validateForm = () => {
  log.debug('Validating form', { productName, quantity, supplierName, supplierEmail });
  
  if (!productName.trim()) {
    const error = handleError.handleValidationError('productName', productName, 'required');
    setErrorMessage(error);
    return false;
  }
  
  if (!quantity.trim() || parseInt(quantity) <= 0) {
    const error = handleError.handleValidationError('quantity', quantity, 'must be greater than 0');
    setErrorMessage(error);
    return false;
  }
  
  log.debug('Form validation passed');
  return true;
};
```

### AsyncStorage Operations

```typescript
const saveSessionData = async (sessionData: any) => {
  try {
    await AsyncStorage.setItem('currentEmailSession', JSON.stringify(sessionData));
    log.success('Session data stored for email generation', { sessionId: sessionData.sessionId });
  } catch (error) {
    log.error('Failed to store session data for email generation', error, { sessionId: sessionData.sessionId });
    showNotification('error', 'Failed to prepare email session');
  }
};
```

## 🎯 Best Practices

### 1. Always Include Context

```typescript
// Good
log.error('Database operation failed', error, { 
  component: 'RestockSessions',
  operation: 'loadProducts',
  userId: 'user123'
});

// Bad
log.error('Database operation failed', error);
```

### 2. Use Appropriate Log Levels

```typescript
// Use info for general flow
log.info('Component mounted', { userId });

// Use success for completed operations
log.success('Product added to session', { productId, sessionProductCount });

// Use warning for recoverable issues
log.warning('Network connection slow', { latency });

// Use error for failures
log.error('Failed to load data', error, { operation });

// Use debug for detailed information
log.debug('Form validation details', { fields, values });
```

### 3. Handle Errors Gracefully

```typescript
// Always provide fallbacks
if (!productSaveResult.success && 'error' in productSaveResult) {
  log.warning('Failed to save product to database', { error: productSaveResult.error });
  // Continue with the session even if database save fails
}
```

### 4. Track User Interactions

```typescript
// Log important user actions
userAction.logButtonClick('Add Product', { component: 'RestockSessions' });
userAction.logFormSubmission('AddProductForm', formData, { component: 'RestockSessions' });
userAction.logNavigation('Dashboard', 'RestockSessions', { component: 'App' });
```

### 5. Monitor Performance

```typescript
// Time critical operations
perf.startTimer('dataLoad');
const data = await loadData();
perf.endTimer('dataLoad', { component: 'RestockSessions' });

// Or use the convenience method
const result = await perf.measureAsync('dataLoad', loadData, { component: 'RestockSessions' });
```

## 🔧 Debugging Tools

### Log Retrieval

```typescript
// Get all logs
const allLogs = log.getLogs();

// Get logs by level
const errorLogs = log.getLogsByLevel('error');

// Get recent logs
const recentLogs = log.getRecentLogs(10);

// Export logs for debugging
const exportedLogs = log.exportLogs();
```

### Performance Analysis

```typescript
// Check if performance timers are active
const timers = perf.getTimers();

// Clear logs if needed
log.clearLogs();
```

## 🧪 Testing

Run the error logging test suite:

```bash
cd restock
node tests/error-logging-test.js
```

This will test:
- Basic logging functionality
- Error handling patterns
- Performance monitoring
- User interaction tracking
- Log retrieval and export

## 📱 UI Integration

### Error States

The restock sessions screen includes error state handling:

```typescript
// Error display component
const renderErrorState = () => {
  if (!errorState.hasError) return null;
  
  return (
    <View style={restockSessionsStyles.errorContainer}>
      <Text style={restockSessionsStyles.errorTitle}>⚠️ Error Loading Data</Text>
      <Text style={restockSessionsStyles.errorStateMessage}>{errorState.errorMessage}</Text>
      <TouchableOpacity 
        style={restockSessionsStyles.retryButton}
        onPress={() => {
          log.info('User retrying data load');
          loadStoredData();
        }}
      >
        <Text style={restockSessionsStyles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Loading States

```typescript
// Loading indicator
const renderLoadingState = () => {
  if (!isLoadingData) return null;
  
  return (
    <View style={restockSessionsStyles.loadingContainer}>
      <Text style={restockSessionsStyles.loadingText}>Loading your data...</Text>
    </View>
  );
};
```

## 🚀 Benefits

1. **Structured Logging** - Consistent format across the app
2. **Error Tracking** - Detailed error information with context
3. **Performance Monitoring** - Track operation timing
4. **User Analytics** - Monitor user interactions
5. **Debugging Support** - Easy log retrieval and export
6. **Development Only** - Debug logs only appear in development
7. **Memory Management** - Log clearing capabilities
8. **Error Recovery** - Graceful error handling with fallbacks

## 🔄 Migration Guide

### From Console.log

```typescript
// Before
console.log('User added product:', productName);
console.error('Database error:', error);

// After
log.info('User added product', { productName }, { component: 'RestockSessions' });
log.error('Database error', error, { component: 'RestockSessions' });
```

### From Basic Error Handling

```typescript
// Before
try {
  await saveData();
} catch (error) {
  console.error('Save failed:', error);
  Alert.alert('Error', 'Failed to save data');
}

// After
try {
  await saveData();
  log.success('Data saved successfully');
} catch (error) {
  const result = handleError.handleDatabaseError(error, 'saveData', { component: 'RestockSessions' });
  log.error('Save failed', error, { component: 'RestockSessions' });
  showNotification('error', result.error);
}
```

This comprehensive error handling and logging system will help you identify and debug issues quickly, monitor app performance, and track user interactions for better app development and maintenance. 