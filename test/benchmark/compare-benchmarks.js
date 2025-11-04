#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Load benchmark results from file
 */
function loadBenchmark(filename) {
  const filepath = path.join(__dirname, '../results', filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

/**
 * Get all benchmark files
 */
function getAllBenchmarks() {
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) {
    return [];
  }
  return fs.readdirSync(resultsDir)
    .filter(f => f.startsWith('benchmark-') && f.endsWith('.json'))
    .sort();
}

/**
 * Compare two benchmark results
 */
function compareBenchmarks(before, after) {
  console.log(chalk.bold('\n📊 Benchmark Comparison\n'));
  console.log(chalk.gray(`Before: ${before.timestamp}`));
  console.log(chalk.gray(`After:  ${after.timestamp}\n`));

  console.log('═'.repeat(90));
  console.log(
    chalk.bold('Scenario').padEnd(30) +
    chalk.bold('Before').padStart(12) +
    chalk.bold('After').padStart(12) +
    chalk.bold('Diff').padStart(12) +
    chalk.bold('Change').padStart(15)
  );
  console.log('─'.repeat(90));

  let improvements = 0;
  let regressions = 0;

  before.results.forEach(beforeResult => {
    const afterResult = after.results.find(r => r.name === beforeResult.name);

    if (!afterResult) {
      console.log(chalk.gray(`${beforeResult.name.padEnd(30)} Not found in after`));
      return;
    }

    if (!beforeResult.avg || !afterResult.avg) {
      console.log(chalk.gray(`${beforeResult.name.padEnd(30)} Incomplete data`));
      return;
    }

    const diff = afterResult.avg - beforeResult.avg;
    const percentChange = ((diff / beforeResult.avg) * 100).toFixed(1);

    let diffText = `${diff > 0 ? '+' : ''}${diff}ms`;
    let changeText = `${percentChange > 0 ? '+' : ''}${percentChange}%`;

    if (diff < 0) {
      // Improvement (faster)
      diffText = chalk.green(diffText);
      changeText = chalk.green(changeText);
      improvements++;
    } else if (diff > 0) {
      // Regression (slower)
      diffText = chalk.red(diffText);
      changeText = chalk.red(changeText);
      regressions++;
    } else {
      diffText = chalk.gray(diffText);
      changeText = chalk.gray(changeText);
    }

    console.log(
      beforeResult.name.padEnd(30) +
      `${beforeResult.avg}ms`.padStart(12) +
      `${afterResult.avg}ms`.padStart(12) +
      diffText.padStart(12) +
      changeText.padStart(15)
    );
  });

  console.log('═'.repeat(90) + '\n');

  // Summary
  console.log(chalk.bold('Summary:'));
  if (improvements > 0) {
    console.log(chalk.green(`  ✓ ${improvements} improvements (faster)`));
  }
  if (regressions > 0) {
    console.log(chalk.red(`  ✗ ${regressions} regressions (slower)`));
  }
  if (improvements === 0 && regressions === 0) {
    console.log(chalk.gray('  No significant changes'));
  }
  console.log('');

  return {
    improvements,
    regressions
  };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // If two filenames provided, compare them
  if (args.length === 2) {
    const before = loadBenchmark(args[0]);
    const after = loadBenchmark(args[1]);
    const result = compareBenchmarks(before, after);

    // Exit with error if regressions detected
    if (result.regressions > 0) {
      console.log(chalk.red('❌ Performance regression detected!'));
      process.exit(1);
    } else {
      console.log(chalk.green('✓ No regressions detected'));
      process.exit(0);
    }
  }

  // Otherwise, compare latest with baseline
  const benchmarks = getAllBenchmarks();

  if (benchmarks.length === 0) {
    console.log(chalk.yellow('No benchmark results found'));
    console.log('Run: npm run benchmark');
    process.exit(1);
  }

  if (benchmarks.length === 1) {
    console.log(chalk.yellow('Only one benchmark found. Need at least two to compare.'));
    console.log(`Available: ${benchmarks[0]}`);
    process.exit(1);
  }

  // Compare first (oldest) with last (newest)
  console.log(chalk.bold('\nComparing oldest vs newest benchmarks'));
  const before = loadBenchmark(benchmarks[0]);
  const after = loadBenchmark(benchmarks[benchmarks.length - 1]);
  const result = compareBenchmarks(before, after);

  if (result.improvements > 0) {
    console.log(chalk.green('✓ Performance has improved!'));
  } else if (result.regressions > 0) {
    console.log(chalk.red('❌ Performance has regressed'));
    process.exit(1);
  } else {
    console.log(chalk.gray('No significant changes'));
  }
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

module.exports = { compareBenchmarks, loadBenchmark };
