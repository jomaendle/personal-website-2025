import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { BlogChunk, BlogPost, EmbeddingStats } from '../types/chat';
import { generateBatchEmbeddings } from './embeddings';
import { storeBlogChunks } from './vector-db';

interface ChunkOptions {
  maxChunkSize: number;
  overlapSize: number;
  preserveCodeBlocks: boolean;
  preserveHeadings: boolean;
}

const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  maxChunkSize: 1000, // characters
  overlapSize: 200,   // characters overlap between chunks
  preserveCodeBlocks: true,
  preserveHeadings: true,
};

/**
 * Extract metadata and content from an MDX file
 */
export function parseMDXFile(filePath: string): BlogPost | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: metadata, content } = matter(fileContent);

    // Extract slug from file path
    const slug = path.basename(path.dirname(filePath));

    return {
      slug,
      title: metadata.title || '',
      date: metadata.date || '',
      description: metadata.description || '',
      keywords: metadata.keywords || '',
      category: metadata.category || '',
      readTime: metadata.readTime || '',
      author: metadata.author || 'Johannes Mändle',
      content: content.trim(),
    };
  } catch (error) {
    console.error(`Error parsing MDX file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all blog post files from the app/blog directory
 */
export function getBlogFiles(): string[] {
  const blogDir = path.join(process.cwd(), 'app/blog');
  
  if (!fs.existsSync(blogDir)) {
    console.error('Blog directory not found:', blogDir);
    return [];
  }

  const blogFiles: string[] = [];
  
  try {
    const entries = fs.readdirSync(blogDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const mdxFile = path.join(blogDir, entry.name, 'page.mdx');
        if (fs.existsSync(mdxFile)) {
          blogFiles.push(mdxFile);
        }
      }
    }
  } catch (error) {
    console.error('Error reading blog directory:', error);
  }

  return blogFiles;
}

/**
 * Smart text chunking that preserves semantic boundaries
 */
export function chunkBlogContent(
  content: string, 
  options: Partial<ChunkOptions> = {}
): string[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options };
  const chunks: string[] = [];

  // Remove MDX imports and exports
  const cleanContent = content
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+.*$/gm, '')
    .trim();

  // Split by double newlines first (paragraphs/sections)
  const sections = cleanContent.split(/\n\s*\n/);
  
  let currentChunk = '';
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    if (!trimmedSection) continue;

    // Check if this is a heading
    const isHeading = trimmedSection.startsWith('#');
    
    // Check if this is a code block
    const isCodeBlock = trimmedSection.includes('```') || 
                       trimmedSection.includes('<CodeBlock') ||
                       trimmedSection.includes('<Sandpack');

    // If adding this section would exceed the chunk size
    if (currentChunk.length + trimmedSection.length > opts.maxChunkSize && currentChunk.length > 0) {
      // Save current chunk if it's not empty
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      // Start new chunk
      if (isHeading || isCodeBlock || opts.preserveHeadings) {
        // For headings and code blocks, start fresh
        currentChunk = trimmedSection;
      } else {
        // For regular text, include overlap from previous chunk
        const overlapStart = Math.max(0, currentChunk.length - opts.overlapSize);
        const overlap = currentChunk.substring(overlapStart);
        currentChunk = overlap + '\n\n' + trimmedSection;
      }
    } else {
      // Add to current chunk
      if (currentChunk) {
        currentChunk += '\n\n' + trimmedSection;
      } else {
        currentChunk = trimmedSection;
      }
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Filter out very small chunks (less than 50 characters)
  return chunks.filter(chunk => chunk.length >= 50);
}

/**
 * Extract section heading from chunk content
 */
function extractSectionHeading(content: string): string | undefined {
  const headingMatch = content.match(/^#+\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : undefined;
}

/**
 * Create blog chunks with metadata from a blog post
 */
export function createBlogChunks(blogPost: BlogPost, options?: Partial<ChunkOptions>): BlogChunk[] {
  const textChunks = chunkBlogContent(blogPost.content, options);
  
  return textChunks.map((content, index) => ({
    id: uuidv4(),
    blog_slug: blogPost.slug,
    chunk_index: index,
    content,
    metadata: {
      title: blogPost.title,
      section: extractSectionHeading(content),
      tags: blogPost.keywords ? blogPost.keywords.split(',').map(t => t.trim()) : [],
      url: `/blog/${blogPost.slug}`,
      date: blogPost.date,
      author: blogPost.author,
    },
  }));
}

/**
 * Index a single blog post (parse, chunk, embed, store)
 */
export async function indexBlogPost(filePath: string): Promise<boolean> {
  try {
    console.log(`📄 Processing blog post: ${filePath}`);
    
    // Parse the MDX file
    const blogPost = parseMDXFile(filePath);
    if (!blogPost) {
      console.error(`❌ Failed to parse blog post: ${filePath}`);
      return false;
    }

    // Create chunks
    const chunks = createBlogChunks(blogPost);
    console.log(`📝 Created ${chunks.length} chunks for ${blogPost.slug}`);

    // Generate embeddings for all chunks
    const contents = chunks.map(chunk => chunk.content);
    const embeddingResult = await generateBatchEmbeddings(contents);
    
    // Add embeddings to chunks
    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddingResult.embeddings[index],
    }));

    // Store in database
    const stored = await storeBlogChunks(chunksWithEmbeddings);
    
    if (stored) {
      console.log(`✅ Successfully indexed ${blogPost.title}`);
      console.log(`💰 Used ${embeddingResult.totalTokens} tokens`);
      return true;
    } else {
      console.error(`❌ Failed to store chunks for ${blogPost.slug}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error indexing blog post ${filePath}:`, error);
    return false;
  }
}

/**
 * Index all blog posts
 */
export async function indexAllBlogPosts(): Promise<EmbeddingStats> {
  const blogFiles = getBlogFiles();
  console.log(`📚 Found ${blogFiles.length} blog posts to index`);

  let totalChunks = 0;
  let totalTokens = 0;
  let successCount = 0;

  const startTime = Date.now();

  for (const filePath of blogFiles) {
    try {
      // Parse blog post to count chunks
      const blogPost = parseMDXFile(filePath);
      if (blogPost) {
        const chunks = createBlogChunks(blogPost);
        totalChunks += chunks.length;
      }

      const success = await indexBlogPost(filePath);
      if (success) {
        successCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\n📊 Indexing Summary:`);
  console.log(`   ✅ Successfully indexed: ${successCount}/${blogFiles.length} blog posts`);
  console.log(`   📝 Total chunks created: ${totalChunks}`);
  console.log(`   ⏱️  Total time: ${duration.toFixed(2)}s`);
  console.log(`   💰 Estimated tokens: ~${totalTokens || 'calculating...'}`);

  // Approximate cost calculation (text-embedding-3-small: $0.00002 / 1K tokens)
  const estimatedCost = totalTokens ? (totalTokens * 0.00002 / 1000) : 0;

  return {
    totalChunks,
    totalTokens,
    totalCost: estimatedCost,
    lastUpdated: new Date(),
  };
}

/**
 * Re-index a specific blog post (useful for updates)
 */
export async function reindexBlogPost(slug: string): Promise<boolean> {
  try {
    // Find the blog file
    const blogFiles = getBlogFiles();
    const targetFile = blogFiles.find(file => file.includes(`/${slug}/`));
    
    if (!targetFile) {
      console.error(`❌ Blog post not found: ${slug}`);
      return false;
    }

    // Remove existing chunks first
    const { deleteBlogChunks } = await import('./vector-db');
    await deleteBlogChunks(slug);

    // Re-index
    return await indexBlogPost(targetFile);
  } catch (error) {
    console.error(`❌ Error re-indexing blog post ${slug}:`, error);
    return false;
  }
}