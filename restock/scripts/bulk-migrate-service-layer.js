#!/usr/bin/env node

/**
 * BULK MIGRATION SCRIPT: Service Layer to Repository Pattern
 * 
 * This script updates all files still using the old service layer
 * to use the new repository pattern through ConvexHooksProvider
 */

const fs = require('fs');
const path = require('path');

// Files that need migration
const filesToMigrate = [
  'app/(tabs)/profile/hooks/useProfileData.ts',
  'app/(tabs)/emails/hooks/useEmailScreens.ts',
  'app/(tabs)/dashboard/hooks/useDashboardData.ts',
  'app/(tabs)/emails/hooks/useEmailSessions.ts',
  'app/(tabs)/emails/hooks/useEmailSession.ts',
  'app/(tabs)/restock-sessions/hooks/useSessionList.ts',
  'app/(tabs)/restock-sessions/hooks/useSessionStateManager.ts',
  'app/(tabs)/restock-sessions/hooks/useProductForm.clean.ts',
  'app/(tabs)/restock-sessions/hooks/useProductForm.ts',
  'app/(tabs)/restock-sessions/hooks/useRestockSessions.ts',
  'app/(tabs)/restock-sessions/hooks/useRestockSession.ts'
];

// Migration mappings
const migrations = {
  // Import changes
  'import { useRestockApplicationService } from \'./useService\';': 'import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from \'../../../infrastructure/convex/ConvexHooksProvider\';',
  'import { useRestockApplicationService } from \'../../restock-sessions/hooks/useService\';': 'import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from \'../../../infrastructure/convex/ConvexHooksProvider\';',
  
  // Variable declarations
  'const restockService = useRestockApplicationService();': 'const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();',
  'const app = useRestockApplicationService();': 'const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();',
  
  // Method calls
  'restockService.createSession(': 'create(',
  'restockService.getSession(': 'findById(',
  'restockService.getSessions(': 'findByUserId(',
  'restockService.addItem(': 'addItem(',
  'restockService.removeProduct(': 'removeItem(',
  'restockService.setSessionName(': 'updateName(',
  'restockService.updateSessionStatus(': 'updateStatus(',
  
  // App method calls
  'app.createSession(': 'create(',
  'app.getSession(': 'findById(',
  'app.getSessions(': 'findByUserId(',
  'app.addItem(': 'addItem(',
  'app.removeProduct(': 'removeItem(',
  'app.setSessionName(': 'updateName(',
  'app.updateSessionStatus(': 'updateStatus(',
};

function migrateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // Apply migrations
  for (const [oldText, newText] of Object.entries(migrations)) {
    if (content.includes(oldText)) {
      content = content.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
      changed = true;
      console.log(`✅ Updated: ${oldText} → ${newText}`);
    }
  }
  
  if (changed) {
    // Backup original file
    const backupPath = fullPath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(fullPath, 'utf8'));
    
    // Write migrated content
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🚀 Starting bulk migration from service layer to repository pattern...\n');
  
  let migratedCount = 0;
  let totalFiles = filesToMigrate.length;
  
  for (const filePath of filesToMigrate) {
    if (migrateFile(filePath)) {
      migratedCount++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log(`🎯 Migration complete!`);
  console.log(`📊 Files migrated: ${migratedCount}/${totalFiles}`);
  
  if (migratedCount > 0) {
    console.log(`\n⚠️  IMPORTANT: Review the migrated files and test thoroughly!`);
    console.log(`📝 Backup files created with .backup extension`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, migrations };
