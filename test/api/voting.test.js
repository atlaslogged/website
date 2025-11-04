const {
  generateTestUser,
  getFeature,
  vote,
  unvote,
  sleep
} = require('./helpers');

describe('Voting API', () => {
  // Use a specific feature ID that exists (Dark Mode = 1)
  const TEST_FEATURE_ID = 1;

  describe('POST vote', () => {
    test('should increment vote count', async () => {
      const user = generateTestUser();
      const before = await getFeature(TEST_FEATURE_ID);

      const voteResponse = await vote(TEST_FEATURE_ID, user);

      expect(voteResponse.success).toBe(true);
      expect(voteResponse.message).toContain('recorded');
      expect(voteResponse.data.featureId).toBe(TEST_FEATURE_ID);
      expect(voteResponse.data.newVotes).toBe(before.votes + 1);

      // Verify in feature list
      const after = await getFeature(TEST_FEATURE_ID);
      expect(after.votes).toBe(before.votes + 1);
    });

    test('should prevent duplicate votes (24h cooldown)', async () => {
      const user = generateTestUser();

      // First vote should succeed
      const vote1 = await vote(TEST_FEATURE_ID, user);
      expect(vote1.success).toBe(true);

      // Second vote with same user should fail
      const vote2 = await vote(TEST_FEATURE_ID, user);
      expect(vote2.success).toBe(false);
      expect(vote2.message).toContain('already voted');
    });

    test('should return feature not found for invalid ID', async () => {
      const user = generateTestUser();
      const response = await vote(99999, user);

      expect(response.success).toBe(false);
      expect(response.message).toContain('not found');
    });

    test('should complete within acceptable time', async () => {
      const user = generateTestUser();
      const response = await vote(TEST_FEATURE_ID, user);

      // Even with cold start, should complete within 5 seconds
      expect(response.duration).toBeLessThan(5000);
    });
  });

  describe('POST unvote', () => {
    test('should decrement vote count', async () => {
      const user = generateTestUser();

      // First vote
      await vote(TEST_FEATURE_ID, user);
      const beforeUnvote = await getFeature(TEST_FEATURE_ID);

      // Then unvote
      const unvoteResponse = await unvote(TEST_FEATURE_ID, user);

      expect(unvoteResponse.success).toBe(true);
      expect(unvoteResponse.message).toContain('removed');
      expect(unvoteResponse.data.newVotes).toBe(beforeUnvote.votes - 1);

      // Verify in feature list
      const after = await getFeature(TEST_FEATURE_ID);
      expect(after.votes).toBe(beforeUnvote.votes - 1);
    });

    test('should fail if user has not voted', async () => {
      const user = generateTestUser();

      const response = await unvote(TEST_FEATURE_ID, user);

      expect(response.success).toBe(false);
      expect(response.message).toContain('have not voted');
    });

    test('should not allow votes to go negative', async () => {
      // Even if there's a bug, API should enforce votes >= 0
      const feature = await getFeature(TEST_FEATURE_ID);
      expect(feature.votes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Vote/Unvote Round Trip', () => {
    test('should allow vote -> unvote -> vote cycle', async () => {
      const user = generateTestUser();
      const initial = await getFeature(TEST_FEATURE_ID);

      // Vote
      const vote1 = await vote(TEST_FEATURE_ID, user);
      expect(vote1.success).toBe(true);
      expect(vote1.data.newVotes).toBe(initial.votes + 1);

      // Unvote
      const unvote1 = await unvote(TEST_FEATURE_ID, user);
      expect(unvote1.success).toBe(true);
      expect(unvote1.data.newVotes).toBe(initial.votes);

      // Vote again
      const vote2 = await vote(TEST_FEATURE_ID, user);
      expect(vote2.success).toBe(true);
      expect(vote2.data.newVotes).toBe(initial.votes + 1);
    });
  });
});
