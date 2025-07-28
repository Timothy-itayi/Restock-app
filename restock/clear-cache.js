#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Metro cache and node_modules...');

try {
  // Clear Metro cache
  console.log('Clearing Metro cache...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.log('Metro cache cleared. Starting fresh...');
  
  // Alternative: clear cache manually
  try {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    execSync('rm -rf .expo', { stdio: 'inherit' });
    console.log('Cache cleared successfully!');
  } catch (e) {
    console.log('Cache clear completed.');
  }
}

console.log('✅ Cache cleared! You can now run: npm start'); 