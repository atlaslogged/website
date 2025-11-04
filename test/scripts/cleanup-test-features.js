#!/usr/bin/env node

const fetch = require('node-fetch');

const API_URL = 'https://script.google.com/macros/s/AKfycbwLfr1LIc0hxYznOfXCUqX--od90ZaFFVPpP7h3vjsIqV1izyG_2cG2b5JP45vT-1St/exec';

async function cleanupTestFeatures() {
  console.log('🧹 Fetching all features...\n');

  const response = await fetch(API_URL);
  const result = await response.json();

  if (!result.success) {
    console.error('❌ Failed to fetch features:', result.message);
    return;
  }

  const testFeatures = result.data.filter(f =>
    f.title && f.title.includes('E2E Test Feature')
  );

  console.log(`Found ${testFeatures.length} test features to clean up:\n`);

  for (const feature of testFeatures) {
    console.log(`Deleting: ${feature.title} (ID: ${feature.id})`);

    try {
      const deleteUrl = `${API_URL}?action=delete&id=${feature.id}`;
      const deleteResponse = await fetch(deleteUrl);
      const deleteResult = await deleteResponse.json();

      if (deleteResult.success) {
        console.log(`  ✅ Deleted successfully`);
      } else {
        console.log(`  ⚠️  ${deleteResult.message}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Wait 2 seconds between deletes to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Cleanup complete!');
}

cleanupTestFeatures().catch(console.error);
