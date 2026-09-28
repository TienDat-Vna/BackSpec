#!/usr/bin/env node

/**
 * 04-management/tools/test-skill-system.js
 * Unit/Integration test for skills and rule synchronizer across 4 folders.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');

console.log('[TEST-SKILLS] Running 4-Folder skill & rule synchronization test...');

try {
  // Test rule sync
  execSync('node 04-management/tools/sync-shared-rules.js --check', { cwd: root, stdio: 'inherit' });
  console.log('✅ Rule sync check passed.');

  // Test skill sync
  execSync('node 04-management/tools/sync-shared-skills.js --check', { cwd: root, stdio: 'inherit' });
  console.log('✅ Skill sync check passed.');

  // Test project validation
  execSync('node 04-management/tools/validate-project.js', { cwd: root, stdio: 'inherit' });
  console.log('✅ Project validation check passed.');

  console.log('[TEST-SKILLS] All 4-Folder system tests passed successfully!');
  process.exit(0);
} catch (err) {
  console.error('[TEST-SKILLS] Test failed:', err.message);
  process.exit(1);
}
