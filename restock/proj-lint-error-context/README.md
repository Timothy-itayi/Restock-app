## 🚨 **PHASE 4 BLOCKERS: TYPESCRIPT ERRORS TO CLEAN UP**

**Total Errors: 313** - These must be resolved before Phase 4 completion

### 🔴 **CRITICAL - App Won't Compile**

#### **Test Files - Mock Repository Mismatches**
- `__tests__/application/use-cases/RestockApplicationService.test.ts`
  - ❌ `MockSessionRepository` incorrectly implements `SessionRepository` interface
  - ❌ Missing methods: `create`, `addItem`, `removeItem`, `updateName`, `updateStatus`, `markAsSent`

#### **Service Registry Tests - Missing Exports**
- `__tests__/infrastructure/di/ServiceRegistry.test.ts`
  - ❌ Missing exported member `initializeServices`
  - ❌ Missing exported member `healthCheck`
  - ❌ Method signature mismatches (expected 1 arg, got 0)

#### **Integration Tests - Non-existent Services**
- `__tests__/integration/FullStackIntegration.test.ts`
  - ❌ Cannot find `UserContextService` (migrated to Convex)
  - ❌ Cannot find `SupabaseSessionRepository` (migrated to Convex)

#### **UI Test Files**
- `__tests__/ui/components/SwipeableSessionCard.test.tsx`
  - ❌ Cannot find module '@testing-library/react-native'

### 🟠 **HIGH - Core Functionality Broken**

#### **Email Hooks - Missing Service References**
- `app/(tabs)/emails/hooks/useEmailSession.ts`
  - ❌ Cannot find name `app` (should use repository hooks)
- `app/(tabs)/emails/hooks/useEmailSessions.ts`
  - ❌ Cannot find name `app` (should use repository hooks)

#### **Profile Hooks - Repository API Mismatch**
- `app/(tabs)/profile/hooks/useProfileData.ts`
  - ❌ Wrong argument type for `findByUserId` (expects string, got object)
  - ❌ Accessing non-existent properties: `success`, `sessions`
  - ❌ Cannot find name `restockService` (should use repository hooks)

#### **Restock Session Hooks - Repository API Mismatch**
- `app/(tabs)/restock-sessions/hooks/useRestockSession.ts`
  - ❌ Wrong argument type for `create` (expects `Omit<RestockSession, "id">`)
  - ❌ Accessing non-existent properties: `success`, `session`, `error`
  - ❌ Cannot find name `restockService` (should use repository hooks)
- `app/(tabs)/restock-sessions/hooks/useRestockSessions.ts`
  - ❌ Wrong argument type for `findByUserId` (expects string, got object)
  - ❌ Wrong argument type for `create` (expects `Omit<RestockSession, "id">`)
  - ❌ Accessing non-existent properties: `success`, `sessions`

#### **Component Import Issues**
- `app/(tabs)/restock-sessions/components/SessionWorkflow.tsx`
  - ❌ Wrong import syntax for `Button`, `Card`, `CustomToast`
  - ❌ Should use default imports instead of named exports
- `app/(tabs)/restock-sessions/components/ConvexTest.tsx`
  - ❌ Expected 2 arguments, but got 1

#### **Old Hook Files - Should Be Deleted**
- `app/(tabs)/restock-sessions/hooks/useProductForm.clean.ts`
  - ❌ Type assignment errors and duplicate properties
- `app/(tabs)/restock-sessions/hooks/useProductForm.old.ts`
  - ❌ Multiple property access errors on old interfaces
  - ❌ References to non-existent `SessionService` methods

### 🟡 **MEDIUM - Interface & Type Issues**

#### **Backend Services - Property Name Mismatches**
- `backend/services/ai/email-generator.ts`
  - ❌ Property `store_name` doesn't exist (should be `storeName`)
- `backend/services/emails.ts`
  - ❌ Properties `session_id`, `supplier_id`, `email_content` don't exist
  - ❌ Should be `sessionId`, `supplierId`, `emailContent`
- `backend/services/ai/groq-email-client.ts`
  - ❌ Property `emailText` doesn't exist on response type
  - ❌ Property `functionUrl` doesn't exist (should be `setFunctionUrl`)
- `backend/services/ai/model-manager.ts`
  - ❌ Property `uri` doesn't exist on `FileSystemDownloadResult`
  - ❌ Argument type mismatch (string | null vs string)

#### **Store & Context Issues**
- `app/stores/useProfileStore.ts`
  - ❌ Cannot find `UserContextService` (migrated to Convex)
  - ❌ Property `store_name` doesn't exist (should be `storeName`)
- `app/stores/useThemeStore.ts`
  - ❌ Type conflicts between two different theme type definitions

#### **Convex Configuration**
- `convex.config.ts`
  - ❌ Cannot find module 'convex/config'
- `convex/ai.ts`
  - ❌ Object is possibly 'undefined' (need null checks)

#### **Backend Test Services**
- `backend/test-services.ts`
  - ❌ Multiple property access errors on Convex data types
  - ❌ Method signature mismatches
  - ❌ References to non-existent properties like `id`, `name`, `email`

### 🟢 **LOW - Minor Cleanup**

#### **Old Context Files**
- `app/(tabs)/restock-sessions/context/RestockSessionContext.old.tsx`
  - ❌ Multiple property access errors on old interface
  - ❌ This file should be deleted (marked as .old)

#### **Testing Infrastructure**
- `app/infrastructure/testing/UserContextTestHelper.ts`
  - ❌ Missing `initializeServices` export
  - ❌ Cannot find `UserContextService`

#### **Backend Index**
- `backend/index.ts`
  - ❌ Cannot find module './user-context'

### 📋 **CLEANUP PRIORITY ORDER**

1. **🔴 CRITICAL**: Fix test file mock implementations
2. **🔴 CRITICAL**: Update ServiceRegistry exports
3. **🟠 HIGH**: Fix email hooks service references
4. **🟠 HIGH**: Fix profile hooks repository usage
5. **🟠 HIGH**: Fix restock session hooks repository usage
6. **🟠 HIGH**: Fix component import syntax
7. **🟡 MEDIUM**: Fix backend service property names
8. **🟡 MEDIUM**: Resolve store type conflicts
9. **🟡 MEDIUM**: Fix Convex configuration issues
10. **🟢 LOW**: Delete old context and hook files
11. **🟢 LOW**: Update testing infrastructure

### 🎯 **ESTIMATED EFFORT**

- **Critical Issues**: 2-3 hours
- **High Priority**: 3-4 hours  
- **Medium Priority**: 2-3 hours
- **Low Priority**: 1-2 hours
- **Total**: 8-12 hours of cleanup work

**These errors must be resolved before proceeding to Phase 4 completion tasks.**
