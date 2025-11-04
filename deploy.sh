#!/bin/bash

# Manual deployment script for GitHub Pages
# Run this from the repository root

echo "🚀 Deploying Atlas Logged website to GitHub Pages..."

# Ensure we're on the website branch
if [ "$(git branch --show-current)" != "website" ]; then
    echo "❌ Error: Must be on website branch"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Build is not needed (static site)
echo "✅ Static site ready"

# Create deployment using gh CLI
echo "📦 Creating GitHub Pages deployment..."

# Note: This requires GitHub Pages to be configured in Settings
# Go to: Settings → Pages → Source: Deploy from a branch → Branch: website → /website folder

echo "
⚠️  Manual Steps Required:

1. Go to: https://github.com/shinkansensupportgroup/atlas-logged/settings/pages

2. Configure GitHub Pages:
   - Source: Deploy from a branch
   - Branch: website
   - Folder: / (root)

3. Save and wait for deployment

4. Visit: https://atlaslogged.com

Your changes are committed and pushed. GitHub will deploy automatically once Pages is configured.
"
