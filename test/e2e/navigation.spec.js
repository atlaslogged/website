const { test, expect } = require('@playwright/test');

/**
 * Navigation E2E Tests
 * Tests navigation functionality including mobile hamburger menu
 */

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main navigation links', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify all navigation links exist
    await expect(page.locator('nav a[href="index.html"]')).toBeVisible();
    await expect(page.locator('nav a[href="#features"]')).toBeVisible();
    await expect(page.locator('nav a[href="privacy.html"]')).toBeVisible();
    await expect(page.locator('nav a[href="location-faq.html"]')).toBeVisible();

    // Verify download button
    const downloadBtn = page.locator('nav a[href*="apps.apple.com"]');
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toContainText('Download');
  });

  test('should navigate to features section when clicking features link', async ({ page }) => {
    const featuresLink = page.locator('nav a[href="#features"]');
    await featuresLink.click();

    // Should scroll to features section
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeInViewport();
  });

  test('should navigate to privacy policy page', async ({ page }) => {
    const privacyLink = page.locator('nav a[href="privacy.html"]').first();
    await privacyLink.click();

    // Should navigate to privacy page
    await expect(page).toHaveURL(/privacy\.html/);
    await expect(page.locator('h1')).toContainText('Privacy');
  });

  test('should navigate to location FAQ page', async ({ page }) => {
    const faqLink = page.locator('nav a[href="location-faq.html"]').first();
    await faqLink.click();

    // Should navigate to FAQ page
    await expect(page).toHaveURL(/location-faq\.html/);
  });

  test('should have glassmorphism effect on navigation', async ({ page }) => {
    const nav = page.locator('nav');

    // Check for backdrop-filter CSS property (glassmorphism)
    const backdropFilter = await nav.evaluate(el =>
      window.getComputedStyle(el).backdropFilter
    );

    expect(backdropFilter).toBeTruthy();
  });

  test('should show brand logo and name', async ({ page }) => {
    const logo = page.locator('.nav-logo');
    const brandName = page.locator('.brand-name');

    await expect(logo).toBeVisible();
    await expect(brandName).toBeVisible();
    await expect(brandName).toContainText('Atlas Logged');
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toBeVisible();

    // Navigation links should be hidden initially
    const navLinks = page.locator('#navLinks');
    const isVisible = await navLinks.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.right >= 0; // Check if within viewport
    });
    expect(isVisible).toBe(false);
  });

  test('should open mobile menu when clicking hamburger', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    const navLinks = page.locator('#navLinks');

    // Click hamburger to open menu
    await hamburger.click();

    // Menu should slide in
    await expect(navLinks).toHaveClass(/active/);
    await expect(navLinks).toBeVisible();

    // Hamburger should show active state (X icon)
    await expect(hamburger).toHaveClass(/active/);
  });

  test('should close mobile menu when clicking hamburger again', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    const navLinks = page.locator('#navLinks');

    // Open menu
    await hamburger.click();
    await expect(navLinks).toHaveClass(/active/);

    // Close menu
    await hamburger.click();
    await expect(navLinks).not.toHaveClass(/active/);
    await expect(hamburger).not.toHaveClass(/active/);
  });

  test('should close mobile menu when clicking a navigation link', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    const navLinks = page.locator('#navLinks');

    // Open menu
    await hamburger.click();
    await expect(navLinks).toHaveClass(/active/);

    // Click features link
    const featuresLink = navLinks.locator('a[href="#features"]');
    await featuresLink.click();

    // Menu should close
    await expect(navLinks).not.toHaveClass(/active/);
  });

  test('should close mobile menu when clicking outside', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    const navLinks = page.locator('#navLinks');

    // Open menu
    await hamburger.click();
    await expect(navLinks).toHaveClass(/active/);

    // Click outside menu (on the hero section)
    await page.locator('.hero').click({ position: { x: 10, y: 10 } });

    // Menu should close
    await page.waitForTimeout(500); // Allow time for click handler
    await expect(navLinks).not.toHaveClass(/active/);
  });

  test('should stack navigation links vertically on mobile', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    const navLinks = page.locator('#navLinks');

    // Open menu
    await hamburger.click();

    // Get all links
    const links = navLinks.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(3);

    // Check flex direction is column
    const flexDirection = await navLinks.evaluate(el =>
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
  });

  test('should have appropriate touch target sizes', async ({ page }) => {
    const hamburger = page.locator('#hamburger');

    // Hamburger button should be large enough for touch
    const hamburgerBox = await hamburger.boundingBox();
    expect(hamburgerBox.width).toBeGreaterThanOrEqual(44); // iOS minimum
    expect(hamburgerBox.height).toBeGreaterThanOrEqual(44);
  });

  test('should maintain navigation state across orientation change', async ({ page }) => {
    const hamburger = page.locator('#hamburger');
    const navLinks = page.locator('#navLinks');

    // Open menu
    await hamburger.click();
    await expect(navLinks).toHaveClass(/active/);

    // Simulate orientation change (landscape)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Menu should remain open
    await expect(navLinks).toHaveClass(/active/);
  });
});

test.describe('Navigation Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have skip to main content link', async ({ page }) => {
    const skipLink = page.locator('.skip-to-content');
    await expect(skipLink).toBeInTheDocument();
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should focus skip link on Tab', async ({ page }) => {
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-to-content');
    await expect(skipLink).toBeFocused();
  });

  test('should navigate to main content when using skip link', async ({ page }) => {
    // Focus skip link
    await page.keyboard.press('Tab');

    // Press Enter
    await page.keyboard.press('Enter');

    // Should jump to main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeInViewport();
  });

  test('should have proper ARIA labels on navigation elements', async ({ page }) => {
    // Check hamburger button
    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toHaveAttribute('aria-label', /navigation menu/i);
    await expect(hamburger).toHaveAttribute('aria-expanded');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through navigation links
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First nav link

    // Should be able to focus on navigation links
    const firstNavLink = page.locator('nav a').first();
    await expect(firstNavLink).toBeFocused();
  });

  test('should show focus indicators on navigation links', async ({ page }) => {
    const firstNavLink = page.locator('nav a[href="index.html"]');
    await firstNavLink.focus();

    // Check for focus outline
    const outline = await firstNavLink.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.outlineStyle;
    });

    expect(outline).toBeTruthy();
  });
});

test.describe('Navigation Performance', () => {
  test('should load navigation quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    // Navigation should be visible within 2 seconds
    const nav = page.locator('nav');
    await expect(nav).toBeVisible({ timeout: 2000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have smooth scroll behavior', async ({ page }) => {
    await page.goto('/');

    // Check for smooth scroll CSS
    const smoothScroll = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });

    expect(smoothScroll).toBe('smooth');
  });
});
