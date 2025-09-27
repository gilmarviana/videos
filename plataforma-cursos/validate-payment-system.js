#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Payment System Validation\n');

// Check if required files exist
const requiredFiles = [
  'src/lib/payments/stripe.config.ts',
  'src/lib/payments/payment.service.ts',
  'src/lib/db/repositories/subscription.repository.ts',
  'src/lib/auth/subscription-middleware.ts',
  'src/app/api/payments/create-subscription/route.ts',
  'src/app/api/payments/cancel-subscription/route.ts',
  'src/app/api/payments/subscription-status/route.ts',
  'src/app/api/payments/webhook/route.ts',
  'src/components/payments/SubscriptionCard.tsx',
  'src/components/payments/PaymentForm.tsx',
  'PAYMENT_SYSTEM_README.md'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

// Check environment variables
console.log('\n🔧 Checking environment configuration...');
const envExample = fs.readFileSync('.env.example', 'utf8');

const requiredEnvVars = [
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUBSCRIPTION_PRICE',
  'SUBSCRIPTION_CURRENCY'
];

for (const envVar of requiredEnvVars) {
  if (envExample.includes(envVar)) {
    console.log(`✅ ${envVar} configured in .env.example`);
  } else {
    console.log(`❌ ${envVar} missing from .env.example`);
  }
}

// Check database schema
console.log('\n🗄️  Checking database schema...');
const initSql = fs.readFileSync('init.sql', 'utf8');

const requiredTables = ['subscriptions'];
const requiredColumns = [
  'user_id', 'amount', 'currency', 'status',
  'current_period_start', 'current_period_end', 'payment_gateway_id'
];

for (const table of requiredTables) {
  if (initSql.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
    console.log(`✅ Table ${table} defined`);
  } else {
    console.log(`❌ Table ${table} missing`);
  }
}

for (const column of requiredColumns) {
  if (initSql.includes(column)) {
    console.log(`✅ Column ${column} found`);
  } else {
    console.log(`❌ Column ${column} missing`);
  }
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredDeps = ['stripe', '@stripe/stripe-js'];

for (const dep of requiredDeps) {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} installed`);
  } else {
    console.log(`❌ ${dep} missing`);
  }
}

// Summary
console.log('\n📊 Summary:');
if (allFilesExist) {
  console.log('🎉 All payment system files are present!');
} else {
  console.log('⚠️  Some payment system files are missing.');
}

console.log('\n💡 Next steps:');
console.log('1. Configure Stripe keys in .env.local');
console.log('2. Set up Stripe webhook endpoints');
console.log('3. Test payment flows in development');
console.log('4. Run integration tests');

console.log('\n✨ Payment system validation complete!');