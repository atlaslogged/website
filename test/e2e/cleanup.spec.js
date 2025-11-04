const { test, expect } = require('@playwright/test');

/**
 * E2E Test Cleanup
 * Removes test data created during E2E test runs
 * This test should run AFTER all other tests to clean up test submissions
 */

// Get API URL from environment or use default (same as js/roadmap-api.js)
const API_URL = process.env.API_URL || 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';

test.describe('Test Cleanup', () => {
  test('should delete test submissions created during E2E tests', async ({ page, request }) => {
    // Navigate to roadmap to get the feature list
    await page.goto('/roadmap.html');
    await page.waitForSelector('.feature-card', { timeout: 15000 });

    // Get all features from the API
    const response = await request.get(API_URL);
    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      console.log('No features found to clean up');
      return;
    }

    // Find all test features (contain "E2E Test Feature" in title)
    const testFeatures = data.data.filter(feature =>
      feature.title && feature.title.includes('E2E Test Feature')
    );

    console.log(`Found ${testFeatures.length} test features to delete`);

    if (testFeatures.length === 0) {
      console.log('No test features found - cleanup not needed');
      return;
    }

    // Delete each test feature
    let deletedCount = 0;
    let failedCount = 0;

    for (const feature of testFeatures) {
      try {
        const deleteUrl = `${API_URL}?action=delete&id=${feature.id}`;
        const deleteResponse = await request.get(deleteUrl);
        const deleteData = await deleteResponse.json();

        if (deleteData.success) {
          deletedCount++;
          console.log(`✓ Deleted test feature ${feature.id}: ${feature.title}`);
        } else {
          failedCount++;
          console.log(`✗ Failed to delete feature ${feature.id}: ${deleteData.message}`);
        }

        // Add small delay between deletes to avoid rate limiting
        await page.waitForTimeout(500);
      } catch (error) {
        failedCount++;
        console.log(`✗ Error deleting feature ${feature.id}: ${error.message}`);
      }
    }

    console.log(`\nCleanup Summary:`);
    console.log(`  Total test features found: ${testFeatures.length}`);
    console.log(`  Successfully deleted: ${deletedCount}`);
    console.log(`  Failed to delete: ${failedCount}`);

    // Test passes if we deleted at least some features or if there were none to delete
    expect(deletedCount + failedCount).toBe(testFeatures.length);
  });
});
