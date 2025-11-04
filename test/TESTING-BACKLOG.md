# Testing Backlog

This file tracks deferred test cases that require additional implementation or refinement.

## Deferred Tests

### 1. Rate Limiting for Feature Submissions
**Status**: Deferred
**Reason**: Front-end rate limiting not implemented
**Description**: Test to verify that users cannot submit features too quickly (e.g., multiple submissions within a short time period)

**Requirements for Implementation**:
- Implement front-end rate limiting logic in `roadmap.html` or `roadmap-api.js`
- Check localStorage for last submission time
- Display appropriate error message or disable form when rate limit is active
- Configure reasonable rate limit (e.g., 1 submission per 5 minutes)

**Test Case**:
```javascript
test('should handle rate limiting gracefully', async ({ page }) => {
  // Set last submission to now
  await page.evaluate(() => {
    localStorage.setItem('lastSubmissionTime', Date.now().toString());
  });

  await page.reload();
  await page.waitForSelector('.feature-card');

  // Try to open form
  await page.locator('#openModal').click();

  // Should either:
  // 1. Show error message about rate limit
  // 2. Prevent form from opening
  // 3. Show disabled submit button with message
});
```

---

### 2. API Loading State Indicators
**Status**: Deferred
**Reason**: Loading indicators not fully implemented / test timeout too aggressive
**Description**: Test to verify that the page shows appropriate loading states while API calls are in progress

**Requirements for Implementation**:
- Add loading spinner or skeleton UI during initial page load
- Show loading state while fetching features from API
- Ensure loading indicators are visible and accessible
- Handle slow API responses gracefully

**Test Case**:
```javascript
test('should handle API loading state gracefully', async ({ page }) => {
  // Slow down API to test loading state
  await page.route('**/exec*', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.continue();
  });

  await page.goto('/roadmap.html');

  // Should show loading indicator
  const hasLoadingIndicator = await page.locator('.loading, .skeleton, .spinner')
    .isVisible().catch(() => false);
  expect(hasLoadingIndicator).toBe(true);

  // Wait for content to load
  await page.waitForSelector('.feature-card', { timeout: 10000 });

  // Content should be visible after loading
  const featureCount = await page.locator('.feature-card').count();
  expect(featureCount).toBeGreaterThan(0);
});
```

---

## Notes

- When implementing these features, add the corresponding tests back into the test suite
- Ensure tests are updated to match actual implementation details
- Consider adding visual regression testing for loading states
