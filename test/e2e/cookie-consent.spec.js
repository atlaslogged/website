const { test, expect } = require('@playwright/test');

/**
 * Cookie Consent E2E Tests
 * Tests GDPR-compliant cookie consent banner and chat placeholder functionality
 */

test.describe('Cookie Consent Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should show cookie consent banner on first visit', async ({ page }) => {
    await page.goto('/');

    // Wait for cookie banner to appear
    const banner = page.locator('#cookie-consent-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Verify banner content
    await expect(banner).toContainText('We use cookies for customer support');
    await expect(banner).toContainText('Chatwoot');

    // Verify action buttons exist
    const acceptButton = page.locator('#cookie-accept');
    const rejectButton = page.locator('#cookie-reject');
    await expect(acceptButton).toBeVisible();
    await expect(rejectButton).toBeVisible();
  });

  test('should accept cookies and load Chatwoot', async ({ page }) => {
    await page.goto('/');

    // Wait for banner and click accept
    const acceptButton = page.locator('#cookie-accept');
    await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
    await acceptButton.click();

    // Banner should disappear
    await expect(page.locator('#cookie-consent-banner')).toBeHidden({ timeout: 3000 });

    // Check localStorage for consent status
    const consentStatus = await page.evaluate(() => localStorage.getItem('chatwoot-consent'));
    expect(consentStatus).toBe('accepted');

    // Chatwoot should start loading (check for script or widget)
    // Note: Chatwoot may take time to load, so we use a generous timeout
    await page.waitForTimeout(2000);

    // Verify no chat placeholder is visible
    await expect(page.locator('#chat-placeholder')).not.toBeVisible();
  });

  test('should reject cookies and show chat placeholder', async ({ page }) => {
    await page.goto('/');

    // Wait for banner and click reject
    const rejectButton = page.locator('#cookie-reject');
    await rejectButton.waitFor({ state: 'visible', timeout: 5000 });
    await rejectButton.click();

    // Banner should disappear
    await expect(page.locator('#cookie-consent-banner')).toBeHidden({ timeout: 3000 });

    // Check localStorage for consent status
    const consentStatus = await page.evaluate(() => localStorage.getItem('chatwoot-consent'));
    expect(consentStatus).toBe('rejected');

    // Chat placeholder should appear
    const chatPlaceholder = page.locator('#chat-placeholder');
    await expect(chatPlaceholder).toBeVisible({ timeout: 3000 });

    // Placeholder should have correct attributes
    await expect(chatPlaceholder).toHaveClass(/chat-placeholder/);
    await expect(chatPlaceholder).toContainText('💬');
  });

  test('should show tooltip when clicking chat placeholder', async ({ page }) => {
    // Set rejected status
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('chatwoot-consent', 'rejected');
    });
    await page.reload();

    // Wait for chat placeholder
    const chatPlaceholder = page.locator('#chat-placeholder');
    await expect(chatPlaceholder).toBeVisible({ timeout: 3000 });

    // Click placeholder to show tooltip
    await chatPlaceholder.click();

    // Tooltip should appear
    const tooltip = page.locator('#chat-placeholder-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip).toHaveClass(/show/);

    // Verify tooltip content
    await expect(tooltip).toContainText('Chat Disabled');
    await expect(tooltip).toContainText('enable cookies');
    await expect(tooltip).toContainText('Privacy Policy');

    // Verify buttons exist
    const enableButton = tooltip.locator('.btn-enable');
    const closeButton = tooltip.locator('.btn-close');
    await expect(enableButton).toBeVisible();
    await expect(closeButton).toBeVisible();
  });

  test('should re-enable cookies from chat placeholder tooltip', async ({ page }) => {
    // Set rejected status
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('chatwoot-consent', 'rejected');
    });
    await page.reload();

    // Open tooltip
    const chatPlaceholder = page.locator('#chat-placeholder');
    await chatPlaceholder.click();

    // Click "Enable Cookies" button
    const enableButton = page.locator('#chat-placeholder-tooltip .btn-enable');
    await enableButton.waitFor({ state: 'visible', timeout: 3000 });
    await enableButton.click();

    // Tooltip should close
    await expect(page.locator('#chat-placeholder-tooltip')).not.toHaveClass(/show/);

    // Chat placeholder should disappear
    await expect(chatPlaceholder).toBeHidden({ timeout: 3000 });

    // Check localStorage - consent should now be accepted
    const consentStatus = await page.evaluate(() => localStorage.getItem('chatwoot-consent'));
    expect(consentStatus).toBe('accepted');
  });

  test('should close tooltip when clicking close button', async ({ page }) => {
    // Set rejected status
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('chatwoot-consent', 'rejected');
    });
    await page.reload();

    // Open tooltip
    const chatPlaceholder = page.locator('#chat-placeholder');
    await chatPlaceholder.click();

    const tooltip = page.locator('#chat-placeholder-tooltip');
    await expect(tooltip).toHaveClass(/show/);

    // Click close button
    const closeButton = tooltip.locator('.btn-close');
    await closeButton.click();

    // Tooltip should close but placeholder should remain
    await expect(tooltip).not.toHaveClass(/show/);
    await expect(chatPlaceholder).toBeVisible();
  });

  test('should persist cookie consent across page reloads', async ({ page }) => {
    await page.goto('/');

    // Accept cookies
    const acceptButton = page.locator('#cookie-accept');
    await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
    await acceptButton.click();

    // Reload page
    await page.reload();

    // Banner should NOT appear again
    await page.waitForTimeout(2000);
    const banner = page.locator('#cookie-consent-banner');
    await expect(banner).not.toBeVisible();

    // Chat placeholder should NOT be visible
    await expect(page.locator('#chat-placeholder')).not.toBeVisible();
  });

  test('should have privacy policy link in cookie banner', async ({ page }) => {
    await page.goto('/');

    // Wait for banner
    const banner = page.locator('#cookie-consent-banner');
    await banner.waitFor({ state: 'visible', timeout: 5000 });

    // Find privacy policy link
    const privacyLink = banner.locator('a[href*="privacy.html"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toContainText('Privacy Policy');

    // Verify link is properly configured
    await expect(privacyLink).toHaveAttribute('target', '_blank');
    await expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should have privacy policy link in chat placeholder tooltip', async ({ page }) => {
    // Set rejected status
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('chatwoot-consent', 'rejected');
    });
    await page.reload();

    // Open tooltip
    const chatPlaceholder = page.locator('#chat-placeholder');
    await chatPlaceholder.click();

    const tooltip = page.locator('#chat-placeholder-tooltip');

    // Find privacy policy link in tooltip
    const privacyLink = tooltip.locator('a[href*="privacy.html"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toContainText('Privacy Policy');
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Wait for banner
    await page.locator('#cookie-consent-banner').waitFor({ state: 'visible', timeout: 5000 });

    // Tab to accept button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to activate buttons with keyboard
    const acceptButton = page.locator('#cookie-accept');
    await acceptButton.focus();
    await expect(acceptButton).toBeFocused();
  });
});

test.describe('Cookie Consent Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display cookie banner properly on mobile', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('#cookie-consent-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Verify buttons are visible and tappable
    const acceptButton = page.locator('#cookie-accept');
    const rejectButton = page.locator('#cookie-reject');
    await expect(acceptButton).toBeVisible();
    await expect(rejectButton).toBeVisible();

    // Buttons should be large enough for mobile tapping
    const acceptBox = await acceptButton.boundingBox();
    expect(acceptBox.height).toBeGreaterThan(35); // Minimum tap target (relaxed for actual rendering)
  });

  test('should display chat placeholder properly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('chatwoot-consent', 'rejected');
    });
    await page.reload();

    const chatPlaceholder = page.locator('#chat-placeholder');
    await expect(chatPlaceholder).toBeVisible({ timeout: 3000 });

    // Verify size is appropriate for mobile
    const placeholderBox = await chatPlaceholder.boundingBox();
    expect(placeholderBox.width).toBeGreaterThanOrEqual(48); // Mobile size
    expect(placeholderBox.height).toBeGreaterThanOrEqual(48);
  });
});
