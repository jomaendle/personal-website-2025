import { generateEmbedding } from './embeddings';
import { performSemanticSearch } from './vector-db';
import { SearchResult, RAGContext, ChatMessage, BlogSource } from '../types/chat';

interface RAGOptions {
  maxResults: number;
  similarityThreshold: number;
  includeMetadata: boolean;
  diversityBoost: number; // Boost diversity in results (0-1)
}

const DEFAULT_RAG_OPTIONS: RAGOptions = {
  maxResults: 5,
  similarityThreshold: 0.3, // Lowered from 0.7 for testing
  includeMetadata: true,
  diversityBoost: 0, // Disabled for testing
};

/**
 * Enhanced query preprocessing to improve search results
 */
function preprocessQuery(query: string): string {
  // Remove common stop words that might reduce search quality
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'about', 'how', 'what', 'when', 'where', 'why',
    'tell', 'me', 'show', 'explain', 'can', 'you'
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => !stopWords.has(word) && word.length > 2)
    .join(' ')
    .trim() || query; // Fallback to original if empty
}

/**
 * Diversify search results to avoid too many results from the same blog post
 */
function diversifyResults(results: SearchResult[], diversityBoost: number): SearchResult[] {
  if (diversityBoost === 0 || results.length <= 2) {
    return results;
  }

  const diversified: SearchResult[] = [];
  const blogCounts: Map<string, number> = new Map();
  
  // Sort by similarity first
  const sortedResults = [...results].sort((a, b) => b.similarity - a.similarity);
  
  for (const result of sortedResults) {
    const blogSlug = result.chunk.blog_slug;
    const currentCount = blogCounts.get(blogSlug) || 0;
    
    // Calculate diversity penalty
    const diversityPenalty = currentCount * diversityBoost;
    const adjustedSimilarity = result.similarity - diversityPenalty;
    
    // Only include if adjusted similarity is still above threshold
    if (adjustedSimilarity > 0.5) {
      diversified.push({
        ...result,
        similarity: adjustedSimilarity,
      });
      blogCounts.set(blogSlug, currentCount + 1);
    }
  }
  
  // Sort by adjusted similarity and return
  return diversified
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, results.length);
}

/**
 * Perform enhanced semantic search with query preprocessing and result diversification
 */
export async function enhancedSemanticSearch(
  query: string,
  options: Partial<RAGOptions> = {}
): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_RAG_OPTIONS, ...options };
  
  try {
    console.log(`🔍 Searching for: "${query}"`);
    
    // Preprocess the query to improve search quality
    const processedQuery = preprocessQuery(query);
    console.log(`📝 Processed query: "${processedQuery}"`);
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(processedQuery);
    
    // Perform vector search
    const rawResults = await performSemanticSearch(
      queryEmbedding.embedding,
      Math.max(opts.maxResults * 2, 10), // Get more results initially for diversity
      opts.similarityThreshold
    );
    
    console.log(`📊 Found ${rawResults.length} initial results`);
    
    // Apply diversity boost if enabled
    const diversifiedResults = opts.diversityBoost > 0 
      ? diversifyResults(rawResults, opts.diversityBoost)
      : rawResults;
    
    // Limit to final result count
    const finalResults = diversifiedResults.slice(0, opts.maxResults);
    
    console.log(`✅ Returning ${finalResults.length} diverse results`);
    return finalResults;
    
  } catch (error) {
    console.error('❌ Error in enhanced semantic search:', error);
    return [];
  }
}

/**
 * Create blog sources from search results for citation
 */
export function createBlogSources(results: SearchResult[]): BlogSource[] {
  const sourceMap = new Map<string, BlogSource>();
  
  for (const result of results) {
    const { chunk, similarity } = result;
    const existing = sourceMap.get(chunk.blog_slug);
    
    if (!existing || similarity > (existing.similarity || 0)) {
      sourceMap.set(chunk.blog_slug, {
        title: chunk.metadata.title || chunk.blog_slug,
        slug: chunk.blog_slug,
        url: chunk.metadata.url || `/blog/${chunk.blog_slug}`,
        relevantSection: chunk.metadata.section,
        similarity: similarity,
      });
    }
  }
  
  return Array.from(sourceMap.values())
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
}

