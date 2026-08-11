# Atlas Logged public website

Static marketing, policy, support, changelog, and roadmap pages for [atlaslogged.com](https://atlaslogged.com).

## Design and architecture

- Vanilla HTML, CSS, and JavaScript; no build step.
- Shared paper-and-ink travel-journal design in `css/style.css`.
- Changelog-specific generated-content styles in `css/changelog.css`.
- Shared progressive enhancement in `js/main.js`.
- Consent-gated Chatwoot support in `js/cookie-consent.js`.
- Live Google Apps Script roadmap integration in `js/roadmap-api.js`.
- Checked-in App Store badge and authentic app screenshots under `assets/`.

The `/atlas/` directory is a separate globe/data-viewer application and is not part of the marketing-site shell.

## Public pages

- `index.html` — product homepage
- `privacy.html` — canonical App Store privacy policy
- `location-faq.html` — location, permission, and battery FAQ
- `multi-device-faq.html` — supporting multi-device FAQ (`noindex`)
- `changelog.html` — generated published release ledger
- `roadmap.html` — live roadmap, voting, and suggestion form
- `welcome.html` — supporting welcome/video page (`noindex`)
- `roadmapv0.html` — legacy redirect-style information page (`noindex`)

## Local development

```bash
npm install
npm run dev
# Visit http://localhost:8000
```

The site can also be served directly with:

```bash
python3 -m http.server 8000
```

## Safe local tests

```bash
npm test
```

The default test command runs `test/e2e/site-smoke.spec.js` in Chromium. It mocks the roadmap API, sets support consent to rejected, and does not vote, submit, delete, deploy, or contact Chatwoot.

### Live-service tests

The historical API and broader E2E suites can mutate the production roadmap service. Run them only when that external effect is intentional:

```bash
npm run test:api-live
npm run test:e2e:voting
npm run test:e2e:submission
npm run test:e2e:cleanup
```

`apps-script:push`, `apps-script:deploy`, cleanup, voting, submission, and benchmark commands are outward-facing operations. Do not use them as routine validation.

## Changelog generation

`changelog.html` is generated from the app repository's published changelog entries. Its canonical source lives in the app repository:

- `.github/scripts/changelog-template-start-new.html`
- `.github/scripts/changelog-template-end.html`
- `.github/scripts/generate-changelog-html.js`

For a local draft, run the generator while the website directory is the working directory:

```bash
cd /path/to/website
node /path/to/atlas-logged/.github/scripts/generate-changelog-html.js
```

The generator excludes entries with `published: false`, escapes generated text, and emits native `<details>/<summary>` disclosures.

## Customer support consent

`js/cookie-consent.js` is the only Chatwoot loader on public pages.

- `?consent=chat` or the `AtlasLogged/` app user agent records consent and opens chat.
- Returning accepted visitors load Chatwoot.
- Returning rejected visitors see a reversible support placeholder.
- New visitors in configured consent regions see a choice before Chatwoot loads.
- Country detection is cached in `sessionStorage` for one hour; lookup failure defaults to asking for consent.

Manual helpers are available in the browser console:

```javascript
ChatwootConsent.getStatus()
ChatwootConsent.accept()
ChatwootConsent.reject()
ChatwootConsent.reset()
ChatwootConsent.clearGeoCache()
```

## Deployment

The repository is served through GitHub Pages at `atlaslogged.com`. Pushing to the deployment branch is an external publish action. Preview locally and obtain approval before pushing or changing Pages settings.

Do not use the legacy `deploy.sh` script.

## App Store identity

- App Store ID: `6538725214`
- Product page: `https://apps.apple.com/us/app/atlas-logged/id6538725214`
- Privacy policy: `https://atlaslogged.com/privacy.html`

## Support

- Email: `support@atlascodes.ai`
- Privacy policy: <https://atlaslogged.com/privacy.html>
- FAQ: <https://atlaslogged.com/location-faq.html>
