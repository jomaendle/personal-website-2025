#!/usr/bin/env node

// Simple Node.js script to test RAG functionality
const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing RAG System...\n');

try {
  // Run the TypeScript test file using npx
  const testFile = path.join(__dirname, '../lib/ai/test-rag.ts');
  execSync(`npx tsx "${testFile}"`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}