/**
 * Build context for RAG generation from search results and conversation history
 */
export function buildRAGContext(
  query: string,
  searchResults: SearchResult[],
  conversationHistory: ChatMessage[] = []
): RAGContext {
  return {
    query,
    retrievedChunks: searchResults,
    conversationHistory: conversationHistory.slice(-6), // Keep last 3 exchanges
  };
}

/**
 * Format retrieved content for LLM context
 */
export function formatRetrievedContent(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant content found in the blog posts.';
  }

  let formattedContent = 'Here is relevant content from Johannes Mändle\'s blog posts:\n\n';
  
  results.forEach((result, index) => {
    const { chunk, similarity } = result;
    const title = chunk.metadata.title || 'Untitled';
    const section = chunk.metadata.section ? ` - ${chunk.metadata.section}` : '';
    
    formattedContent += `--- Source ${index + 1}: "${title}"${section} (relevance: ${(similarity * 100).toFixed(1)}%) ---\n`;
    formattedContent += chunk.content.trim() + '\n\n';
  });

  return formattedContent.trim();
}

/**
 * Generate system prompt for RAG-enhanced chat
 */
export function generateSystemPrompt(context: RAGContext): string {
  const retrievedContent = formatRetrievedContent(context.retrievedChunks);
  
  return `You are an AI assistant helping users learn about web development, AI tools, and software engineering topics from Johannes Mändle's blog. 

Your role:
1. Answer questions using ONLY the provided blog content
2. Be helpful, accurate, and concise
3. Always cite your sources with the blog post titles
4. If the blog content doesn't contain relevant information, say so clearly
5. Maintain a friendly but professional tone consistent with the blog's style

Available blog content:
${retrievedContent}

Instructions:
- Base your answers solely on the provided content above
- When referencing information, mention which blog post it comes from
- If multiple sources are relevant, acknowledge all of them
- If the question cannot be answered from the blog content, suggest what topics are available
- Keep responses focused and practical
- Use markdown formatting for better readability

Remember: You're representing Johannes Mändle's expertise and should maintain the quality and accuracy of his technical content.`;
}

/**
 * Main RAG retrieval function that combines all functionality
 */
export async function performRAGRetrieval(
  query: string,
  conversationHistory: ChatMessage[] = [],
  options: Partial<RAGOptions> = {}
): Promise<RAGContext> {
  try {
    console.log(`🤖 Performing RAG retrieval for query: "${query}"`);
    
    // Enhanced semantic search
    const searchResults = await enhancedSemanticSearch(query, options);
    
    // Build and return context
    const context = buildRAGContext(query, searchResults, conversationHistory);
    
    console.log(`📚 Retrieved ${context.retrievedChunks.length} relevant chunks`);
    console.log(`💬 Including ${context.conversationHistory.length} previous messages`);
    
    return context;
  } catch (error) {
    console.error('❌ Error in RAG retrieval:', error);
    return {
      query,
      retrievedChunks: [],
      conversationHistory,
    };
  }
}

/**
 * Quick search function for testing and debugging
 */
export async function quickSearch(query: string, limit: number = 3): Promise<void> {
  console.log(`\n🔍 Quick Search: "${query}"`);
  console.log('=' .repeat(50));
  
  const results = await enhancedSemanticSearch(query, { maxResults: limit });
  
  if (results.length === 0) {
    console.log('❌ No results found');
    return;
  }
  
  results.forEach((result, index) => {
    const { chunk, similarity } = result;
    console.log(`\n📄 Result ${index + 1} (${(similarity * 100).toFixed(1)}% match):`);
    console.log(`   Blog: ${chunk.metadata.title || chunk.blog_slug}`);
    console.log(`   Section: ${chunk.metadata.section || 'N/A'}`);
    console.log(`   Preview: ${chunk.content.substring(0, 100)}...`);
  });
  
  console.log('\n' + '='.repeat(50));
}