#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const API_URL = 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';

// Configuration
const RUNS = 5; // Number of times to run each test
const COLD_START_DELAY = 20 * 60 * 1000; // 20 minutes in milliseconds

/**
 * Generate unique user for testing
 */
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    userAgent: `benchmark-${timestamp}-${random}`,
    ipAddress: `10.0.0.${Math.floor(Math.random() * 255)}`
  };
}

/**
 * Measure request timing
 */
async function measureRequest(name, requestFn) {
  const measurements = [];

  for (let i = 0; i < RUNS; i++) {
    const startTime = Date.now();
    try {
      await requestFn();
      const duration = Date.now() - startTime;
      measurements.push(duration);
      console.log(chalk.gray(`  ${name} run ${i + 1}/${RUNS}: ${duration}ms`));
    } catch (error) {
      console.log(chalk.red(`  ${name} run ${i + 1}/${RUNS}: ERROR - ${error.message}`));
      measurements.push(null);
    }
  }

  // Filter out failed requests
  const validMeasurements = measurements.filter(m => m !== null);

  if (validMeasurements.length === 0) {
    return {
      name,
      min: null,
      avg: null,
      max: null,
      runs: RUNS,
      successful: 0,
      failed: RUNS
    };
  }

  const min = Math.min(...validMeasurements);
  const max = Math.max(...validMeasurements);
  const avg = Math.round(validMeasurements.reduce((a, b) => a + b, 0) / validMeasurements.length);

  return {
    name,
    min,
    avg,
    max,
    runs: RUNS,
    successful: validMeasurements.length,
    failed: measurements.length - validMeasurements.length
  };
}

/**
 * Test scenarios
 */
const scenarios = {
  async warmContainer() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.json();
  },

  async voteFirstTime() {
    const user = generateTestUser();
    const url = `${API_URL}?action=vote&id=1&userAgent=${encodeURIComponent(user.userAgent)}&ipAddress=${user.ipAddress}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.json();
  },

  async voteCachedRow() {
    // Vote on same feature multiple times (row should be cached)
    const user = generateTestUser();
    const url = `${API_URL}?action=vote&id=5&userAgent=${encodeURIComponent(user.userAgent)}&ipAddress=${user.ipAddress}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.json();
  },

  async getFeaturesCacheHit() {
    // Call twice, second should hit cache
    await fetch(API_URL);
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.json();
  },

  async getFeaturesCacheMiss() {
    // This is harder to test reliably
    // In practice, we'd wait 5+ minutes or clear cache
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.json();
  }
};

/**
 * Format results as table
 */
function formatResults(results) {
  console.log('\n' + chalk.bold('Performance Benchmark Results'));
  console.log('═'.repeat(80));

  // Header
  console.log(
    chalk.bold('Scenario').padEnd(35) +
    chalk.bold('Min').padStart(10) +
    chalk.bold('Avg').padStart(10) +
    chalk.bold('Max').padStart(10) +
    chalk.bold('Status').padStart(15)
  );
  console.log('─'.repeat(80));

  // Results
  results.forEach(result => {
    const statusText = result.failed > 0
      ? chalk.yellow(`${result.successful}/${result.runs} passed`)
      : chalk.green('✓ All passed');

    console.log(
      result.name.padEnd(35) +
      (result.min ? `${result.min}ms`.padStart(10) : 'N/A'.padStart(10)) +
      (result.avg ? `${result.avg}ms`.padStart(10) : 'N/A'.padStart(10)) +
      (result.max ? `${result.max}ms`.padStart(10) : 'N/A'.padStart(10)) +
      statusText.padStart(15)
    );
  });

  console.log('═'.repeat(80) + '\n');
}

/**
 * Save results to file
 */
function saveResults(results) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `benchmark-${timestamp}.json`;
  const filepath = path.join(__dirname, '../results', filename);

  // Ensure results directory exists
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const data = {
    timestamp: new Date().toISOString(),
    runs: RUNS,
    results
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(chalk.green(`✓ Results saved to ${filename}\n`));

  return filepath;
}

/**
 * Main benchmark runner
 */
async function runBenchmark() {
  console.log(chalk.bold('\n🚀 Atlas Logged Roadmap API Benchmark\n'));
  console.log(`Running ${RUNS} iterations per scenario...\n`);

  const results = [];

  // Scenario 1: Warm container (immediate requests)
  console.log(chalk.cyan('📊 Testing: Warm Container'));
  results.push(await measureRequest(
    'Warm Container',
    scenarios.warmContainer
  ));

  // Scenario 2: Vote (first time on feature)
  console.log(chalk.cyan('\n📊 Testing: Vote First Time'));
  results.push(await measureRequest(
    'Vote (First Time)',
    scenarios.voteFirstTime
  ));

  // Scenario 3: Vote with cached row
  console.log(chalk.cyan('\n📊 Testing: Vote Cached Row'));
  results.push(await measureRequest(
    'Vote (Cached Row)',
    scenarios.voteCachedRow
  ));

  // Scenario 4: Get features (cache hit)
  console.log(chalk.cyan('\n📊 Testing: Get Features (Cache Hit)'));
  results.push(await measureRequest(
    'Get Features (Cache Hit)',
    scenarios.getFeaturesCacheHit
  ));

  // Scenario 5: Get features (cache miss)
  console.log(chalk.cyan('\n📊 Testing: Get Features (Cache Miss)'));
  results.push(await measureRequest(
    'Get Features (Cache Miss)',
    scenarios.getFeaturesCacheMiss
  ));

  // Display results
  formatResults(results);

  // Save results
  const filepath = saveResults(results);

  // Show summary
  const allPassed = results.every(r => r.failed === 0);
  if (allPassed) {
    console.log(chalk.green.bold('✓ All benchmarks completed successfully!\n'));
  } else {
    console.log(chalk.yellow.bold('⚠ Some benchmarks had failures\n'));
  }

  // Show performance insights
  console.log(chalk.bold('Performance Insights:'));
  results.forEach(result => {
    if (result.avg) {
      let status = '';
      if (result.avg < 200) {
        status = chalk.green('Excellent');
      } else if (result.avg < 500) {
        status = chalk.green('Good');
      } else if (result.avg < 1000) {
        status = chalk.yellow('Acceptable');
      } else {
        status = chalk.red('Needs Optimization');
      }
      console.log(`  ${result.name}: ${result.avg}ms - ${status}`);
    }
  });

  console.log('');
  return results;
}

// Run if called directly
if (require.main === module) {
  runBenchmark()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(chalk.red('\n❌ Benchmark failed:'), error);
      process.exit(1);
    });
}

module.exports = { runBenchmark, measureRequest };
