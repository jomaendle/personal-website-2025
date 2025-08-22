import { getBlogFiles, parseMDXFile, createBlogChunks } from './blog-indexer';

async function testBlogProcessing() {
  console.log('🧪 Testing Blog Processing...\n');
  
  try {
    // Test 1: Blog file discovery
    console.log('📚 Testing blog file discovery...');
    const blogFiles = getBlogFiles();
    console.log(`✅ Found ${blogFiles.length} blog files`);
    
    if (blogFiles.length === 0) {
      console.log('⚠️  No blog files found. Exiting test.');
      return;
    }
    
    // List all blog files
    blogFiles.forEach((file, index) => {
      const slug = file.split('/').slice(-2, -1)[0];
      console.log(`   ${index + 1}. ${slug}`);
    });
    
    // Test 2: Parse a single MDX file
    console.log('\n📄 Testing MDX parsing...');
    const testFile = blogFiles[0];
    const blogPost = parseMDXFile(testFile);
    
    if (blogPost) {
      console.log(`✅ Successfully parsed: ${blogPost.title}`);
      console.log(`   Slug: ${blogPost.slug}`);
      console.log(`   Date: ${blogPost.date}`);
      console.log(`   Content length: ${blogPost.content.length} characters`);
      
      // Test 3: Create chunks
      console.log('\n✂️  Testing content chunking...');
      const chunks = createBlogChunks(blogPost);
      console.log(`✅ Created ${chunks.length} chunks`);
      
      chunks.forEach((chunk, index) => {
        console.log(`   Chunk ${index + 1}: ${chunk.content.length} chars`);
        if (chunk.metadata.section) {
          console.log(`      Section: ${chunk.metadata.section}`);
        }
      });
      
      console.log('\n🎉 Blog processing test completed successfully!');
    } else {
      console.log('❌ Failed to parse MDX file');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testBlogProcessing();
}