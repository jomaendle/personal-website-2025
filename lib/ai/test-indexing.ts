#!/usr/bin/env ts-node

import { initializeDatabase } from './init-db';
import { indexBlogPost, getBlogFiles, parseMDXFile } from './blog-indexer';
import { enhancedSemanticSearch, quickSearch } from './rag-retrieval';
import { getDatabaseStats } from './vector-db';

/**
 * Test indexing and retrieval accuracy
 */
class IndexingTester {
  private async logSection(title: string) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ${title}`);
    console.log('='.repeat(60));
  }

  /**
   * Test 1: Initialize database and index a few blog posts
   */
  async testIndexing(): Promise<boolean> {
    await this.logSection('Testing Blog Indexing');

    try {
      // Initialize database
      console.log('🔧 Initializing database...');
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        console.log('❌ Database initialization failed');
        return false;
      }
      console.log('✅ Database initialized');

      // Get blog files
      const blogFiles = getBlogFiles();
      console.log(`📚 Found ${blogFiles.length} blog files`);

      if (blogFiles.length === 0) {
        console.log('⚠️  No blog files to index');
        return false;
      }

      // Index first 3 blog posts for testing
      const testFiles = blogFiles.slice(0, 3);
      let successCount = 0;

      for (const file of testFiles) {
        const blogPost = parseMDXFile(file);
        if (blogPost) {
          console.log(`📄 Indexing: ${blogPost.title || blogPost.slug}`);
          const success = await indexBlogPost(file);
          if (success) {
            successCount++;
            console.log(`✅ Successfully indexed ${blogPost.slug}`);
          } else {
            console.log(`❌ Failed to index ${blogPost.slug}`);
          }
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`\n📊 Indexing Results: ${successCount}/${testFiles.length} successful`);
      return successCount > 0;

    } catch (error) {
      console.error('❌ Indexing test failed:', error);
      return false;
    }
  }

  /**
   * Test 2: Search accuracy with known queries
   */
  async testSearchAccuracy(): Promise<boolean> {
    await this.logSection('Testing Search Accuracy');

    // Test queries that should return results based on typical blog content
    const testQueries = [
      {
        query: 'React components',
        expectResults: true,
        description: 'Should find React-related content'
      },
      {
        query: 'CSS animations',
        expectResults: true,
        description: 'Should find CSS animation content'
      },
      {
        query: 'JavaScript performance',
        expectResults: true,
        description: 'Should find JavaScript performance content'
      },
      {
        query: 'nonexistent topic xyz123',
        expectResults: false,
        description: 'Should not find results for non-existent topics'
      }
    ];

    let passedTests = 0;
    const totalTests = testQueries.length;

    for (const test of testQueries) {
      try {
        console.log(`\n🔍 Testing: "${test.query}"`);
        console.log(`   Expected: ${test.expectResults ? 'Results found' : 'No results'}`);
        
        const results = await enhancedSemanticSearch(test.query, {
          maxResults: 3,
          similarityThreshold: 0.6
        });

        const hasResults = results.length > 0;
        const testPassed = hasResults === test.expectResults;

        if (testPassed) {
          console.log(`✅ PASS: ${test.description}`);
          if (hasResults) {
            console.log(`   Found ${results.length} results:`);
            results.forEach((result, index) => {
              const similarity = (result.similarity * 100).toFixed(1);
              const title = result.chunk.metadata.title || result.chunk.blog_slug;
              console.log(`     ${index + 1}. ${title} (${similarity}%)`);
            });
          }
          passedTests++;
        } else {
          console.log(`❌ FAIL: ${test.description}`);
          console.log(`   Expected ${test.expectResults ? 'results' : 'no results'}, got ${hasResults ? 'results' : 'no results'}`);
        }

      } catch (error) {
        console.log(`❌ ERROR: Failed to test "${test.query}":`, error);
      }
    }

    const accuracy = (passedTests / totalTests) * 100;
    console.log(`\n📊 Search Accuracy: ${passedTests}/${totalTests} tests passed (${accuracy.toFixed(1)}%)`);
    
    return passedTests >= totalTests * 0.75; // 75% pass rate required
  }

  /**
   * Test 3: Similarity threshold testing
   */
  async testSimilarityThresholds(): Promise<boolean> {
    await this.logSection('Testing Similarity Thresholds');

    const testQuery = 'React components';
    const thresholds = [0.9, 0.8, 0.7, 0.6, 0.5];

    console.log(`🔍 Testing query: "${testQuery}" with different thresholds`);
    console.log('Threshold | Results | Top Result Similarity');
    console.log('-'.repeat(45));

    let validResults = 0;

    for (const threshold of thresholds) {
      try {
        const results = await enhancedSemanticSearch(testQuery, {
          maxResults: 5,
          similarityThreshold: threshold
        });

        const topSimilarity = results.length > 0 
          ? (results[0].similarity * 100).toFixed(1) + '%'
          : 'N/A';

        console.log(`${threshold.toFixed(1).padEnd(9)} | ${results.length.toString().padEnd(7)} | ${topSimilarity}`);

        if (results.length > 0) {
          validResults++;
        }
      } catch (error) {
        console.log(`${threshold.toFixed(1).padEnd(9)} | ERROR   | N/A`);
      }
    }

    console.log(`\n✅ Similarity threshold testing completed`);
    console.log(`📊 ${validResults}/${thresholds.length} thresholds returned results`);
    
    return validResults > 0;
  }

  /**
   * Test 4: Database statistics and health
   */
  async testDatabaseHealth(): Promise<boolean> {
    await this.logSection('Database Health Check');

    try {
      const stats = await getDatabaseStats();
      
      if (!stats) {
        console.log('❌ Unable to retrieve database statistics');
        return false;
      }

      console.log('📊 Database Statistics:');
      console.log(`   📝 Total chunks: ${stats.totalChunks}`);
      console.log(`   📚 Unique blogs: ${stats.uniqueBlogs}`);
      console.log(`   🕒 Last updated: ${stats.lastUpdated.toISOString()}`);

      // Health checks
      const checks = [
        {
          name: 'Has indexed content',
          condition: stats.totalChunks > 0,
          message: `Found ${stats.totalChunks} chunks`
        },
        {
          name: 'Multiple blogs indexed',
          condition: stats.uniqueBlogs > 1,
          message: `${stats.uniqueBlogs} unique blogs indexed`
        },
        {
          name: 'Recent updates',
          condition: Date.now() - stats.lastUpdated.getTime() < 24 * 60 * 60 * 1000, // 24 hours
          message: `Last updated ${Math.round((Date.now() - stats.lastUpdated.getTime()) / (60 * 60 * 1000))} hours ago`
        }
      ];

      let passedChecks = 0;
      console.log('\n🔍 Health Checks:');
      
      for (const check of checks) {
        if (check.condition) {
          console.log(`✅ ${check.name}: ${check.message}`);
          passedChecks++;
        } else {
          console.log(`❌ ${check.name}: ${check.message}`);
        }
      }

      const healthScore = (passedChecks / checks.length) * 100;
      console.log(`\n📊 Database Health Score: ${healthScore.toFixed(1)}%`);
      
      return healthScore >= 66; // At least 2/3 checks should pass
      
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Run all indexing and retrieval tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Indexing & Retrieval Test Suite');
    console.log('Started at:', new Date().toISOString());

    const tests = [
      { name: 'Blog Indexing', fn: () => this.testIndexing() },
      { name: 'Search Accuracy', fn: () => this.testSearchAccuracy() },
      { name: 'Similarity Thresholds', fn: () => this.testSimilarityThresholds() },
      { name: 'Database Health', fn: () => this.testDatabaseHealth() }
    ];

    const results: { name: string; passed: boolean; duration: number }[] = [];

    for (const test of tests) {
      const startTime = Date.now();
      try {
        const passed = await test.fn();
        const duration = Date.now() - startTime;
        results.push({ name: test.name, passed, duration });
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ Test "${test.name}" threw an error:`, error);
        results.push({ name: test.name, passed: false, duration });
      }
    }

    // Final summary
    await this.logSection('Test Summary');
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);
    console.log(`⏱️  Total duration: ${(totalDuration / 1000).toFixed(2)}s\n`);

    results.forEach((result) => {
      const status = result.passed ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(2);
      console.log(`${status} ${result.name} (${duration}s)`);
    });

    if (passedTests === totalTests) {
      console.log('\n🎉 All indexing tests passed! Content indexing is working correctly.');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Check the output above for details.`);
    }

    console.log('\nCompleted at:', new Date().toISOString());
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new IndexingTester();
  tester.runAllTests().catch(console.error);
}

export { IndexingTester };