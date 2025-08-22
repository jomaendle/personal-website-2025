#!/usr/bin/env tsx

/**
 * Test script to check what Supabase Vector components are set up
 * Run with: npx tsx scripts/test-supabase-setup.ts
 */

import { supabase } from '@/lib/supabaseClient';

async function testDatabaseSetup() {
  console.log('🔍 Testing Supabase Vector Database Setup\n');

  // Test 1: Check if blog_chunks table exists
  console.log('1. Testing blog_chunks table...');
  try {
    const { data, error } = await supabase
      .from('blog_chunks')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ blog_chunks table: ${error.message}`);
    } else {
      console.log(`   ✅ blog_chunks table exists`);
    }
  } catch (err: any) {
    console.log(`   ❌ blog_chunks table: ${err.message}`);
  }

  // Test 2: Check if vector extension is available by testing a simple vector operation
  console.log('\n2. Testing vector extension...');
  try {
    // Try to insert a test vector to see if the vector type works
    const testEmbedding = Array(1536).fill(0.1);
    const { error } = await supabase
      .from('blog_chunks')
      .insert({
        blog_slug: 'vector-test',
        chunk_index: 999999,
        content: 'Vector extension test',
        embedding: testEmbedding, // Direct array, not JSON string
        metadata: { test: true }
      });
    
    if (error) {
      console.log(`   ❌ Vector extension: ${error.message}`);
      
      // Try with JSON string format
      const { error: jsonError } = await supabase
        .from('blog_chunks')
        .insert({
          blog_slug: 'vector-test-json',
          chunk_index: 999998,
          content: 'Vector extension test JSON',
          embedding: JSON.stringify(testEmbedding), // JSON string format
          metadata: { test: true }
        });
        
      if (jsonError) {
        console.log(`   ❌ Vector extension (JSON format): ${jsonError.message}`);
      } else {
        console.log(`   ✅ Vector extension working (JSON format)`);
        // Clean up
        await supabase.from('blog_chunks').delete().eq('blog_slug', 'vector-test-json');
      }
    } else {
      console.log(`   ✅ Vector extension working (direct array)`);
      // Clean up
      await supabase.from('blog_chunks').delete().eq('blog_slug', 'vector-test');
    }
  } catch (err: any) {
    console.log(`   ❌ Vector extension: ${err.message}`);
  }

  // Test 3: Check search_blog_chunks function
  console.log('\n3. Testing search_blog_chunks function...');
  try {
    const testEmbedding = Array(1536).fill(0.1);
    const { data, error } = await supabase.rpc('search_blog_chunks', {
      query_embedding: testEmbedding,
      match_threshold: 0.1,
      match_count: 1
    });
    
    if (error) {
      console.log(`   ❌ search_blog_chunks: ${error.message}`);
    } else {
      console.log(`   ✅ search_blog_chunks function working`);
    }
  } catch (err: any) {
    console.log(`   ❌ search_blog_chunks: ${err.message}`);
  }

  // Test 4: Check get_embedding_stats function
  console.log('\n4. Testing get_embedding_stats function...');
  try {
    const { data, error } = await supabase.rpc('get_embedding_stats');
    
    if (error) {
      console.log(`   ❌ get_embedding_stats: ${error.message}`);
    } else {
      console.log(`   ✅ get_embedding_stats function working`);
      console.log(`   📊 Current stats:`, data?.[0]);
    }
  } catch (err: any) {
    console.log(`   ❌ get_embedding_stats: ${err.message}`);
  }

  console.log('\n📋 Setup Summary:');
  console.log('If you see any ❌ errors above, you need to add these to Supabase SQL Editor:');
  console.log('\n1. Vector extension (if not working):');
  console.log('   CREATE EXTENSION IF NOT EXISTS vector;');
  console.log('\n2. Search function (from lib/ai/supabase-setup.sql):');
  console.log('   CREATE OR REPLACE FUNCTION search_blog_chunks(...)');
  console.log('\n3. Stats function (from lib/ai/supabase-setup.sql):');
  console.log('   CREATE OR REPLACE FUNCTION get_embedding_stats(...)');
  console.log('\n✅ = Ready to proceed with blog indexing');
  console.log('❌ = Needs manual setup in Supabase SQL Editor');
}

testDatabaseSetup().catch(console.error);