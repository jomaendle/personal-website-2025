import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/lib/rate-limit';
import { enhancedSemanticSearch, performRAGRetrieval } from '@/lib/ai/rag-retrieval';
import { SearchResult, RAGContext } from '@/lib/types/chat';

interface SearchResponse {
  success: boolean;
  query: string;
  results?: SearchResult[];
  context?: RAGContext;
  message?: string;
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      query: '',
      message: `Method ${req.method} not allowed`
    });
  }

  const { 
    query, 
    maxResults = 5, 
    similarityThreshold = 0.7,
    includeContext = false
  } = req.body;

  // Validate query
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      query: query || '',
      message: 'Query must be a string with at least 2 characters'
    });
  }

  try {
    console.log(`🔍 Searching for: "${query}"`);

    if (includeContext) {
      // Perform full RAG retrieval
      const context = await performRAGRetrieval(query.trim(), [], {
        maxResults,
        similarityThreshold,
        includeMetadata: true,
        diversityBoost: 0.3
      });

      return res.status(200).json({
        success: true,
        query: query.trim(),
        context,
        message: `Found ${context.retrievedChunks.length} relevant results`
      });
    } else {
      // Perform simple semantic search
      const results = await enhancedSemanticSearch(query.trim(), {
        maxResults,
        similarityThreshold,
        includeMetadata: true,
        diversityBoost: 0.3
      });

      return res.status(200).json({
        success: true,
        query: query.trim(),
        results,
        message: `Found ${results.length} relevant results`
      });
    }
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({
      success: false,
      query: query || '',
      message: 'Search failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withRateLimit(handler, {
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many search requests, please try again later'
});