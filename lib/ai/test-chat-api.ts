#!/usr/bin/env ts-node

import { ChatMessage } from '@/lib/types/chat';

/**
 * Simple test to verify the chat API endpoint structure and basic functionality
 */
class ChatAPITester {
  private baseUrl = 'http://localhost:3000';

  /**
   * Test the chat API endpoint
   */
  async testChatEndpoint(): Promise<boolean> {
    try {
      console.log('🧪 Testing Chat API Endpoint...');
      
      const testMessages: ChatMessage[] = [];
      const testQuery = 'What topics do you cover in your blog?';

      const response = await fetch(`${this.baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: testMessages,
          query: testQuery
        })
      });

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📋 Response headers:`, Object.fromEntries(response.headers));

      if (response.ok) {
        console.log('✅ Chat API endpoint is accessible');
        return true;
      } else {
        console.log(`❌ Chat API returned status: ${response.status}`);
        const errorText = await response.text();
        console.log(`Error response: ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing chat API:', error);
      return false;
    }
  }

  /**
   * Test component structure validation
   */
  async testComponentStructure(): Promise<boolean> {
    try {
      console.log('\n🧪 Testing Component Structure...');
      
      // Test if all required files exist
      const fs = require('fs');
      const path = require('path');
      
      const requiredFiles = [
        'components/chat/ai-chat.tsx',
        'components/chat/chat-input.tsx',
        'components/chat/chat-message.tsx',
        'components/chat/chat-floating-button.tsx',
        'components/chat/chat-suggestions.tsx',
        'components/chat/chat-wrapper.tsx',
        'pages/api/ai/chat.ts',
        'lib/ai/embeddings.ts',
        'lib/ai/rag-retrieval.ts',
        'lib/types/chat.ts'
      ];

      let missingFiles = 0;
      for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          console.log(`✅ ${file}`);
        } else {
          console.log(`❌ ${file} - MISSING`);
          missingFiles++;
        }
      }

      if (missingFiles === 0) {
        console.log('✅ All component files are present');
        return true;
      } else {
        console.log(`❌ ${missingFiles} files are missing`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing component structure:', error);
      return false;
    }
  }

  /**
   * Test TypeScript compilation
   */
  async testTypeScriptCompilation(): Promise<boolean> {
    try {
      console.log('\n🧪 Testing TypeScript Compilation...');
      
      const { execSync } = require('child_process');
      
      // Run TypeScript compiler to check for errors
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error: any) {
      console.log('❌ TypeScript compilation errors found:');
      console.log(error.stdout?.toString() || error.message);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Chat Implementation Tests');
    console.log('Started at:', new Date().toISOString());
    console.log('='.repeat(60));

    const tests = [
      { name: 'Component Structure', fn: () => this.testComponentStructure() },
      { name: 'TypeScript Compilation', fn: () => this.testTypeScriptCompilation() },
      { name: 'Chat API Endpoint', fn: () => this.testChatEndpoint() }
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
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Test Summary');
    console.log('='.repeat(60));
    
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
      console.log('\n🎉 All tests passed! Chat implementation is ready.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Set up Supabase Vector database (run SQL from lib/ai/supabase-setup.sql)');
      console.log('   2. Index your blog content (POST to /api/ai/index-blog with action: "index-all")');
      console.log('   3. Start the development server and test the chat interface');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Check the output above for details.`);
    }

    console.log('\nCompleted at:', new Date().toISOString());
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new ChatAPITester();
  tester.runAllTests().catch(console.error);
}

export { ChatAPITester };