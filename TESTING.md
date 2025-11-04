# Testing Guide

## Overview

This project has comprehensive E2E tests, but they run **locally before commits** rather than in CI/CD (too slow for automatic deployment).

## Quick Start

### Before Making Landing Page Changes:

```bash
# 1. Make your changes to HTML/CSS/JS

# 2. Run E2E tests locally (5-10 minutes)
npm run test:e2e:chromium

# 3. If tests pass, commit and push
git add .
git commit -m "Your changes"
git push
```

## Test Commands

### E2E Tests (Playwright)

```bash
# Run all critical landing page tests (Chromium only - faster)
npm run test:e2e:chromium

# Run all tests (all browsers - slower)
npm run test:e2e

# Run specific test file
npm run test:e2e:chromium -- test/e2e/cookie-consent.spec.js
npm run test:e2e:chromium -- test/e2e/navigation.spec.js

# Interactive mode (great for debugging)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# View last test report
npm run test:e2e:report
```

### API Tests (Jest)

```bash
# Run API tests (for roadmap backend)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Coverage

### ✅ Landing Page Tests (run before commits)

**Cookie Consent** (12 tests)
- Banner display and interactions
- Accept/reject flows
- Chat placeholder when rejected
- Re-enable cookies functionality
- Privacy policy links
- Mobile responsiveness

**Navigation** (20+ tests)
- Desktop navigation
- Mobile hamburger menu
- Keyboard navigation
- Accessibility
- Touch targets

**Core Pages** (30+ tests)
- Homepage load and content
- Privacy policy page
- Location FAQ page
- SEO and meta tags
- Responsive design
- Performance (<5s load)

**Accessibility** (25+ tests)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Focus indicators
- ARIA attributes
- Screen reader support
- Color contrast

### ⚠️ API Tests (informational only)

These test the roadmap backend (Google Apps Script). They can fail without blocking landing page deployment.

## CI/CD Workflow

### What Runs Automatically in CI:

```yaml
On every push to main:
├── Check HTML syntax (DOCTYPE present)
├── Check required files exist (index.html, privacy.html, etc.)
├── Check for obvious JS typos
└── Deploy to GitHub Pages (~30 seconds)
```

**Why minimal checks?**
- ✅ Fast (~30 seconds total)
- ✅ Catches critical errors (missing files, broken HTML)
- ✅ Doesn't slow down content updates
- ✅ Real functionality tested locally before push

### What Runs Manually (Before Big Changes):

```bash
Before making landing page changes:
└── Run E2E tests locally (5-10 minutes)
```

## When to Run Tests

### Always Run E2E Tests For:

- ✅ Cookie consent changes
- ✅ Navigation/menu changes
- ✅ New pages or features
- ✅ CSS/styling that affects layout
- ✅ JavaScript functionality changes

### Don't Need to Run E2E Tests For:

- ❌ Content updates (text changes)
- ❌ Image replacements
- ❌ Small CSS tweaks (colors, spacing)
- ❌ README/documentation changes

## Troubleshooting

### Tests are slow

```bash
# Run only Chromium (fastest)
npm run test:e2e:chromium

# Run specific test file
npm run test:e2e:chromium -- test/e2e/cookie-consent.spec.js
```

### Tests fail locally

```bash
# View test report with screenshots
npm run test:e2e:report

# Run in headed mode to see what's happening
npm run test:e2e:headed

# Run in interactive UI mode for debugging
npm run test:e2e:ui
```

### Need to update tests

Test files are in `test/e2e/`:
- `cookie-consent.spec.js` - Cookie banner and chat placeholder
- `navigation.spec.js` - Navigation and mobile menu
- `core-pages.spec.js` - Homepage, privacy, FAQ
- `accessibility.spec.js` - WCAG compliance

## Best Practices

1. **Run tests locally before pushing** - Catches issues early
2. **Use headed mode for debugging** - See what's happening
3. **Keep tests fast** - Only test critical functionality
4. **Update tests when UI changes** - Keep them in sync

## CI Sanity Checks

The CI runs minimal sanity checks before deployment (takes ~5 seconds):

### What CI Checks:

1. **HTML Structure** - Ensures `<!DOCTYPE html>` is present
2. **Required Files** - Verifies critical files exist:
   - `index.html`
   - `privacy.html`
   - `css/style.css`
   - `js/main.js`
   - `js/cookie-consent.js`
   - `CNAME`
3. **JS Typos** - Looks for common typos like `console.eror`, `fucntion`, etc.

### Why These Checks?

- **Fast** - Adds only ~5 seconds to deployment
- **Catches accidents** - Deleted files, broken merges, obvious typos
- **No false positives** - Only fails on critical errors
- **Doesn't replace testing** - Real functionality still tested locally

### If CI Fails:

```bash
# Check what failed in GitHub Actions
https://github.com/shinkansensupportgroup/atlas-logged-website/actions

# Fix the issue locally
# Re-run to verify
git push origin main
```

## Questions?

- Test suite documentation: `test/TESTING-PLAN.md`
- Playwright docs: https://playwright.dev
- Jest docs: https://jestjs.io
