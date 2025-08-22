# SQL Database Schema & Migration Notes

## 🔄 **Critical Learning: UUID vs Text Primary Keys**

### **The Mistake We Made in Development**

During initial development, we made a fundamental database design error by using `TEXT` data types for primary keys instead of proper `UUID` types. This seemed to work fine in development mode, but as we moved closer to production, we encountered multiple issues:

#### **Problems with TEXT Primary Keys:**
1. **Type Mismatches**: RPC functions returning `text` while expecting `uuid`
2. **Performance Issues**: TEXT comparisons are slower than UUID comparisons
3. **Data Integrity**: No built-in validation for proper UUID format
4. **Supabase Integration**: Supabase RLS policies work better with proper UUID types
5. **Clerk Integration**: JWT token handling expects UUID standards

#### **The Breaking Point:**
```sql
-- ❌ WRONG: Original schema with TEXT primary keys
CREATE TABLE restock_sessions (
    id TEXT PRIMARY KEY,  -- This caused major issues!
    user_id TEXT,
    ...
);

-- ❌ WRONG: RPC functions returning text instead of UUID
RETURNS TABLE (id text, ...)
```

**Error Messages We Encountered:**
- `column "id" is of type uuid but expression is of type text`
- `structure of query does not match function result type`
- Type casting errors in application code

### **The Solution: Complete Schema Migration**

We had to **delete all tables and start fresh** with proper UUID primary keys:

```sql
-- ✅ CORRECT: New schema with UUID primary keys
CREATE TABLE restock_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    ...
);

-- ✅ CORRECT: RPC functions returning proper types
RETURNS TABLE (id uuid, user_id uuid, ...)
```

### **Migration Strategy**

1. **Backup Data**: Export any important development data
2. **Drop All Tables**: Clean slate approach
3. **Recreate Schema**: Use proper UUID types throughout
4. **Update RPC Functions**: Ensure return types match table schemas
5. **Update Application Code**: Handle UUID types correctly
6. **Test Thoroughly**: Verify all CRUD operations work

### **Key Lessons Learned**

#### **🎯 Best Practices Moving Forward:**

1. **Always Use UUID for Primary Keys**
   ```sql
   id UUID PRIMARY KEY DEFAULT gen_random_uuid()
   ```

2. **Match RPC Return Types to Table Schema**
   ```sql
   -- If table has UUID columns, RPC should return UUID
   RETURNS TABLE (id uuid, user_id uuid, ...)
   ```

3. **Consistent Type Usage**
   - Database: `UUID`
   - RPC Functions: `uuid`
   - Application: Handle as string but know it's UUID format

4. **Early Schema Validation**
   - Test RPC functions during development
   - Validate type compatibility early
   - Don't wait until production to discover type mismatches

#### **🚫 What NOT to Do:**

- ❌ Don't use `TEXT` for primary keys
- ❌ Don't mix `uuid` and `text` types for the same logical field
- ❌ Don't assume development quirks will work in production
- ❌ Don't ignore TypeScript/database type warnings

### **Current Schema Status**

✅ **All tables now use proper UUID primary keys**
✅ **RLS policies work correctly with Clerk JWT integration**
✅ **RPC functions have matching return types**
✅ **Application handles UUID types correctly**

### **Recovery Impact**

**Fortunately**: This migration happened during development phase, so:
- No production data was lost
- No user impact
- Clean foundation for scaling
- Better performance and type safety going forward

**The silver lining**: This mistake taught us proper database design principles early and resulted in a much more robust, production-ready schema.

---

## 📁 **File Structure**

- `table_schema.sql` - Main table definitions with proper UUID types
- `CRUD_RPC_FUNCTIONS.sql` - All RPC functions with matching return types
- `get_user_profile_by_clerk_id.sql` - User profile lookup function
- `README.md` - This documentation file

## 🔧 **Deployment Notes**

When deploying SQL changes:
1. Run `table_schema.sql` first to create/update tables
2. Run `CRUD_RPC_FUNCTIONS.sql` to create/update functions
3. Run individual function files as needed
4. Always test RPC functions after deployment
5. Verify RLS policies are working with Clerk JWT tokens

---

*Remember: Database schema mistakes in development are learning opportunities. The key is catching and fixing them before production!*
