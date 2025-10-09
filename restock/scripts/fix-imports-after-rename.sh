#!/bin/bash

# Fix imports after directory renames
# Updates all import statements to use new underscore-prefixed paths

set -e

echo "🔄 Fixing import statements..."

cd "$(dirname "$0")/.."

# Function to update imports in all files
fix_imports() {
  local old_path="$1"
  local new_path="$2"
  
  echo "  Updating: $old_path → $new_path"
  
  # Find all .ts, .tsx, .js, .jsx files and update imports
  find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|from ['\"]\\([^'\"]*\\)/${old_path}|from \"\\1/${new_path}|g" {} +
  find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|from ['\"]\./${old_path}|from \"./${new_path}|g" {} +
  find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|from ['\"]\.\./${old_path}|from \"../${new_path}|g" {} +
  find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|from ['\"]\.\.\/\.\./${old_path}|from \"../../${new_path}|g" {} +
  find app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|from ['\"]\.\.\/\.\.\/\.\./${old_path}|from \"../../../${new_path}|g" {} +
}

echo "📝 Fixing top-level directory imports..."
fix_imports "components/" "_components/"
fix_imports "hooks/" "_hooks/"
fix_imports "utils/" "_utils/"
fix_imports "domain/" "_domain/"
fix_imports "application/" "_application/"
fix_imports "infrastructure/" "_infrastructure/"
fix_imports "logging/" "_logging/"
fix_imports "stores/" "_stores/"
fix_imports "theme/" "_theme/"

echo "📝 Fixing tab subdirectory imports..."
for tab in dashboard emails profile restock-sessions; do
  fix_imports "(tabs)/$tab/components/" "(tabs)/$tab/_components/"
  fix_imports "(tabs)/$tab/hooks/" "(tabs)/$tab/_hooks/"
  fix_imports "(tabs)/$tab/utils/" "(tabs)/$tab/_utils/"
  fix_imports "(tabs)/$tab/context/" "(tabs)/$tab/_context/"
done

echo ""
echo "✅ Import statements fixed!"
echo ""
echo "🧹 Now clean Metro bundler cache:"
echo "   rm -rf .expo node_modules/.cache"
echo "   npx expo start --clear"

