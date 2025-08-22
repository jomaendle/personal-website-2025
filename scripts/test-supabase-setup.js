#!/usr/bin/env node

config = require("dotenv").config();

/**
 * Test script to check what Supabase Vector components are set up
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSetup() {
  console.log("🔍 Testing Supabase Vector Database Setup\n");

  // Test 1: Check if blog_chunks table exists
  console.log("1. Testing blog_chunks table...");
  try {
    const { data, error } = await supabase
      .from("blog_chunks")
      .select("*")
      .limit(1);

    if (error) {
      console.log(`   ❌ blog_chunks table: ${error.message}`);
    } else {
      console.log(`   ✅ blog_chunks table exists`);
    }
  } catch (err) {
    console.log(`   ❌ blog_chunks table: ${err.message}`);
  }

  // Test 2: Check if vector extension is available
  console.log("\n2. Testing vector extension...");
  try {
    const { data, error } = await supabase.rpc("vector_dims", {
      v: "[0.1,0.2,0.3]",
    });

    if (error) {
      console.log(`   ❌ Vector extension: ${error.message}`);
    } else {
      console.log(`   ✅ Vector extension working`);
    }
  } catch (err) {
    console.log(`   ❌ Vector extension: ${err.message}`);
  }

  // Test 3: Check search_blog_chunks function
  console.log("\n3. Testing search_blog_chunks function...");
  try {
    const testEmbedding = Array(1536).fill(0.1);
    const { data, error } = await supabase.rpc("search_blog_chunks", {
      query_embedding: JSON.stringify(testEmbedding),
      match_threshold: 0.1,
      match_count: 1,
    });

    if (error) {
      console.log(`   ❌ search_blog_chunks: ${error.message}`);
    } else {
      console.log(`   ✅ search_blog_chunks function working`);
    }
  } catch (err) {
    console.log(`   ❌ search_blog_chunks: ${err.message}`);
  }

  // Test 4: Check get_embedding_stats function
  console.log("\n4. Testing get_embedding_stats function...");
  try {
    const { data, error } = await supabase.rpc("get_embedding_stats");

    if (error) {
      console.log(`   ❌ get_embedding_stats: ${error.message}`);
    } else {
      console.log(`   ✅ get_embedding_stats function working`);
      console.log(`   📊 Current stats:`, data?.[0]);
    }
  } catch (err) {
    console.log(`   ❌ get_embedding_stats: ${err.message}`);
  }

  // Test 5: Test basic embedding storage
  console.log("\n5. Testing embedding storage...");
  try {
    const testEmbedding = Array(1536).fill(0.1);
    const { data, error } = await supabase
      .from("blog_chunks")
      .insert({
        blog_slug: "test-setup",
        chunk_index: 0,
        content: "Test content for setup verification",
        embedding: JSON.stringify(testEmbedding),
        metadata: { test: true },
      })
      .select();

    if (error) {
      console.log(`   ❌ Embedding storage: ${error.message}`);
    } else {
      console.log(`   ✅ Embedding storage working`);

      // Clean up test data
      await supabase.from("blog_chunks").delete().eq("blog_slug", "test-setup");
      console.log(`   🧹 Test data cleaned up`);
    }
  } catch (err) {
    console.log(`   ❌ Embedding storage: ${err.message}`);
  }

  console.log("\n📋 Setup Summary:");
  console.log(
    "If you see any ❌ errors above, you need to run these SQL commands in Supabase:",
  );
  console.log("\n1. Enable vector extension:");
  console.log("   CREATE EXTENSION IF NOT EXISTS vector;");
  console.log(
    "\n2. Create search function (copy from lib/ai/supabase-setup.sql)",
  );
  console.log("3. Create stats function (copy from lib/ai/supabase-setup.sql)");
  console.log("\n✅ = Ready to proceed with blog indexing");
  console.log("❌ = Needs manual setup in Supabase SQL Editor");
}

testDatabaseSetup().catch(console.error);
