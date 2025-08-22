#!/usr/bin/env tsx

/**
 * Test script to debug vector search functionality
 * Run with: npx tsx scripts/test-vector-search.ts
 */

import { generateEmbedding } from '@/lib/ai/embeddings';
import { performSemanticSearch } from '@/lib/ai/vector-db';

async function testVectorSearch() {
  console.log('🔍 Testing Vector Search Functionality\n');

  // Test 1: Check if we have any data at all
  console.log('1. Testing basic search with very low threshold...');
  try {
    const testEmbedding = await generateEmbedding('test');
    const results = await performSemanticSearch(testEmbedding.embedding, 5, 0.1); // Very low threshold
    console.log(`   Found ${results.length} results with threshold 0.1`);
    
    if (results.length > 0) {
      console.log(`   First result: ${results[0].chunk.blog_slug} (similarity: ${results[0].similarity})`);
      console.log(`   Content preview: ${results[0].chunk.content.substring(0, 100)}...`);
    }
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Test 2: Search for specific blog post content
  console.log('\n2. Testing search for "animations"...');
  try {
    const animationEmbedding = await generateEmbedding('animations');
    const animationResults = await performSemanticSearch(animationEmbedding.embedding, 5, 0.3);
    console.log(`   Found ${animationResults.length} results for "animations"`);
    
    animationResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.chunk.blog_slug} (${result.similarity.toFixed(3)})`);
    });
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Test 3: Search for "CSS"
  console.log('\n3. Testing search for "CSS"...');
  try {
    const cssEmbedding = await generateEmbedding('CSS');
    const cssResults = await performSemanticSearch(cssEmbedding.embedding, 5, 0.3);
    console.log(`   Found ${cssResults.length} results for "CSS"`);
    
    cssResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.chunk.blog_slug} (${result.similarity.toFixed(3)})`);
    });
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Test 4: List some actual content from database
  console.log('\n4. Testing raw database content...');
  try {
    const { supabase } = await import('@/lib/supabaseClient');
    const { data, error } = await supabase
      .from('blog_chunks')
      .select('blog_slug, chunk_index, content')
      .limit(3);
    
    if (error) {
      console.log(`   ❌ Database error: ${error.message}`);
    } else {
      console.log(`   Found ${data?.length} chunks in database:`);
      data?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. ${chunk.blog_slug}[${chunk.chunk_index}]: ${chunk.content.substring(0, 60)}...`);
      });
    }
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
  }
}

testVectorSearch().catch(console.error);