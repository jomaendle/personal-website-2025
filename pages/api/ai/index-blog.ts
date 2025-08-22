import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/lib/rate-limit';
import { indexAllBlogPosts, indexBlogPost, reindexBlogPost } from '@/lib/ai/blog-indexer';
import { initializeDatabase } from '@/lib/ai/init-db';
import { getDatabaseStats } from '@/lib/ai/vector-db';

interface IndexResponse {
  success: boolean;
  message: string;
  stats?: any;
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IndexResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
  }

  const { action, slug } = req.body;

  try {
    switch (action) {
      case 'init-db':
        console.log('🔧 Initializing database...');
        const initialized = await initializeDatabase();
        if (initialized) {
          return res.status(200).json({
            success: true,
            message: 'Database initialized successfully'
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to initialize database'
          });
        }

      case 'index-all':
        console.log('📚 Indexing all blog posts...');
        const stats = await indexAllBlogPosts();
        return res.status(200).json({
          success: true,
          message: `Successfully indexed all blog posts`,
          stats: {
            totalChunks: stats.totalChunks,
            totalTokens: stats.totalTokens,
            totalCost: stats.totalCost,
            lastUpdated: stats.lastUpdated.toISOString()
          }
        });

      case 'index-single':
        if (!slug) {
          return res.status(400).json({
            success: false,
            message: 'Slug is required for single indexing'
          });
        }
        console.log(`📄 Indexing blog post: ${slug}`);
        const success = await reindexBlogPost(slug);
        if (success) {
          return res.status(200).json({
            success: true,
            message: `Successfully indexed blog post: ${slug}`
          });
        } else {
          return res.status(500).json({
            success: false,
            message: `Failed to index blog post: ${slug}`
          });
        }

      case 'stats':
        console.log('📊 Getting database stats...');
        const dbStats = await getDatabaseStats();
        if (dbStats) {
          return res.status(200).json({
            success: true,
            message: 'Database stats retrieved successfully',
            stats: dbStats
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to get database stats'
          });
        }

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: init-db, index-all, index-single, or stats'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withRateLimit(handler, {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many indexing requests, please try again later'
});