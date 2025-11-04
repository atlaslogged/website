# Clasp Setup Guide

This guide shows you how to connect your local `apps-script/` folder to your Google Apps Script project, eliminating the need for manual copy/paste.

## What is Clasp?

**clasp** (Command Line Apps Script Projects) is the official CLI tool from Google that lets you:
- ✅ Push local code changes directly to Apps Script
- ✅ Pull changes made in the web editor back to your local files
- ✅ Deploy new versions from command line
- ✅ Keep everything in version control (git)

## One-Time Setup

### 1. Install Clasp

```bash
# Install globally via npm
npm install -g @google/clasp

# Verify installation
clasp --version
```

### 2. Login to Google

```bash
# This opens browser for OAuth
clasp login

# You'll authorize clasp to access your Google account
# It stores credentials in ~/.clasprc.json
```

### 3. Get Your Script ID

1. Open https://script.google.com
2. Open your "Atlas Logged - Roadmap & Features" project
3. Click **Project Settings** (gear icon in left sidebar)
4. Copy the **Script ID** (looks like: `1a2b3c4d5e6f7g8h9i0j`)

### 4. Create .clasp.json

In your `atlas-logged-website/apps-script/` folder, create `.clasp.json`:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "."
}
```

Replace `YOUR_SCRIPT_ID_HERE` with the actual Script ID from step 3.

### 5. Create .claspignore

Create `apps-script/.claspignore` to exclude files from upload:

```
# Don't upload these files to Apps Script
*.md
.clasp.json
.claspignore
package.json
package-lock.json
node_modules/
```

## Daily Workflow

### Push Local Changes to Apps Script

```bash
cd apps-script

# Push your Code.gs changes
clasp push

# Apps Script is now updated!
```

### Deploy New Version

```bash
# After pushing, deploy via command line:
clasp deploy --description "Added CORS support and caching"

# Or deploy via web UI as before
```

### Pull Changes from Apps Script

If you or someone else edits code in the web UI:

```bash
cd apps-script

# Pull latest changes
clasp pull

# Your local Code.gs is now updated
```

### Check Deployment Status

```bash
# View all deployments
clasp deployments

# View latest version info
clasp versions
```

## Automated Git Workflow

Once clasp is set up, your workflow becomes:

```bash
# 1. Edit Code.gs locally in VS Code
vim apps-script/Code.gs

# 2. Push to Apps Script
cd apps-script
clasp push

# 3. Deploy new version (optional - or use web UI)
clasp deploy --description "Your changes here"

# 4. Commit to git
cd ..
git add apps-script/Code.gs
git commit -m "Updated Apps Script with new features"
git push origin main
```

## Benefits

### Before (Manual):
1. Edit `Code.gs` locally
2. Commit to git
3. Open Apps Script web editor
4. Copy entire file
5. Paste into web editor
6. Save
7. Deploy → Manage deployments → Edit → New version → Deploy

### After (Clasp):
1. Edit `Code.gs` locally
2. `clasp push` (done!)
3. Commit to git

## Troubleshooting

### "User has not enabled the Apps Script API"

1. Go to https://script.google.com/home/usersettings
2. Turn on **"Google Apps Script API"**
3. Try `clasp login` again

### "Project not found"

Check your Script ID in `.clasp.json` matches your actual project.

### "Manifest file has been updated"

Run `clasp pull` first to sync the manifest, then `clasp push` your changes.

## Alternative: GitHub Actions (Advanced)

You can automate deployments with GitHub Actions:

```yaml
# .github/workflows/deploy-apps-script.yml
name: Deploy Apps Script

on:
  push:
    paths:
      - 'apps-script/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @google/clasp
      - run: echo "$CLASP_CREDENTIALS" > ~/.clasprc.json
        env:
          CLASP_CREDENTIALS: ${{ secrets.CLASP_CREDENTIALS }}
      - run: cd apps-script && clasp push
```

This auto-deploys whenever you push to `apps-script/` folder!

## Resources

- Official docs: https://github.com/google/clasp
- Apps Script API: https://script.google.com/home/usersettings
- Clasp commands: https://github.com/google/clasp/blob/master/docs/README.md
