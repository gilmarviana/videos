#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Webhook System Validation...\n');

try {
  // Run the TypeScript validation script
  const scriptPath = path.join(__dirname, 'src/scripts/validate-webhook-system.ts');
  execSync(`npx tsx ${scriptPath}`, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
} catch (error) {
  console.error('❌ Webhook system validation failed');
  process.exit(1);
}