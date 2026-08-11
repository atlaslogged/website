// The Atlas theme contract, asserted from the browser.
//
// css/theme.css and js/theme.js are shared VERBATIM with atlascodes.ai and
// ovm.sh; scripts/check-theme-contract.sh proves the bytes still match. This
// suite proves the other half — that this site actually wires them up, on
// every page, and that no page has drifted back to a hard-coded palette.
//
// Drift is the real risk here: the static shell is duplicated across eight root
// HTML files, so a change applied to seven of them looks completely fine until
// someone opens the eighth.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const publicRoutes = [
  '/',
  '/privacy.html',
  '/location-faq.html',
  '/multi-device-faq.html',
  '/changelog.html',
  '/roadmap.html',
  '/welcome.html',
  '/roadmapv0.html'
];

const THEMES = ['white', 'black', 'paper'];
const THEME_COLORS = { white: '#ffffff', black: '#11100e', paper: '#f3eee4' };

async function preparePage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('chatwoot-consent', 'rejected');
  });
  await page.route('https://app.chatwoot.com/**', (route) => route.abort());
  await page.route('https://api.country.is/**', (route) => route.abort());
  await page.route('https://script.google.com/macros/s/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":[]}' })
  );
}

test.describe('atlas theme contract', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const route of publicRoutes) {
    test(`${route} loads the contract and resolves its tokens`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('script[src="js/theme.js"]')).toBeAttached();
      await expect(page.locator('link[href="css/theme.css"]')).toBeAttached();
      await expect(page.locator('link[href="css/fonts.css"]')).toBeAttached();

      // The bar, not just the stylesheet: chrome and palette travel together.
      await expect(page.locator('header.atlas-bar .sig')).toBeVisible();
      await expect(page.locator('header.atlas-bar [data-theme-cycle]')).toBeAttached();

      const tokens = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return ['--canvas', '--surface', '--text', '--text-muted', '--rule', '--action']
          .map((name) => [name, style.getPropertyValue(name).trim()]);
      });
      for (const [name, value] of tokens) {
        expect(value, `${route} ${name}`).not.toBe('');
      }
    });
  }

  test('the cycle walks white to black to paper and persists the choice', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const cycle = page.locator('[data-theme-cycle]');
    await expect(html).toHaveAttribute('data-theme', 'white');

    for (const expected of ['black', 'paper', 'white']) {
      await cycle.click();
      await expect(html).toHaveAttribute('data-theme', expected);
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
        'content',
        THEME_COLORS[expected]
      );
    }

    await cycle.click();
    expect(await page.evaluate(() => localStorage.getItem('atlas-theme'))).toBe('black');

    // The choice has to survive a navigation, or it is a toggle, not a theme.
    await page.goto('/privacy.html');
    await expect(html).toHaveAttribute('data-theme', 'black');
  });

  test('every theme repaints the page rather than only the toggle', async ({ page }) => {
    await page.goto('/');
    const seen = new Set();
    for (const theme of THEMES) {
      // Set and read in separate tasks. Changing a custom property on :root
      // does not synchronously refresh a descendant's computed style in
      // Chromium, so reading in the same evaluate() reports the previous
      // theme's paint and the assertion fires on an artefact.
      await page.evaluate((value) => window.AtlasTheme.set(value), theme);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      const painted = await page.evaluate(() => {
        const body = getComputedStyle(document.body).backgroundColor;
        const bar = getComputedStyle(document.querySelector('.atlas-bar')).backgroundColor;
        const text = getComputedStyle(document.querySelector('h1')).color;
        return [body, bar, text].join('|');
      });
      expect(seen.has(painted), `${theme} repeats an earlier theme (${painted})`).toBe(false);
      seen.add(painted);
    }
  });

  test('no page ships a stale hard-coded theme-color', async () => {
    const root = path.join(__dirname, '..', '..');
    for (const route of publicRoutes) {
      const file = route === '/' ? 'index.html' : route.replace(/^\//, '');
      const html = fs.readFileSync(path.join(root, file), 'utf8');
      const matches = [...html.matchAll(/<meta name="theme-color" content="([^"]+)">/g)];
      expect(matches.length, `${file} theme-color count`).toBe(1);
      // Only the contract's default may appear in markup; theme.js owns the rest.
      expect(matches[0][1].toLowerCase(), `${file} theme-color`).toBe('#ffffff');
    }
  });

  test('site stylesheets compose tokens instead of hard-coding colour', async () => {
    const cssDir = path.join(__dirname, '..', '..', 'css');
    // theme.css IS the palette and fonts.css carries no colour at all.
    for (const file of ['style.css', 'changelog.css']) {
      const source = fs.readFileSync(path.join(cssDir, file), 'utf8');
      const literals = source.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
      expect(literals, `${file} hard-coded colours`).toEqual([]);
    }
  });
});
