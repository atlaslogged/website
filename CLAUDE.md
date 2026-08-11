# CLAUDE.md

## Project overview

Atlas Logged's public site is a static vanilla HTML/CSS/JavaScript website served at `atlaslogged.com`. There is no build step or framework. The current design is an editorial paper-and-ink travel journal with ruled panels, system fonts, restrained motion, and accessible native controls.

The `/atlas/` directory is a separate globe/data-viewer application. Do not apply marketing-site redesigns to it.

## Local development

```bash
npm install
npm run dev
# http://localhost:8000
```

## Safe validation

```bash
npm test
```

The default Playwright smoke suite mocks roadmap data and disables support chat network loading. It is safe for routine local validation.

The following commands can mutate live external state or publish code and must not be used as routine checks:

- `npm run test:api-live`
- `npm run test:e2e:voting`
- `npm run test:e2e:submission`
- `npm run test:e2e:cleanup`
- `npm run cleanup:test-features`
- `npm run apps-script:push`
- `npm run apps-script:deploy`
- `deploy.sh`

## Architecture

- `css/style.css` — shared semantic tokens, page shell, components, responsive rules, support consent UI
- `css/changelog.css` — generated release-ledger presentation
- `js/main.js` — reduced-motion-aware anchors and accessible mobile navigation
- `js/cookie-consent.js` — sole consent-gated Chatwoot loader
- `js/roadmap-api.js` — safe DOM rendering, voting, submission, and dialog behavior
- `test/e2e/site-smoke.spec.js` — deterministic safe local smoke suite

Root HTML pages intentionally duplicate the small static shell. Keep these elements consistent:

- skip link and `main#main-content`
- `#mobileBackdrop`, `#hamburger`, and `#navLinks`
- one accurate `aria-current="page"` where the route appears in navigation
- local `assets/app-store-badge.svg`
- `js/cookie-consent.js` before `js/main.js`
- 2026 footer and App Store ID `6538725214`

Prefer semantic native HTML such as `<details>/<summary>`, labelled `<nav>`, and real buttons. Keep 44px touch targets, focus visibility, keyboard operation, and reduced-motion behavior.

## Changelog source of truth

The website `changelog.html` is generated. Durable changes belong in the app repository:

- `.github/scripts/changelog-template-start-new.html`
- `.github/scripts/changelog-template-end.html`
- `.github/scripts/generate-changelog-html.js`

The generator must:

- exclude `published: false` releases;
- escape changelog text and constrain media URLs;
- preserve version deep-link IDs;
- emit native `<details>/<summary>` sections with only the newest published release open.

Regenerate locally from the website working directory. Do not trigger the sync workflow merely to preview changes.

## Consent and privacy

Chatwoot must never be embedded directly in a page. Every page uses `js/cookie-consent.js`; the support SDK loads only after the consent logic permits it. Preserve the in-app `?consent=chat` flow and the rejected-consent placeholder.

The canonical App Store privacy URL is:

`https://atlaslogged.com/privacy.html`

## Deployment

GitHub Pages publication, pushing a branch, Apps Script deployment, and live roadmap mutations are outward-facing actions. Preview and verify locally first, then obtain explicit approval before publishing.
