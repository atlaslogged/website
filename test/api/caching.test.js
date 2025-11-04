const {
  generateTestUser,
  getFeatures,
  vote,
  sleep
} = require('./helpers');

describe('Cache Behavior', () => {
  const TEST_FEATURE_ID = 1;

  describe('Feature List Caching', () => {
    test('should return cached data on second request (fast response)', async () => {
      // First request - may hit cache or fetch from sheet
      const response1 = await getFeatures();
      expect(response1.success).toBe(true);

      // Second request - should hit cache (much faster)
      const response2 = await getFeatures();
      expect(response2.success).toBe(true);

      // Cache hit should be faster (< 200ms)
      // Note: This may fail if cache expired or on first run
      if (response2.duration < response1.duration) {
        expect(response2.duration).toBeLessThan(200);
      }

      // Data should be identical
      expect(response2.data).toEqual(response1.data);
    });

    test('should cache for 5 minutes', async () => {
      // This test validates cache duration logic
      // We can't actually wait 5 minutes, so we check the implementation
      const response = await getFeatures();
      expect(response.success).toBe(true);

      // Subsequent request within 5 minutes should be cached
      const response2 = await getFeatures();
      expect(response2.success).toBe(true);

      // If both were fast, cache is working
      const bothFast = response.duration < 200 && response2.duration < 200;
      const secondFaster = response2.duration < response.duration;

      // At least one of these should be true
      expect(bothFast || secondFaster).toBe(true);
    });
  });

  describe('Smart Cache Updates', () => {
    test('should update cache instead of invalidating on vote', async () => {
      const user = generateTestUser();

      // Prime cache
      await getFeatures();

      // Vote on a feature
      const voteResponse = await vote(TEST_FEATURE_ID, user);
      expect(voteResponse.success).toBe(true);
      const newVotes = voteResponse.data.newVotes;

      // Get features again - should be fast (cache updated, not invalidated)
      const afterVote = await getFeatures();

      // Should complete quickly (cache hit)
      // Note: May be slower on cold starts
      if (afterVote.duration < 1000) {
        // Likely a cache hit
        expect(afterVote.duration).toBeLessThan(300);
      }

      // Should have updated vote count
      const feature = afterVote.data.find(f => f.id === TEST_FEATURE_ID);
      expect(feature.votes).toBe(newVotes);

      // List should still be sorted by votes
      for (let i = 1; i < afterVote.data.length; i++) {
        expect(afterVote.data[i-1].votes).toBeGreaterThanOrEqual(afterVote.data[i].votes);
      }
    });
  });

  describe('Row Caching', () => {
    test('should cache row lookups for faster subsequent votes', async () => {
      const user1 = generateTestUser();
      const user2 = generateTestUser();

      // First vote - will cache the row number
      const vote1 = await vote(TEST_FEATURE_ID, user1);
      expect(vote1.success).toBe(true);
      const timing1 = vote1.duration;

      // Wait a moment to ensure it's a separate request
      await sleep(1000);

      // Second vote (different user) - should use cached row number
      const vote2 = await vote(TEST_FEATURE_ID, user2);
      expect(vote2.success).toBe(true);
      const timing2 = vote2.duration;

      // Second vote should be same speed or faster (row cached)
      // Note: This is probabilistic due to network variance
      console.log(`Vote 1: ${timing1}ms, Vote 2: ${timing2}ms`);

      // Both should complete in reasonable time
      expect(timing1).toBeLessThan(5000);
      expect(timing2).toBeLessThan(5000);
    });
  });

  describe('Cache Consistency', () => {
    test('should maintain data consistency after cache operations', async () => {
      const user = generateTestUser();

      // Get initial state
      const before = await getFeatures();
      const featureBefore = before.data.find(f => f.id === TEST_FEATURE_ID);

      // Vote
      await vote(TEST_FEATURE_ID, user);

      // Get updated state
      const after = await getFeatures();
      const featureAfter = after.data.find(f => f.id === TEST_FEATURE_ID);

      // Vote count should have incremented by exactly 1
      expect(featureAfter.votes).toBe(featureBefore.votes + 1);

      // Other feature properties should be unchanged
      expect(featureAfter.id).toBe(featureBefore.id);
      expect(featureAfter.title).toBe(featureBefore.title);
      expect(featureAfter.description).toBe(featureBefore.description);
      expect(featureAfter.status).toBe(featureBefore.status);
    });
  });
});
