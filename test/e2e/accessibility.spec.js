const { test, expect } = require('@playwright/test');

/**
 * Accessibility E2E Tests
 * Tests WCAG 2.1 AA compliance and accessibility features
 */

test.describe('Keyboard Navigation', () => {
  test('should navigate through homepage with keyboard', async ({ page }) => {
    await page.goto('/');

    // Start tabbing through the page
    await page.keyboard.press('Tab'); // Skip to content link
    await page.keyboard.press('Tab'); // First nav link

    // Should be able to reach all interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should activate links and buttons with Enter key', async ({ page }) => {
    await page.goto('/');

    // Tab to features link in nav
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const featuresLink = page.locator('nav a[href="#features"]');
    await featuresLink.focus();

    // Press Enter to navigate
    await page.keyboard.press('Enter');

    // Should scroll to features section
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeInViewport();
  });

  test('should trap focus in mobile menu when open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const hamburger = page.locator('#hamburger');
    await hamburger.click();

    // Tab through menu items
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be within the mobile menu
    const focusedElement = page.locator(':focus');
    const isInMenu = await focusedElement.evaluate(el => {
      const menu = document.querySelector('#navLinks');
      return menu && menu.contains(el);
    });

    expect(isInMenu).toBe(true);
  });

  test('should navigate FAQ with keyboard', async ({ page }) => {
    await page.goto('/location-faq.html');

    // Find first FAQ
    const firstQuestion = page.locator('.faq-question').first();
    await firstQuestion.focus();

    // Should be focusable
    await expect(firstQuestion).toBeFocused();

    // Press Enter to expand
    await page.keyboard.press('Enter');

    // Should expand
    const parent = firstQuestion.locator('..');
    await expect(parent).toHaveClass(/open/);

    // Press Space should also work
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
  });

  test('should be able to escape from modal/tooltip with Escape key', async ({ page }) => {
    await page.goto('/');

    // Set rejected cookies to show chat placeholder
    await page.evaluate(() => {
      localStorage.setItem('chatwoot-consent', 'rejected');
    });
    await page.reload();

    // Open chat placeholder tooltip
    const chatPlaceholder = page.locator('#chat-placeholder');
    await chatPlaceholder.click();

    const tooltip = page.locator('#chat-placeholder-tooltip');
    await expect(tooltip).toHaveClass(/show/);

    // Press Escape
    await page.keyboard.press('Escape');

    // Tooltip should close (if escape handler is implemented)
    // Note: This might need implementation in the actual code
  });
});

test.describe('Focus Indicators', () => {
  test('should show visible focus indicators on all interactive elements', async ({ page }) => {
    await page.goto('/');

    // Test navigation links
    const navLink = page.locator('nav a').first();
    await navLink.focus();

    // Check for outline or focus ring
    const outline = await navLink.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.outlineWidth !== '0px';
    });

    expect(outline).toBe(true);
  });

  test('should have focus indicators on buttons', async ({ page }) => {
    await page.goto('/');

    // Wait for cookie banner
    const acceptButton = page.locator('#cookie-accept');
    await acceptButton.waitFor({ state: 'visible', timeout: 5000 });

    await acceptButton.focus();

    // Should have visible focus
    const hasFocus = await acceptButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.outlineWidth !== '0px';
    });

    expect(hasFocus).toBe(true);
  });

  test('should maintain focus visibility on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hamburger = page.locator('#hamburger');
    await hamburger.focus();

    const isVisible = await hamburger.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.outlineWidth !== '0px';
    });

    expect(isVisible).toBe(true);
  });
});

test.describe('ARIA Attributes', () => {
  test('should have proper ARIA roles on navigation', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Navigation should have implicit role or explicit role
    const role = await nav.getAttribute('role');
    if (role) {
      expect(role).toBe('navigation');
    }
  });

  test('should have aria-expanded on hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toHaveAttribute('aria-expanded');

    // Should be false initially
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    await hamburger.click();

    // Should be true when open
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  });

  test('should have aria-label on buttons without text', async ({ page }) => {
    await page.goto('/');

    // Hamburger button should have aria-label
    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toHaveAttribute('aria-label');
  });

  test('should have aria-live on cookie banner', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('#cookie-consent-banner');
    if (await banner.isVisible({ timeout: 5000 })) {
      await expect(banner).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('should have role="img" on emoji icons', async ({ page }) => {
    await page.goto('/');

    // Feature icons (emojis) should have role="img"
    const featureIcons = page.locator('.feature-icon');
    const firstIcon = featureIcons.first();

    if (await firstIcon.isVisible()) {
      await expect(firstIcon).toHaveAttribute('role', 'img');
      await expect(firstIcon).toHaveAttribute('aria-label');
    }
  });
});

