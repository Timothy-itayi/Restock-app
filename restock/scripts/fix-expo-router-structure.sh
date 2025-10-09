#!/bin/bash

# Fix Expo Router structure by prefixing non-route directories with underscore
# This tells Expo Router to ignore these as routes

set -e

echo "🔧 Fixing Expo Router directory structure..."

cd "$(dirname "$0")/.."

# Top-level non-route directories
echo "📁 Renaming top-level directories..."
[ -d "app/components" ] && mv app/components app/_components && echo "  ✓ components → _components"
[ -d "app/hooks" ] && mv app/hooks app/_hooks && echo "  ✓ hooks → _hooks"
[ -d "app/utils" ] && mv app/utils app/_utils && echo "  ✓ utils → _utils"
[ -d "app/domain" ] && mv app/domain app/_domain && echo "  ✓ domain → _domain"
[ -d "app/application" ] && mv app/application app/_application && echo "  ✓ application → _application"
[ -d "app/infrastructure" ] && mv app/infrastructure app/_infrastructure && echo "  ✓ infrastructure → _infrastructure"
[ -d "app/logging" ] && mv app/logging app/_logging && echo "  ✓ logging → _logging"
[ -d "app/stores" ] && mv app/stores app/_stores && echo "  ✓ stores → _stores"
[ -d "app/theme" ] && mv app/theme app/_theme && echo "  ✓ theme → _theme"

# Tab subdirectories (components, hooks, utils, context)
echo "📁 Renaming tab subdirectories..."

for tab in dashboard emails profile restock-sessions; do
  if [ -d "app/(tabs)/$tab" ]; then
    [ -d "app/(tabs)/$tab/components" ] && mv "app/(tabs)/$tab/components" "app/(tabs)/$tab/_components" && echo "  ✓ $tab/components → _components"
    [ -d "app/(tabs)/$tab/hooks" ] && mv "app/(tabs)/$tab/hooks" "app/(tabs)/$tab/_hooks" && echo "  ✓ $tab/hooks → _hooks"
    [ -d "app/(tabs)/$tab/utils" ] && mv "app/(tabs)/$tab/utils" "app/(tabs)/$tab/_utils" && echo "  ✓ $tab/utils → _utils"
    [ -d "app/(tabs)/$tab/context" ] && mv "app/(tabs)/$tab/context" "app/(tabs)/$tab/_context" && echo "  ✓ $tab/context → _context"
  fi
done

echo ""
echo "✅ Directory structure fixed!"
echo ""
echo "⚠️  IMPORTANT: You MUST now update imports in your code."
echo "   Run the import fixer script next:"
echo "   ./scripts/fix-imports-after-rename.sh"

