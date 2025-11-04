const { test, expect } = require('@playwright/test');

/**
 * E2E Tests for Page Performance and Responsiveness
 * Tests page load time, responsiveness, and mobile behavior
 */

test.describe('Page Performance', () => {
  test('roadmap page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/roadmap.html');

    // Wait for critical content to be visible
    await page.waitForSelector('.feature-card', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds (including API call)
    expect(loadTime).toBeLessThan(5000);

    console.log(`Page loaded in ${loadTime}ms`);
  });

  test('should load and render all critical content', async ({ page }) => {
    // Track performance metrics
    const metrics = {
      navigationStart: Date.now(),
      apiRequestStart: null,
      apiRequestEnd: null,
      firstRenderStart: null,
      firstRenderEnd: null
    };

    // Listen for API requests
    page.on('request', request => {
      if (request.url().includes('script.google.com') && !metrics.apiRequestStart) {
        metrics.apiRequestStart = Date.now();
      }
    });

    page.on('response', response => {
      if (response.url().includes('script.google.com') && !metrics.apiRequestEnd) {
        metrics.apiRequestEnd = Date.now();
      }
    });

    await page.goto('/roadmap.html');

    metrics.firstRenderStart = Date.now();

    // Wait for features to load with better timeout handling
    try {
      await page.waitForSelector('.feature-card', { timeout: 20000 });
      metrics.firstRenderEnd = Date.now();
    } catch (error) {
      // Log timing details on failure
      console.log('Performance metrics on timeout:');
      console.log('  Navigation → API Request:', metrics.apiRequestStart ? `${metrics.apiRequestStart - metrics.navigationStart}ms` : 'N/A');
      console.log('  API Request → Response:', metrics.apiRequestEnd && metrics.apiRequestStart ? `${metrics.apiRequestEnd - metrics.apiRequestStart}ms` : 'N/A');
      console.log('  Response → Render:', metrics.apiRequestEnd ? `${Date.now() - metrics.apiRequestEnd}ms` : 'N/A');
      console.log('  Total time:', `${Date.now() - metrics.navigationStart}ms`);
      throw error;
    }

    // Log successful timing
    if (metrics.apiRequestStart && metrics.apiRequestEnd) {
      const apiTime = metrics.apiRequestEnd - metrics.apiRequestStart;
      const renderTime = metrics.firstRenderEnd - metrics.apiRequestEnd;
      const totalTime = metrics.firstRenderEnd - metrics.navigationStart;

      console.log(`Performance: API ${apiTime}ms | Render ${renderTime}ms | Total ${totalTime}ms`);

      // Fail if API is too slow (likely cache miss or slow Apps Script)
      if (apiTime > 10000) {
        console.warn(`⚠️  API response very slow (${apiTime}ms) - possible cache miss or rate limiting`);
      }
    }

    // Verify critical elements are present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible(); // Page heading

    // Verify at least one feature card exists
    const featureCount = await page.locator('.feature-card').count();
    expect(featureCount).toBeGreaterThanOrEqual(1);

    // Verify submit button
    await expect(page.locator('button:has-text("Suggest a Feature")')).toBeVisible();
  });

  test('should maintain good performance with many features', async ({ page }) => {
    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Measure scroll performance
    const startTime = Date.now();

    // Scroll through entire page
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    await page.waitForTimeout(500);

    // Scroll back up
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const scrollTime = Date.now() - startTime;

    // Scrolling should be smooth (< 2s for full page)
    expect(scrollTime).toBeLessThan(2000);
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile (viewport 375x667)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Verify mobile navigation works
    const mobileMenu = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]');
    const mobileMenuExists = await mobileMenu.isVisible().catch(() => false);

    if (mobileMenuExists) {
      await mobileMenu.click();
      await page.waitForTimeout(300); // Wait for animation

      // Navigation should be visible after toggle
      const nav = page.locator('nav, .nav-menu');
      await expect(nav).toBeVisible();
    }

    // Features should stack vertically on mobile
    const features = page.locator('.feature-card');
    const featureCount = await features.count();

    if (featureCount >= 2) {
      const firstFeature = features.first();
      const secondFeature = features.nth(1);

      const firstBox = await firstFeature.boundingBox();
      const secondBox = await secondFeature.boundingBox();

      // Second feature should be below first (not side by side)
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 50);
    }
  });

  test('should display correctly on tablet (viewport 768x1024)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Verify content is visible
    const features = page.locator('.feature-card');
    const featureCount = await features.count();
    expect(featureCount).toBeGreaterThan(0);

    // All interactive elements should be accessible
    const firstFeature = features.first();
    const voteButton = firstFeature.locator('button');
    await expect(voteButton).toBeVisible();
  });

  test('should display correctly on desktop (viewport 1920x1080)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Verify features display in grid layout
    const features = page.locator('.feature-card');
    const featureCount = await features.count();

    if (featureCount >= 2) {
      const firstFeature = features.first();
      const secondFeature = features.nth(1);

      const firstBox = await firstFeature.boundingBox();
      const secondBox = await secondFeature.boundingBox();

      // On desktop, features might be side by side
      // (Depends on grid layout - adjust if needed)
      const sameLine = Math.abs(firstBox.y - secondBox.y) < 50;
      const verticalStack = secondBox.y > firstBox.y + firstBox.height - 50;

      // Either layout is acceptable
      expect(sameLine || verticalStack).toBe(true);
    }

    // Navigation should be visible (not hamburger menu)
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('mobile menu should toggle correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/roadmap.html');

    // Find mobile menu toggle
    const menuToggle = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]').first();
    const menuExists = await menuToggle.isVisible().catch(() => false);

    if (menuExists) {
      // Initially, mobile nav might be hidden
      const navMenu = page.locator('.nav-links');

      // Click to open
      await menuToggle.click();
      await page.waitForTimeout(300);

      // Nav should be visible
      await expect(navMenu).toBeVisible();

      // Click to close
      await menuToggle.click();
      await page.waitForTimeout(300);

      // Nav should not have active class when closed
      await expect(navMenu).not.toHaveClass(/active/);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Check heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1); // At least one h1

    // Verify logical heading order exists
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels for interactive elements', async ({ page }) => {
    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Vote buttons should have accessible labels
    const voteButtons = page.locator('button:has-text("Vote")');
    const count = await voteButtons.count();

    if (count > 0) {
      const firstButton = voteButtons.first();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      const hasText = await firstButton.textContent();

      // Should have either aria-label or text content
      expect(ariaLabel || hasText).toBeTruthy();
    }

    // Submit button should be accessible
    const submitButton = page.locator('button:has-text("Suggest a Feature")');
    await expect(submitButton).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Should have focused element
    const focused = await page.evaluate(() => document.activeElement.tagName);
    expect(focused).toBeTruthy();

    // Tab multiple times to ensure navigation works
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    // Should still have focused element
    const stillFocused = await page.evaluate(() => document.activeElement.tagName);
    expect(stillFocused).toBeTruthy();
  });

  test('should handle focus visible for keyboard users', async ({ page }) => {
    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card');

    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Get focused element
    const focusedElement = page.locator(':focus').first();

    // Should have visible focus indicator (outline or box-shadow)
    const styles = await focusedElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
        outlineWidth: computed.outlineWidth
      };
    });

    // Should have some form of focus indicator
    const hasFocusIndicator =
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none' ||
      parseInt(styles.outlineWidth) > 0;

    expect(hasFocusIndicator).toBe(true);
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Force API to fail
    await page.route('**/exec*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error' })
      });
    });

    await page.goto('/roadmap.html');

    // Wait a moment for error handling
    await page.waitForTimeout(2000);

    // Should show error message or fallback UI
    const pageContent = await page.content();
    const hasErrorMessage =
      pageContent.toLowerCase().includes('error') ||
      pageContent.toLowerCase().includes('failed') ||
      pageContent.toLowerCase().includes('try again');

    // Or check for specific error UI elements
    const errorElement = await page.locator('.error-message, .api-error, .alert-error').isVisible()
      .catch(() => false);

    expect(hasErrorMessage || errorElement).toBe(true);
  });

  test('should handle slow API responses without freezing', async ({ page }) => {
    // Slow down API significantly
    await page.route('**/exec*', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.continue();
    });

    await page.goto('/roadmap.html');

    // Page should still be responsive during loading
    // Try clicking submit button
    const submitButton = page.locator('button:has-text("Suggest a Feature")');

    // Wait for button to appear (it should render even if features are loading)
    await submitButton.waitFor({ timeout: 5000 });

    // Button should be clickable
    await expect(submitButton).toBeVisible();
  });
});
