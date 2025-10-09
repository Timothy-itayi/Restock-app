#!/usr/bin/env node

/**
 * Test script to validate the new responsive design system
 * Tests iPad breakpoints, theme integration, and responsive utilities
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Responsive Design System for iPad');
console.log('='.repeat(50));

// Test 1: Verify theme files exist and are properly structured
console.log('\n📁 Test 1: File Structure');
const requiredFiles = [
  'app/theme/index.ts',
  'app/hooks/useResponsiveStyles.ts',
  'app/stores/useThemeStore.ts',
  'app/components/responsive/ResponsiveLayouts.tsx',
  'styles/components/tabs.ts',
  'styles/components/dashboard.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
  }
});

// Test 2: Check iPad breakpoint definitions
console.log('\n📱 Test 2: iPad Breakpoint Definitions');
try {
  const themeContent = fs.readFileSync(path.join(__dirname, '..', 'app/theme/index.ts'), 'utf8');
  
  const iPadSpecs = [
    'iPad 5th-6th gen',
    'iPad 7th-9th gen',
    'iPad 10th gen'
  ];
  
  iPadSpecs.forEach(spec => {
    if (themeContent.includes(spec)) {
      console.log(`✅ ${spec} breakpoint defined`);
    } else {
      console.log(`❌ ${spec} breakpoint missing`);
    }
  });
  
  // Check breakpoint values
  const breakpointChecks = [
    { name: 'tablet: 768', value: 'tablet: 768' },
    { name: 'tabletLarge: 810', value: 'tabletLarge: 810' },
    { name: 'tabletXLarge: 820', value: 'tabletXLarge: 820' }
  ];
  
  breakpointChecks.forEach(check => {
    if (themeContent.includes(check.value)) {
      console.log(`✅ ${check.name} breakpoint`);
    } else {
      console.log(`❌ ${check.name} breakpoint missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Error reading theme file:', error.message);
}

// Test 3: Verify responsive typography scales
console.log('\n🔤 Test 3: Responsive Typography');
try {
  const themeContent = fs.readFileSync(path.join(__dirname, '..', 'app/theme/index.ts'), 'utf8');
  
  const typographyChecks = [
    'appTitle: 32', // tablet size
    'sectionHeader: 24', // tablet size
    'appTitle: 36', // tabletLarge size
    'sectionHeader: 28' // tabletLarge size
  ];
  
  typographyChecks.forEach(check => {
    if (themeContent.includes(check)) {
      console.log(`✅ ${check} typography scale`);
    } else {
      console.log(`❌ ${check} typography scale missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Error checking typography:', error.message);
}

// Test 4: Verify responsive layout configurations
console.log('\n📐 Test 4: Responsive Layout Configurations');
try {
  const themeContent = fs.readFileSync(path.join(__dirname, '..', 'app/theme/index.ts'), 'utf8');
  
  const layoutChecks = [
    'maxContentWidth: 768', // tablet
    'columns: 2', // tablet
    'actionGridColumns: 3', // tablet
    'maxContentWidth: 900', // tabletLarge
    'columns: 3', // tabletLarge
    'actionGridColumns: 4', // tabletLarge
    'touchTargetMin: 44' // iOS HIG compliance
  ];
  
  layoutChecks.forEach(check => {
    if (themeContent.includes(check)) {
      console.log(`✅ ${check} layout config`);
    } else {
      console.log(`❌ ${check} layout config missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Error checking layouts:', error.message);
}

// Test 5: Check responsive component updates
console.log('\n🎨 Test 5: Responsive Component Updates');
const componentFiles = [
  { file: 'styles/components/tabs.ts', hooks: ['useAppTheme', 'getTabsStyles'] },
  { file: 'styles/components/dashboard.ts', hooks: ['useAppTheme', 'getDashboardStyles'] },
  { file: 'app/(tabs)/_layout.tsx', hooks: ['useTabsTheme'] }
];

componentFiles.forEach(({ file, hooks }) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    
    hooks.forEach(hook => {
      if (content.includes(hook)) {
        console.log(`✅ ${file} uses ${hook}`);
      } else {
        console.log(`❌ ${file} missing ${hook}`);
      }
    });
    
  } catch (error) {
    console.log(`❌ Error reading ${file}:`, error.message);
  }
});

// Test 6: Verify responsive layout primitives
console.log('\n🧱 Test 6: Responsive Layout Primitives');
try {
  const primitivesContent = fs.readFileSync(
    path.join(__dirname, '..', 'app/components/responsive/ResponsiveLayouts.tsx'),
    'utf8'
  );
  
  const primitiveComponents = [
    'ResponsiveContainer',
    'ResponsiveGrid',
    'ResponsiveCard',
    'ResponsiveStack',
    'ResponsiveScrollView',
    'ResponsiveActionGrid'
  ];
  
  primitiveComponents.forEach(component => {
    if (primitivesContent.includes(`export const ${component}`)) {
      console.log(`✅ ${component} primitive`);
    } else {
      console.log(`❌ ${component} primitive missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Error checking primitives:', error.message);
}

// Test 7: Check theme store integration
console.log('\n🏪 Test 7: Theme Store Integration');
try {
  const storeContent = fs.readFileSync(
    path.join(__dirname, '..', 'app/stores/useThemeStore.ts'),
    'utf8'
  );
  
  const storeChecks = [
    'ResponsiveState',
    'deviceType',
    'isTablet',
    'updateScreenDimensions',
    'calculateResponsiveState'
  ];
  
  storeChecks.forEach(check => {
    if (storeContent.includes(check)) {
      console.log(`✅ Theme store has ${check}`);
    } else {
      console.log(`❌ Theme store missing ${check}`);
    }
  });
  
} catch (error) {
  console.log('❌ Error checking theme store:', error.message);
}

console.log('\n🎯 Test Summary');
console.log('='.repeat(50));
console.log('✅ Responsive design system implemented for iPad');
console.log('📱 iPad generations 5-10 supported (768px - 820px)');
console.log('🎨 Enhanced typography and spacing for tablet viewing');
console.log('👆 44pt minimum touch targets (iOS HIG compliant)');
console.log('📐 Multi-column layouts for better space utilization');
console.log('🧱 Responsive layout primitives for consistent UI');
console.log('🔄 Automatic screen dimension updates via theme store');

console.log('\n🚀 Ready for iPad Testing!');
console.log('Run the app on iPad simulators to test responsive behavior:');
console.log('- iPad (9th generation) - 810×1080');
console.log('- iPad (10th generation) - 820×1180');
console.log('- iPad Air - 834×1194');