const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const outputDirectory = path.resolve(__dirname, '../../draft-review');
const routes = [
  { name: 'home', path: '/' },
  { name: 'privacy', path: '/privacy.html' },
  { name: 'changelog', path: '/changelog.html' },
  { name: 'roadmap', path: '/roadmap.html' }
];
const roadmapFeatures = [
  { id: 1, title: 'Dark Mode', description: 'A lower-light interface for reviewing travel history.', votes: 18, status: 'Under Review', submitted: '2026-07-01' },
  { id: 2, title: 'Year in Review', description: 'A private annual summary of the places and days that mattered.', votes: 42, status: 'Prioritising', submitted: '2026-06-01' },
  { id: 3, title: 'Visa Tracking', description: 'Track time against visa limits without sending trip data away.', votes: 27, status: 'Planned', submitted: '2026-05-01' },
  { id: 4, title: 'Photo Integration', description: 'Add local context from photo dates and locations.', votes: 33, status: 'In Progress', submitted: '2026-04-01' },
  { id: 5, title: 'Mac App', description: 'A larger private view of your travel history.', votes: 29, status: 'Exploring', submitted: '2026-03-01' },
  { id: 6, title: 'Map View', description: 'Review visited places on a private map.', votes: 51, status: 'Completed', submitted: '2026-02-01' }
];

async function prepare(page) {
  await page.addInitScript(() => localStorage.setItem('chatwoot-consent', 'accepted'));
  await page.route('https://script.google.com/macros/s/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: roadmapFeatures })
  }));
  await page.route('https://app.chatwoot.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'window.chatwootSDK={run:function(){}};'
  }));
  await page.route('https://api.country.is/**', (route) => route.abort());
}

test('capture local redesign draft', async ({ page }) => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  await prepare(page);

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.path, { waitUntil: 'networkidle' });
      if (route.name === 'roadmap') await expect(page.locator('[data-feature-id="1"]')).toBeVisible();
      await page.screenshot({
        path: path.join(outputDirectory, `${route.name}-${viewport.name}.png`),
        fullPage: true
      });
    }
  }
});
