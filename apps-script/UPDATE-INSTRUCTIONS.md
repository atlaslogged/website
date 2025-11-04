# How to Update Apps Script

After making changes to `Code.gs`, you need to update your deployed Apps Script.

## Option 1: Automated with Clasp (Recommended)

If you've set up clasp (see [CLASP-SETUP.md](./CLASP-SETUP.md)):

```bash
cd apps-script
clasp push
clasp deploy --description "Your update description"
```

Done! ✅

## Option 2: Manual Deployment

If you haven't set up clasp yet, follow these steps:

1. **Open your Apps Script:**
   - Go to https://script.google.com
   - Open "Atlas Logged - Roadmap & Features"

2. **Replace the code:**
   - Select all existing code (Cmd+A)
   - Delete it
   - Open `/apps-script/Code.gs` in VS Code
   - Copy all the code (Cmd+A, Cmd+C)
   - Paste into Apps Script (Cmd+V)

3. **Save:**
   - Click Save (Cmd+S or disk icon)

4. **Deploy new version:**
   - Click Deploy → Manage deployments
   - Click ✏️ Edit (pencil icon) next to your deployment
   - Under "Version", select "New version"
   - Click Deploy
   - Copy the new URL (if it changed)

**NOTE:** The URL usually stays the same, but if it changes, update it in `/js/roadmap-api.js` on line 6!

## What Changed in This Update:

### CORS Fix (CRITICAL):
- Added `doOptions()` function to handle CORS preflight requests
- Added CORS headers to all responses:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- Fixes "Submission failed" error when submitting features from atlaslogged.com
- **Required for feature submission to work!**

### Unvoting Feature:
- Added `handleUnvote()` function for removing votes
- Modified `doGet()` to handle 'unvote' action
- Users can now click "✅ Voted" to unvote
- Vote count decrements in Google Sheet
- localStorage updated to remove vote

### Server-Side Caching:
- Added smart caching to `doGet()` - feature list cached for 5 minutes
- Cache automatically invalidated when:
  - Someone votes (`handleVote`)
  - Someone unvotes (`handleUnvote`)
  - New feature submitted (`doPost`)
- Reduces Google Sheets reads by ~90%
- Faster API responses (cache hits return instantly)
- Standard practice for Apps Script APIs
