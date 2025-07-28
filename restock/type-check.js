#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking TypeScript compilation...');

try {
  // Run TypeScript compiler in check mode
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.log('❌ TypeScript compilation failed. Check the errors above.');
  process.exit(1);
} 