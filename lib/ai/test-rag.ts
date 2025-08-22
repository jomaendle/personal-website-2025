#!/usr/bin/env ts-node

import { initializeDatabase, testVectorSearch } from './init-db';
import { indexBlogPost, indexAllBlogPosts, getBlogFiles } from './blog-indexer';
import { quickSearch, performRAGRetrieval } from './rag-retrieval';
import { getDatabaseStats } from './vector-db';

/**
 * Comprehensive test suite for RAG functionality
 */
class RAGTester {
  private async logSection(title: string) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${title}`);
    console.log('='.repeat(60));
  }

  private async logSubsection(title: string) {
    console.log(`\n📋 ${title}`);
    console.log('-'.repeat(40));
  }

  /**
   * Test 1: Database initialization
   */
  async testDatabaseInit(): Promise<boolean> {
    await this.logSection('Test 1: Database Initialization');
    
    try {
      const initialized = await initializeDatabase();
      if (initialized) {
        console.log('✅ Database initialized successfully');
        return true;
      } else {
        console.log('❌ Database initialization failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      return false;
    }
  }

  /**
   * Test 2: Vector search functionality
   */
  async testVectorOperations(): Promise<boolean> {
    await this.logSection('Test 2: Vector Operations');
    
    try {
      const success = await testVectorSearch();
      if (success) {
        console.log('✅ Vector search operations working');
        return true;
      } else {
        console.log('❌ Vector search operations failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Vector operations error:', error);
      return false;
    }
  }

  /**
   * Test 3: Blog file discovery
   */
  async testBlogDiscovery(): Promise<boolean> {
    await this.logSection('Test 3: Blog File Discovery');
    
    try {
      const blogFiles = getBlogFiles();
      console.log(`📚 Found ${blogFiles.length} blog files`);
      
      if (blogFiles.length > 0) {
        await this.logSubsection('Blog Files Found:');
        blogFiles.forEach((file, index) => {
          const slug = file.split('/').slice(-2, -1)[0];
          console.log(`   ${index + 1}. ${slug} (${file})`);
        });
        console.log('✅ Blog discovery successful');
        return true;
      } else {
        console.log('⚠️  No blog files found');
        return false;
      }
    } catch (error) {
      console.error('❌ Blog discovery error:', error);
      return false;
    }
  }

  /**
   * Test 4: Single blog post indexing
   */
  async testSingleIndexing(): Promise<boolean> {
    await this.logSection('Test 4: Single Blog Post Indexing');
    
    try {
      const blogFiles = getBlogFiles();
      if (blogFiles.length === 0) {
        console.log('⚠️  No blog files to test indexing');
        return false;
      }

      // Test with the first blog post
      const testFile = blogFiles[0];
      const slug = testFile.split('/').slice(-2, -1)[0];
      
      console.log(`📄 Testing indexing of: ${slug}`);
      const success = await indexBlogPost(testFile);
      
      if (success) {
        console.log('✅ Single blog post indexing successful');
        return true;
      } else {
        console.log('❌ Single blog post indexing failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Single indexing error:', error);
      return false;
    }
  }

  /**
   * Test 5: Database statistics
   */
  async testDatabaseStats(): Promise<boolean> {
    await this.logSection('Test 5: Database Statistics');
    
    try {
      const stats = await getDatabaseStats();
      if (stats) {
        console.log(`📊 Database Statistics:`);
        console.log(`   📝 Total chunks: ${stats.totalChunks}`);
        console.log(`   📚 Unique blogs: ${stats.uniqueBlogs}`);
        console.log(`   🕒 Last updated: ${stats.lastUpdated.toISOString()}`);
        console.log('✅ Database stats retrieved successfully');
        return true;
      } else {
        console.log('❌ Failed to get database stats');
        return false;
      }
    } catch (error) {
      console.error('❌ Database stats error:', error);
      return false;
    }
  }

  /**
   * Test 6: Semantic search
   */
  async testSemanticSearch(): Promise<boolean> {
    await this.logSection('Test 6: Semantic Search');
    
    try {
      await this.logSubsection('Testing various search queries:');
      
      const testQueries = [
        'React components',
        'CSS animations',
        'JavaScript performance',
        'web development',
        'AI tools',
      ];

      let successCount = 0;

      for (const query of testQueries) {
        try {
          await quickSearch(query, 2);
          successCount++;
        } catch (error) {
          console.error(`❌ Search failed for "${query}":`, error);
        }
      }

      if (successCount > 0) {
        console.log(`✅ Semantic search working (${successCount}/${testQueries.length} queries successful)`);
        return true;
      } else {
        console.log('❌ All semantic searches failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Semantic search error:', error);
      return false;
    }
  }

  /**
   * Test 7: RAG retrieval
   */
  async testRAGRetrieval(): Promise<boolean> {
    await this.logSection('Test 7: RAG Retrieval');
    
    try {
      const testQuery = 'How to create React components?';
      console.log(`🤖 Testing RAG retrieval for: "${testQuery}"`);
      
      const context = await performRAGRetrieval(testQuery, [], {
        maxResults: 3,
        similarityThreshold: 0.6,
      });

      console.log(`📚 Retrieved ${context.retrievedChunks.length} relevant chunks`);
      
      if (context.retrievedChunks.length > 0) {
        await this.logSubsection('Retrieved Content Preview:');
        context.retrievedChunks.forEach((result, index) => {
          const { chunk, similarity } = result;
          console.log(`   ${index + 1}. ${chunk.metadata.title} (${(similarity * 100).toFixed(1)}%)`);
          console.log(`      Preview: ${chunk.content.substring(0, 80)}...`);
        });
        console.log('✅ RAG retrieval successful');
        return true;
      } else {
        console.log('⚠️  No content retrieved - may need more indexed content');
        return false;
      }
    } catch (error) {
      console.error('❌ RAG retrieval error:', error);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting RAG System Test Suite');
    console.log('Started at:', new Date().toISOString());
    
    const tests = [
      { name: 'Database Initialization', fn: () => this.testDatabaseInit() },
      { name: 'Vector Operations', fn: () => this.testVectorOperations() },
      { name: 'Blog Discovery', fn: () => this.testBlogDiscovery() },
      { name: 'Single Indexing', fn: () => this.testSingleIndexing() },
      { name: 'Database Stats', fn: () => this.testDatabaseStats() },
      { name: 'Semantic Search', fn: () => this.testSemanticSearch() },
      { name: 'RAG Retrieval', fn: () => this.testRAGRetrieval() },
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
      console.log('\n🎉 All tests passed! RAG system is ready.');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Check the output above for details.`);
    }

    console.log('\nCompleted at:', new Date().toISOString());
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const tester = new RAGTester();

  if (args.length === 0 || args[0] === 'all') {
    await tester.runAllTests();
  } else {
    switch (args[0]) {
      case 'init':
        await tester.testDatabaseInit();
        break;
      case 'vector':
        await tester.testVectorOperations();
        break;
      case 'discover':
        await tester.testBlogDiscovery();
        break;
      case 'index':
        await tester.testSingleIndexing();
        break;
      case 'stats':
        await tester.testDatabaseStats();
        break;
      case 'search':
        await tester.testSemanticSearch();
        break;
      case 'rag':
        await tester.testRAGRetrieval();
        break;
      case 'quick':
        if (args[1]) {
          await quickSearch(args.slice(1).join(' '));
        } else {
          console.log('Usage: npm run test:rag quick "your search query"');
        }
        break;
      default:
        console.log('Usage: npm run test:rag [init|vector|discover|index|stats|search|rag|quick|all]');
    }
  }
}

// Export for programmatic use
export { RAGTester };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}