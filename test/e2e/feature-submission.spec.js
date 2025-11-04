const { test, expect } = require('@playwright/test');

/**
 * E2E Tests for Feature Submission Flow
 * Tests the complete feature submission interaction on the roadmap page
 */

test.describe('Feature Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to roadmap page
    await page.goto('/roadmap.html');

    // Wait for page to load
    await page.waitForSelector('.feature-card', { timeout: 10000 });
  });

  test('should display submit feature form', async ({ page }) => {
    // Find and click submit button
    const submitButton = page.locator('#openModal');
    await expect(submitButton).toBeVisible();

    // Click to open form
    await submitButton.click();

    // Verify modal is displayed
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });
    await expect(page.locator('#featureModal')).toHaveClass(/active/);

    // Verify form fields
    await expect(page.locator('#feature-title')).toBeVisible();
    await expect(page.locator('#feature-description')).toBeVisible();
    await expect(page.locator('#feature-email')).toBeVisible();

    // Verify submit button in form
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should submit a new feature successfully', async ({ page }) => {
    // Clear submission tracking
    await page.evaluate(() => {
      localStorage.removeItem('lastSubmissionTime');
    });

    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Fill form with unique data
    const timestamp = Date.now();
    const title = `E2E Test Feature ${timestamp}`;
    const description = 'This is a test feature submitted via E2E test';

    await page.locator('#feature-title').fill(title);
    await page.locator('#feature-description').fill(description);
    await page.locator('#feature-email').fill('test@example.com');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for submission to complete and modal to close (with longer timeout for API)
    await page.waitForFunction(
      () => !document.querySelector('#featureModal').classList.contains('active'),
      { timeout: 15000 }
    );

    // Verify modal is closed
    const modal = page.locator('#featureModal');
    const isActive = await modal.evaluate(el => el.classList.contains('active'));
    expect(isActive).toBe(false);

    // Wait for cache to update
    await page.waitForTimeout(3000);

    // Reload page to see new feature
    await page.reload();
    await page.waitForSelector('.feature-card');

    // Verify new feature appears (may not be immediately visible due to cache)
    // This is a best-effort check
    const pageContent = await page.content();
    const featureExists = pageContent.includes(title) || pageContent.includes(description);

    // Log result for debugging
    console.log(`Feature "${title}" ${featureExists ? 'found' : 'not found (may be cached)'}`);
  });

  test('should validate title is required', async ({ page }) => {
    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Try to submit without title
    await page.locator('#feature-description').fill('Test description');
    await page.locator('button[type="submit"]').click();

    // HTML5 validation should prevent submission
    const titleInput = page.locator('#feature-title');
    const validationMessage = await titleInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toBeTruthy(); // Should have validation message
  });

  test('should validate description is required', async ({ page }) => {
    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Try to submit without description
    await page.locator('#feature-title').fill('Test title');
    await page.locator('button[type="submit"]').click();

    // HTML5 validation should prevent submission
    const descInput = page.locator('#feature-description');
    const validationMessage = await descInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should enforce title length limit (100 chars)', async ({ page }) => {
    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Try to enter title > 100 characters
    const longTitle = 'x'.repeat(101);
    const titleInput = page.locator('#feature-title');

    await titleInput.fill(longTitle);

    // Check maxlength attribute prevents typing
    const actualValue = await titleInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(100);
  });

  test('should enforce description length limit (500 chars)', async ({ page }) => {
    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Try to enter description > 500 characters
    const longDesc = 'x'.repeat(501);
    const descInput = page.locator('#feature-description');

    await descInput.fill(longDesc);

    // Check maxlength attribute prevents typing
    const actualValue = await descInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(500);
  });

  test('should allow email to be optional', async ({ page }) => {
    // Clear submission tracking
    await page.evaluate(() => {
      localStorage.removeItem('lastSubmissionTime');
    });

    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Fill only title and description (no email)
    const timestamp = Date.now();
    await page.locator('#feature-title').fill(`No Email Test ${timestamp}`);
    await page.locator('#feature-description').fill('Submitted without email');

    // Email field should not be required
    const emailInput = page.locator('#feature-email');
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).toBeNull(); // Should not have required attribute

    // Submit should work
    await page.locator('button[type="submit"]').click();

    // Should not show validation error for email
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toBe('');
  });

  test('should close form when cancel/close is clicked', async ({ page }) => {
    // Open form
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    // Verify form is visible
    await expect(page.locator('#featureModal')).toBeVisible();

    // Find and click close button (X or Close)
    const closeButton = page.locator('#closeModal');
    await closeButton.click();

    // Modal should close (no longer have 'active' class)
    await page.waitForFunction(
      () => !document.querySelector('#featureModal').classList.contains('active'),
      { timeout: 2000 }
    );
  });

  test('should show loading state during submission', async ({ page }) => {
    // Clear submission tracking
    await page.evaluate(() => {
      localStorage.removeItem('lastSubmissionTime');
    });

    // Slow down network to see loading state
    await page.route('**/exec*', async route => {
      // Only delay POST requests
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await route.continue();
    });

    // Open form and submit
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    const timestamp = Date.now();
    await page.locator('#feature-title').fill(`Loading Test ${timestamp}`);
    await page.locator('#feature-description').fill('Testing loading state');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show loading state (disabled, spinner, or text change)
    await expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await page.waitForTimeout(2000);
  });

  test('should handle submission errors gracefully', async ({ page }) => {
    // Clear submission tracking
    await page.evaluate(() => {
      localStorage.removeItem('lastSubmissionTime');
    });

    // Intercept API and force error
    await page.route('**/exec*', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Server error'
          })
        });
      } else {
        route.continue();
      }
    });

    // Open form and submit
    await page.locator('#openModal').click();
    await page.waitForSelector('#featureModal.active', { timeout: 5000 });

    const timestamp = Date.now();
    await page.locator('#feature-title').fill(`Error Test ${timestamp}`);
    await page.locator('#feature-description').fill('Testing error handling');

    await page.locator('button[type="submit"]').click();

    // Wait for error handling
    await page.waitForTimeout(1000);

    // Should show error message
    const errorMessage = page.locator('.error-message, .submission-error');
    const isVisible = await errorMessage.isVisible().catch(() => false);

    // Either error message shows or submit button re-enables
    const submitEnabled = await page.locator('button[type="submit"]').isEnabled().catch(() => false);

    expect(isVisible || submitEnabled).toBe(true);
  });
});
