// Global setup for slow test mode
// Adds delays between tests to avoid API rate limiting

module.exports = async () => {
  console.log('🐢 Running in SLOW mode - 30 second delays between tests');
  console.log('   This avoids Apps Script rate limiting\n');

  // Set environment variable to enable delays in tests
  process.env.SLOW_TEST_MODE = 'true';
  process.env.TEST_DELAY_MS = '30000'; // 30 seconds
};
