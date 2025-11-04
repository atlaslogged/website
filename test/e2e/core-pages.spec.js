const { test, expect } = require('@playwright/test');

/**
 * Core Pages E2E Tests
 * Tests for privacy policy, FAQ, changelog, and other static pages
 */

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Atlas Logged/);

    // Hero section should be visible
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();

    // Logo should be visible
    const logo = page.locator('.hero-logo');
    await expect(logo).toBeVisible();

    // Main heading should be present
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Atlas Logged');
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    // Should have heading
    const heading = featuresSection.locator('h2');
    await expect(heading).toBeVisible();

    // Should have feature cards
    const featureCards = page.locator('.feature');
    const count = await featureCards.count();
    expect(count).toBeGreaterThanOrEqual(6); // 6 feature cards
  });

  test('should have App Store download link', async ({ page }) => {
    await page.goto('/');

    const appStoreLink = page.locator('a[href*="apps.apple.com"]').first();
    await expect(appStoreLink).toBeVisible();

    // Should have proper attributes
    await expect(appStoreLink).toHaveAttribute('target', '_blank');
    await expect(appStoreLink).toHaveAttribute('rel', /noopener/);
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Footer should have links
    const footerLinks = footer.locator('a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(3);

    // Copyright text should be present
    await expect(footer).toContainText('2025 Atlas Logged');
  });
});

test.describe('Privacy Policy Page', () => {
  test('should load privacy policy page', async ({ page }) => {
    await page.goto('/privacy.html');

    // Check page title
    await expect(page).toHaveTitle(/Privacy/);

    // Main heading should be present
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Privacy');
  });

  test('should have navigation bar', async ({ page }) => {
    await page.goto('/privacy.html');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Should be able to navigate back to home
    const homeLink = page.locator('nav a[href="index.html"]');
    await expect(homeLink).toBeVisible();
  });

  test('should display privacy policy content', async ({ page }) => {
    await page.goto('/privacy.html');

    // Should have privacy section
    const privacySection = page.locator('.privacy');
    await expect(privacySection).toBeVisible();

    // Should have policy content
    const policyContent = page.locator('.policy-content');
    await expect(policyContent).toBeVisible();

    // Should mention key privacy concepts
    const content = await page.textContent('body');
    expect(content).toMatch(/data|privacy|information/i);
  });

  test('should have proper document structure', async ({ page }) => {
    await page.goto('/privacy.html');

    // Should have semantic HTML
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Should have proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Only one h1
  });
});

test.describe('Location FAQ Page', () => {
  test('should load FAQ page', async ({ page }) => {
    await page.goto('/location-faq.html');

    // Check page title
    await expect(page).toHaveTitle(/Location|FAQ/);

    // Main heading should be present
    const h2 = page.locator('h2').first();
    await expect(h2).toBeVisible();
  });

  test('should display FAQ items', async ({ page }) => {
    await page.goto('/location-faq.html');

    // Should have FAQ items
    const faqItems = page.locator('.faq-item');
    const count = await faqItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should expand FAQ accordion when clicked', async ({ page }) => {
    await page.goto('/location-faq.html');

    // Find first FAQ question
    const firstQuestion = page.locator('.faq-question').first();
    await expect(firstQuestion).toBeVisible();

    // Should be collapsible/expandable
    await expect(firstQuestion).toHaveAttribute('aria-expanded');

    // Click to expand
    await firstQuestion.click();

    // Parent should have 'open' class
    const parent = firstQuestion.locator('..');
    await expect(parent).toHaveClass(/open/);

    // Answer should be visible
    const answer = parent.locator('.faq-answer');
    await expect(answer).toBeVisible();
  });

  test('should support keyboard navigation for FAQ', async ({ page }) => {
    await page.goto('/location-faq.html');

    const firstQuestion = page.locator('.faq-question').first();

    // Should be focusable
    await firstQuestion.focus();
    await expect(firstQuestion).toBeFocused();

    // Should activate with Enter key
    await page.keyboard.press('Enter');

    // Should expand
    const parent = firstQuestion.locator('..');
    await expect(parent).toHaveClass(/open/);
  });

  test('should close other FAQs when opening one', async ({ page }) => {
    await page.goto('/location-faq.html');

    const faqQuestions = page.locator('.faq-question');
    const count = await faqQuestions.count();

    if (count > 1) {
      // Open first FAQ
      await faqQuestions.nth(0).click();
      const first = faqQuestions.nth(0).locator('..');
      await expect(first).toHaveClass(/open/);

      // Open second FAQ
      await faqQuestions.nth(1).click();
      const second = faqQuestions.nth(1).locator('..');
      await expect(second).toHaveClass(/open/);

      // First should close (accordion behavior)
      await expect(first).not.toHaveClass(/open/);
    }
  });
});

test.describe('Changelog Page', () => {
  test('should load changelog page if it exists', async ({ page }) => {
    const response = await page.goto('/changelog.html');

    if (response.status() === 200) {
      // Page exists, verify content
      const h1 = page.locator('h1, h2').first();
      await expect(h1).toBeVisible();

      // Should have navigation
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    } else {
      // Page doesn't exist yet, that's okay
      expect(response.status()).toBe(404);
    }
  });
});

test.describe('Roadmap Page', () => {
  test('should load roadmap page if it exists', async ({ page }) => {
    const response = await page.goto('/roadmap.html');

    if (response.status() === 200) {
      // Page exists, verify content
      const h1 = page.locator('h1, h2').first();
      await expect(h1).toBeVisible();

      // Should have navigation
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    } else {
      // Page doesn't exist yet, that's okay
      expect(response.status()).toBe(404);
    }
  });
});

test.describe('Core Pages Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should render homepage properly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Hero should be visible
      await expect(page.locator('.hero')).toBeVisible();

      // Features should be visible
      await expect(page.locator('#features')).toBeVisible();

      // Footer should be visible
      await expect(page.locator('footer')).toBeVisible();

      // Check for horizontal scroll (shouldn't exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`should render privacy page properly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/privacy.html');

      // Main content should be visible
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags on homepage', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    const hasKeywords = await metaKeywords.count();
    expect(hasKeywords).toBeGreaterThan(0);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('should have canonical URL', async ({ page }) => {
    await page.goto('/');

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /atlaslogged\.com/);
  });

  test('should have favicon', async ({ page }) => {
    await page.goto('/');

    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', /.+/);
  });

  test('should have Apple Smart App Banner meta tag', async ({ page }) => {
    await page.goto('/');

    const appBanner = page.locator('meta[name="apple-itunes-app"]');
    await expect(appBanner).toHaveAttribute('content', /app-id/);
  });
});

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    // Wait for hero to be visible
    await page.locator('.hero').waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5 seconds
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for JS to execute

    // Filter out known external errors (Chatwoot, ads, etc.)
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('chatwoot') &&
      !error.includes('third-party') &&
      !error.includes('extension')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
