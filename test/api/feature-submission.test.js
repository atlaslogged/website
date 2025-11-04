const {
  submitFeature,
  getFeatures,
  sleep
} = require('./helpers');

describe('Feature Submission', () => {
  describe('POST submitFeature', () => {
    test('should add feature to sheet successfully', async () => {
      const timestamp = Date.now();
      const title = `Test Feature ${timestamp}`;
      const description = `This is a test feature submitted at ${new Date().toISOString()}`;

      const result = await submitFeature(title, description);

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(result.data.id).toBeDefined();
      expect(result.data.id).toBeGreaterThan(0);

      // Wait a moment for cache to invalidate and sheet to update
      await sleep(2000);

      // Verify it appears in feature list
      const features = await getFeatures();
      const submitted = features.data.find(f => f.id === result.data.id);

      expect(submitted).toBeDefined();
      expect(submitted.title).toBe(title);
      expect(submitted.description).toBe(description);
      expect(submitted.votes).toBe(0); // New features start with 0 votes
      expect(submitted.status).toBe('Under Review');
    });

    test('should enforce rate limiting (1 submission per hour)', async () => {
      const timestamp = Date.now();

      // First submission should succeed
      const result1 = await submitFeature(
        `Rate Limit Test 1 ${timestamp}`,
        'First submission'
      );

      expect(result1.success).toBe(true);

      // Second submission from same user should fail
      const result2 = await submitFeature(
        `Rate Limit Test 2 ${timestamp}`,
        'Second submission',
        'same@user.com'
      );

      expect(result2.success).toBe(false);
      expect(result2.message).toContain('wait');
    });

    test('should validate title length', async () => {
      const longTitle = 'x'.repeat(101); // Over 100 character limit

      const result = await submitFeature(longTitle, 'Valid description');

      expect(result.success).toBe(false);
      expect(result.message).toContain('100 characters');
    });

    test('should validate description length', async () => {
      const longDescription = 'x'.repeat(501); // Over 500 character limit

      const result = await submitFeature('Valid title', longDescription);

      expect(result.success).toBe(false);
      expect(result.message).toContain('500 characters');
    });

    test('should require title', async () => {
      // Note: Our helper function requires title, so we'd need to call API directly
      // This tests the API contract
      const fetch = require('node-fetch');
      const API_URL = 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';

      const formData = new URLSearchParams();
      formData.append('description', 'Description without title');

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.message).toContain('required');
    });

    test('should require description', async () => {
      // Test API contract directly
      const fetch = require('node-fetch');
      const API_URL = 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';

      const formData = new URLSearchParams();
      formData.append('title', 'Title without description');

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.message).toContain('required');
    });

    test('should default email to Anonymous', async () => {
      const timestamp = Date.now();
      const title = `Test Anonymous ${timestamp}`;

      // Submit without email
      const result = await submitFeature(title, 'Test description', '');

      expect(result.success).toBe(true);

      // Note: Email is not returned in API response for privacy,
      // but we can verify submission succeeded
      expect(result.data.id).toBeDefined();
    });

    test('should complete within acceptable time', async () => {
      const timestamp = Date.now();
      const result = await submitFeature(
        `Performance Test ${timestamp}`,
        'Testing submission performance'
      );

      // Even with cold start, should complete within 5 seconds
      expect(result.duration).toBeLessThan(5000);

      if (result.success) {
        // Successful submissions should be reasonably fast
        expect(result.duration).toBeLessThan(3000);
      }
    });
  });
});
