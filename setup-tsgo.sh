#!/bin/bash

# TypeScript-Go Migration Script
# This script installs dependencies and verifies the TypeScript-Go setup

echo "🚀 Setting up TypeScript-Go for your project..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Verify TypeScript-Go installation
echo "🔍 Verifying TypeScript-Go installation..."
if command -v tsgo &> /dev/null; then
    echo "✅ TypeScript-Go (tsgo) is available"
    tsgo --version
else
    echo "⚠️  TypeScript-Go not found in PATH, using npx..."
    npx tsgo --version
fi

# Run type checking
echo "🔍 Running type checks..."
echo "Checking root project..."
npx tsgo --noEmit --project .

echo "Checking Astro project..."
cd websites/astro && npx tsgo --noEmit && cd ../..

echo "Checking TanStack project..."
cd websites/tanstack && npx tsgo --noEmit && cd ../..

echo "✅ TypeScript-Go setup complete!"
echo ""
echo "Next steps:"
echo "  - Run 'pnpm dev:astro' to start Astro development"
echo "  - Run 'pnpm dev:tanstack' to start TanStack development"
echo "  - Run 'pnpm tsc:check' to type-check all projects"
echo ""
echo "For VS Code users:"
echo "  - Install the 'TypeScript (Native Preview)' extension"
echo "  - Add '\"typescript.experimental.useTsgo\": true' to your settings"
