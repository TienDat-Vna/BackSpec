#!/usr/bin/env node

/**
 * tests/test-skill-system.js
 * Unit/Integration test for Registry skills and rule synchronizer.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

console.log('[TEST-SKILLS] Running Registry skill & rule synchronization test...');

try {
  // Test BackSpec Sync
  execSync('node bin/backspec.js sync', { cwd: root, stdio: 'inherit' });
  console.log('✅ BackSpec sync check passed.');

  // Test project validation
  execSync('node tests/validate-project.js', { cwd: root, stdio: 'inherit' });
  console.log('✅ Project validation check passed.');

  console.log('[TEST-SKILLS] All Registry system tests passed successfully!');
  process.exit(0);
} catch (err) {
  console.error('[TEST-SKILLS] Test failed:', err.message);
  process.exit(1);
}
