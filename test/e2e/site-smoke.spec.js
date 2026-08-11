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

const roadmapFeatures = [
  { id: 1, title: 'Dark Mode', description: 'A lower-light interface.', votes: 18, status: 'Under Review', submitted: '2026-07-01' },
  { id: 2, title: 'Year in Review', description: 'A private annual travel summary.', votes: 42, status: 'Prioritising', submitted: '2026-06-01' },
  { id: 3, title: 'Visa Tracking', description: 'Track time against visa limits.', votes: 27, status: 'Planned', submitted: '2026-05-01' },
  { id: 4, title: 'Photo Integration', description: 'Add context from photo metadata.', votes: 33, status: 'In Progress', submitted: '2026-04-01' },
  { id: 5, title: 'Mac App', description: 'A desktop travel-history companion.', votes: 29, status: 'Exploring', submitted: '2026-03-01' },
  { id: 6, title: 'Map View', description: 'Review visited places on a map.', votes: 51, status: 'Completed', submitted: '2026-02-01' }
];

async function preparePage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('chatwoot-consent', 'rejected');
  });
  await page.route('https://script.google.com/macros/s/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: roadmapFeatures })
    });
  });
  await page.route('https://app.chatwoot.com/**', (route) => route.abort());
  await page.route('https://api.country.is/**', (route) => route.abort());
}

test.describe('redesigned public site', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const route of publicRoutes) {
    test(`${route} uses the shared accessible shell`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response.status()).toBe(200);
      await expect(page.locator('a.skip-to-content')).toHaveAttribute('href', '#main-content');
      await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
      await expect(page.locator('#hamburger')).toHaveAttribute('aria-controls', 'navLinks');
      await expect(page.locator('#mobileBackdrop')).toBeAttached();
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.locator('footer')).toContainText('2026 Atlas Logged');
      expect(await page.locator('nav [aria-current="page"]').count()).toBeLessThanOrEqual(1);
      await expect(page.locator('a[href*="id6538725214"]').first()).toBeAttached();
    });
  }

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 }
  ]) {
    test(`core pages do not overflow at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const route of ['/', '/privacy.html', '/location-faq.html', '/changelog.html', '/roadmap.html']) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} overflow`).toBeLessThanOrEqual(1);
      }
    });
  }

  test('skip link moves keyboard focus to main content', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-to-content');
    await skipLink.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('homepage and FAQ use native disclosures', async ({ page }) => {
    await page.goto('/');
    const homepageQuestion = page.locator('.faq-preview details').first();
    await expect(homepageQuestion).not.toHaveAttribute('open', '');
    await homepageQuestion.locator('summary').click();
    await expect(homepageQuestion).toHaveAttribute('open', '');

    await page.goto('/location-faq.html');
    const faq = page.locator('details.faq-item').first();
    await faq.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(faq).toHaveAttribute('open', '');
  });

  test('changelog contains only published native release disclosures', async ({ page }) => {
    await page.goto('/changelog.html');
    const releases = page.locator('details.version-section');
    expect(await releases.count()).toBeGreaterThan(0);
    await expect(releases.first()).toHaveAttribute('open', '');
    await expect(page.locator('#v1\\.2\\.0')).toHaveCount(0);
    await expect(page.locator('[onclick*="toggleVersion"]')).toHaveCount(0);
  });

  test('mobile menu stays out of the tab order when closed, traps focus when open, and restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const trigger = page.locator('#hamburger');
    const menu = page.locator('#navLinks');
    expect(await menu.evaluate((element) => element.inert)).toBe(true);

    await trigger.focus();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.closest('#navLinks') !== null)).toBe(false);

    await trigger.focus();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await menu.evaluate((element) => element.inert)).toBe(false);
    await expect(page.locator('#mobileBackdrop')).toHaveClass(/active/);
    await expect(page.locator('#navLinks a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(await menu.evaluate((element) => element.inert)).toBe(true);
    await expect(trigger).toBeFocused();
  });

  test('multi-device media respects reduced motion and can be paused', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/multi-device-faq.html');
    const video = page.locator('[data-autoplay-media]');
    await expect(video).toHaveAttribute('controls', '');
    expect(await video.evaluate((element) => element.paused)).toBe(true);
  });

  test('rejected support cookies do not contact Chatwoot and remain reversible', async ({ page }) => {
    let chatwootRequests = 0;
    page.on('request', (request) => {
      if (request.url().startsWith('https://app.chatwoot.com/')) chatwootRequests += 1;
    });
    await page.goto('/');
    const placeholder = page.locator('#chat-placeholder');
    await expect(placeholder).toBeVisible();
    await placeholder.click();
    await expect(page.locator('#chat-placeholder-tooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#chat-placeholder-tooltip')).toBeHidden();
    expect(chatwootRequests).toBe(0);
  });

  test('roadmap renders safe remote text and provides an accessible dialog', async ({ page }) => {
    await page.goto('/roadmap.html');
    await expect(page.locator('[data-feature-id="1"]')).toContainText('Dark Mode');
    await expect(page.locator('[data-feature-id="1"]')).not.toContainText('<script>');
    await expect(page.locator('.delivered-card')).toContainText('Map View');

    const opener = page.locator('#openModal');
    await opener.click();
    await expect(page.locator('#featureModal')).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('#feature-title')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#featureModal')).toHaveAttribute('aria-hidden', 'true');
    await expect(opener).toBeFocused();
  });
});
