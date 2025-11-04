const fetch = require('node-fetch');

// Atlas Logged Roadmap API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';

/**
 * Generate a unique user identifier for testing
 * Each test run gets a unique user to avoid cooldown conflicts
 */
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    userAgent: `test-agent-${timestamp}-${random}`,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
  };
}

/**
 * Get all features from the roadmap
 */
async function getFeatures() {
  const startTime = Date.now();
  const response = await fetch(API_URL);
  const duration = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    ...result,
    duration,
    status: response.status
  };
}

/**
 * Get a specific feature by ID
 */
async function getFeature(featureId) {
  const response = await getFeatures();
  if (!response.success) {
    throw new Error(response.message);
  }

  const feature = response.data.find(f => f.id === featureId);
  if (!feature) {
    throw new Error(`Feature ${featureId} not found`);
  }

  return feature;
}

/**
 * Vote for a feature
 */
async function vote(featureId, user = null) {
  if (!user) {
    user = generateTestUser();
  }

  const url = `${API_URL}?action=vote&id=${featureId}&userAgent=${encodeURIComponent(user.userAgent)}&ipAddress=${user.ipAddress}`;
  const startTime = Date.now();
  const response = await fetch(url);
  const duration = Date.now() - startTime;

  const result = await response.json();
  return {
    ...result,
    duration,
    status: response.status,
    user
  };
}

/**
 * Unvote a feature
 */
async function unvote(featureId, user) {
  if (!user) {
    throw new Error('User object required for unvote (must be same user who voted)');
  }

  const url = `${API_URL}?action=unvote&id=${featureId}&userAgent=${encodeURIComponent(user.userAgent)}&ipAddress=${user.ipAddress}`;
  const startTime = Date.now();
  const response = await fetch(url);
  const duration = Date.now() - startTime;

  const result = await response.json();
  return {
    ...result,
    duration,
    status: response.status
  };
}

/**
 * Submit a new feature
 */
async function submitFeature(title, description, email = 'test@example.com') {
  const user = generateTestUser();

  const formData = new URLSearchParams();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('email', email);

  const url = `${API_URL}?userAgent=${encodeURIComponent(user.userAgent)}&ipAddress=${user.ipAddress}`;
  const startTime = Date.now();

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  const duration = Date.now() - startTime;
  const result = await response.json();

  return {
    ...result,
    duration,
    status: response.status,
    user
  };
}

/**
 * Wait for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Measure request timing
 */
async function measureTiming(requestFn) {
  const startTime = Date.now();
  const result = await requestFn();
  const duration = Date.now() - startTime;

  return {
    result,
    duration,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  API_URL,
  generateTestUser,
  getFeatures,
  getFeature,
  vote,
  unvote,
  submitFeature,
  sleep,
  measureTiming
};