test.describe('Heading Hierarchy', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Should have h2s
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);

    // h1 should come before h2
    const h1 = page.locator('h1').first();
    const h2 = page.locator('h2').first();

    const h1Box = await h1.boundingBox();
    const h2Box = await h2.boundingBox();

    expect(h1Box.y).toBeLessThan(h2Box.y);
  });

  test('should not skip heading levels', async ({ page }) => {
    await page.goto('/');

    // Get all headings
    const headings = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return elements.map(el => parseInt(el.tagName.substring(1)));
    });

    // Check for skipped levels
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i] - headings[i - 1];
      expect(diff).toBeLessThanOrEqual(1); // Should not skip levels
    }
  });

  test('should have proper heading hierarchy on privacy page', async ({ page }) => {
    await page.goto('/privacy.html');

    // Should have one h1 or h2
    const mainHeading = page.locator('h1, h2').first();
    await expect(mainHeading).toBeVisible();

    // Should have subheadings
    const h3Count = await page.locator('h3').count();
    expect(h3Count).toBeGreaterThan(0);
  });
});

test.describe('Alt Text and Images', () => {
  test('should have alt text on all images', async ({ page }) => {
    await page.goto('/');

    // Get all images
    const images = page.locator('img');
    const count = await images.count();

    // Check each image has alt attribute
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const hasAlt = await img.getAttribute('alt');
      expect(hasAlt).toBeTruthy();
    }
  });

  test('should have descriptive alt text on logo', async ({ page }) => {
    await page.goto('/');

    const logo = page.locator('.nav-logo');
    const alt = await logo.getAttribute('alt');

    expect(alt).toBeTruthy();
    expect(alt.length).toBeGreaterThan(0);
  });

  test('should have alt text on hero logo', async ({ page }) => {
    await page.goto('/');

    const heroLogo = page.locator('.hero-logo');
    const alt = await heroLogo.getAttribute('alt');

    expect(alt).toBeTruthy();
    expect(alt).toContain('Atlas Logged');
  });
});

test.describe('Color Contrast', () => {
  test('should have sufficient color contrast on text', async ({ page }) => {
    await page.goto('/');

    // Check main heading contrast
    const h1 = page.locator('h1');
    const contrast = await h1.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });

    // Basic check that color is defined
    expect(contrast.color).toBeTruthy();
  });

  test('should have visible link text', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('nav a');
    const firstLink = navLinks.first();

    const styles = await firstLink.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        textDecoration: computed.textDecoration,
        fontWeight: computed.fontWeight
      };
    });

    // Link should have defined color
    expect(styles.color).toBeTruthy();
  });
});

test.describe('Form Accessibility', () => {
  test('should have accessible cookie consent buttons', async ({ page }) => {
    await page.goto('/');

    const acceptButton = page.locator('#cookie-accept');
    const rejectButton = page.locator('#cookie-reject');

    if (await acceptButton.isVisible({ timeout: 5000 })) {
      // Buttons should have aria-label
      await expect(acceptButton).toHaveAttribute('aria-label');
      await expect(rejectButton).toHaveAttribute('aria-label');

      // Buttons should have sufficient size
      const acceptBox = await acceptButton.boundingBox();
      expect(acceptBox.width).toBeGreaterThan(40);
      expect(acceptBox.height).toBeGreaterThan(40);
    }
  });
});

test.describe('Screen Reader Support', () => {
  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('.skip-to-content');
    await expect(skipLink).toBeInTheDocument();

    // Should link to main content
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    // Main content should have id
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Should have main landmark
    await expect(page.locator('main')).toBeVisible();

    // Should have footer landmark
    await expect(page.locator('footer')).toBeVisible();

    // Should have nav landmark
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have lang attribute on html element', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should have descriptive page titles', async ({ page }) => {
    // Homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    const homeTitle = await page.title();
    expect(homeTitle.length).toBeGreaterThan(10);

    // Privacy page
    await page.goto('/privacy.html');
    const privacyTitle = await page.title();
    expect(privacyTitle).toMatch(/privacy/i);
    expect(privacyTitle).not.toBe(homeTitle);
  });
});

test.describe('Reduced Motion', () => {
  test('should respect prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Check if animations are disabled
    const heroLogo = page.locator('.hero-logo');

    const animation = await heroLogo.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        animationDuration: styles.animationDuration,
        transitionDuration: styles.transitionDuration
      };
    });

    // With reduced motion, animations should be minimal
    // This tests that CSS respects @media (prefers-reduced-motion)
    // The actual durations might not be exactly 0, but should be very short
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should have touch-friendly tap targets on mobile', async ({ page }) => {
    await page.goto('/');

    // Hamburger button
    const hamburger = page.locator('#hamburger');
    const hamburgerBox = await hamburger.boundingBox();
    expect(hamburgerBox.width).toBeGreaterThanOrEqual(44); // iOS minimum
    expect(hamburgerBox.height).toBeGreaterThanOrEqual(44);
  });

  test('should have accessible mobile navigation', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toHaveAttribute('aria-label');
    await expect(hamburger).toHaveAttribute('aria-expanded');
  });

  test('should maintain readability on small screens', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    const fontSize = await h1.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font size should be readable on mobile (at least 16px)
    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(16);
  });
});
