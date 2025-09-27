#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🚀 Running WhatsApp System validation...\n');
  
  const scriptPath = path.join(__dirname, 'src', 'scripts', 'validate-whatsapp-system.ts');
  execSync(`npx tsx "${scriptPath}"`, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ WhatsApp System validation completed successfully!');
} catch (error) {
  console.error('\n❌ WhatsApp System validation failed:', error.message);
  process.exit(1);
}