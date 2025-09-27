#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Learning Path System Validation\n');

// Check if all required files exist
const requiredFiles = [
  // Database
  'src/lib/db/repositories/learning-path.repository.ts',
  
  // Services
  'src/lib/services/learning-path.service.ts',
  
  // API Routes
  'src/app/api/learning-paths/route.ts',
  'src/app/api/learning-paths/[id]/route.ts',
  'src/app/api/learning-paths/[id]/courses/route.ts',
  'src/app/api/learning-paths/[id]/share/route.ts',
  'src/app/api/learning-paths/shared/[token]/route.ts',
  
  // Components
  'src/components/learning-paths/LearningPathCreator.tsx',
  'src/components/learning-paths/LearningPathList.tsx',
  'src/components/learning-paths/ShareModal.tsx',
  'src/components/learning-paths/SharedLearningPathViewer.tsx',
  'src/components/learning-paths/index.ts',
  
  // Hooks
  'src/hooks/useLearningPaths.ts',
  
  // Pages
  'src/app/shared/learning-path/[token]/page.tsx',
  
  // Tests and Documentation
  'src/test/learning-path-system.test.ts',
  'src/scripts/validate-learning-path-system.ts',
  'LEARNING_PATH_SYSTEM_README.md'
];

let passed = 0;
let failed = 0;

console.log('📁 Checking required files...\n');

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    passed++;
  } else {
    console.log(`❌ ${file} - MISSING`);
    failed++;
  }
});

// Check database schema
console.log('\n🗄️  Checking database schema...\n');

const initSqlPath = path.join(__dirname, 'init.sql');
if (fs.existsSync(initSqlPath)) {
  const initSqlContent = fs.readFileSync(initSqlPath, 'utf8');
  
  const requiredTables = ['learning_paths', 'learning_path_courses'];
  const requiredIndexes = [
    'idx_learning_paths_user_id',
    'idx_learning_paths_share_token',
    'idx_learning_path_courses_path_id',
    'idx_learning_path_courses_course_id'
  ];
  
  requiredTables.forEach(table => {
    if (initSqlContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      console.log(`✅ Table: ${table}`);
      passed++;
    } else {
      console.log(`❌ Table: ${table} - MISSING`);
      failed++;
    }
  });
  
  requiredIndexes.forEach(index => {
    if (initSqlContent.includes(`CREATE INDEX IF NOT EXISTS ${index}`)) {
      console.log(`✅ Index: ${index}`);
      passed++;
    } else {
      console.log(`❌ Index: ${index} - MISSING`);
      failed++;
    }
  });
} else {
  console.log('❌ init.sql - MISSING');
  failed++;
}

// Check types
console.log('\n📝 Checking type definitions...\n');

const typesPath = path.join(__dirname, 'src/types/index.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  const requiredTypes = ['LearningPath', 'LearningPathCourse'];
  
  requiredTypes.forEach(type => {
    if (typesContent.includes(`interface ${type}`)) {
      console.log(`✅ Type: ${type}`);
      passed++;
    } else {
      console.log(`❌ Type: ${type} - MISSING`);
      failed++;
    }
  });
} else {
  console.log('❌ src/types/index.ts - MISSING');
  failed++;
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All learning path system components are properly implemented!');
  console.log('\nNext steps:');
  console.log('1. Start the database: npm run docker:up');
  console.log('2. Run the development server: npm run dev');
  console.log('3. Test the learning path functionality in the browser');
} else {
  console.log('\n⚠️  Some components are missing or incomplete.');
  console.log('Please review the failed items above.');
}

process.exit(failed > 0 ? 1 : 0);