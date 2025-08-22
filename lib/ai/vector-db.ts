import { supabase } from '../supabaseClient';
import { BlogChunk, SearchResult } from '../types/chat';

/**
 * Initialize the vector database with required tables and functions
 */
export async function initializeVectorDatabase(): Promise<boolean> {
  try {
    // Enable vector extension
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
    });

    if (extensionError && !extensionError.message.includes('already exists')) {
      console.error('Error enabling vector extension:', extensionError);
      // Continue anyway as extension might already exist
    }

    // Create blog_chunks table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS blog_chunks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          blog_slug TEXT NOT NULL,
          chunk_index INTEGER NOT NULL,
          content TEXT NOT NULL,
          embedding vector(1536),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(blog_slug, chunk_index)
        );
      `
    });

    if (tableError) {
      console.error('Error creating blog_chunks table:', tableError);
      return false;
    }

    // Create index for vector similarity search
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS blog_chunks_embedding_idx 
        ON blog_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
      `
    });

    if (indexError && !indexError.message.includes('already exists')) {
      console.error('Error creating vector index:', indexError);
      // Continue anyway as this is not critical for basic functionality
    }

    // Create index for blog_slug lookups
    const { error: slugIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS blog_chunks_slug_idx 
        ON blog_chunks (blog_slug);
      `
    });

    if (slugIndexError && !slugIndexError.message.includes('already exists')) {
      console.error('Error creating slug index:', slugIndexError);
    }

    console.log('Vector database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing vector database:', error);
    return false;
  }
}

/**
 * Store blog chunks with embeddings in the database
 */
export async function storeBlogChunks(chunks: BlogChunk[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blog_chunks')
      .upsert(
        chunks.map(chunk => ({
          id: chunk.id,
          blog_slug: chunk.blog_slug,
          chunk_index: chunk.chunk_index,
          content: chunk.content,
          embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
          metadata: chunk.metadata,
        })),
        { onConflict: 'blog_slug,chunk_index' }
      );

    if (error) {
      console.error('Error storing blog chunks:', error);
      return false;
    }

    console.log(`Stored ${chunks.length} blog chunks successfully`);
    return true;
  } catch (error) {
    console.error('Error in storeBlogChunks:', error);
    return false;
  }
}

/**
 * Perform semantic search using vector similarity
 */
export async function performSemanticSearch(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.7
): Promise<SearchResult[]> {
  try {
    // Use RPC function for vector similarity search
    const { data, error } = await supabase.rpc('search_blog_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: similarityThreshold,
      match_count: limit
    });

    if (error) {
      console.error('Error performing semantic search:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      chunk: {
        id: item.id,
        blog_slug: item.blog_slug,
        chunk_index: item.chunk_index,
        content: item.content,
        metadata: item.metadata || {},
      },
      similarity: item.similarity,
    }));
  } catch (error) {
    console.error('Error in performSemanticSearch:', error);
    return [];
  }
}

/**
 * Get all chunks for a specific blog post
 */
export async function getBlogChunks(blogSlug: string): Promise<BlogChunk[]> {
  try {
    const { data, error } = await supabase
      .from('blog_chunks')
      .select('*')
      .eq('blog_slug', blogSlug)
      .order('chunk_index');

    if (error) {
      console.error('Error getting blog chunks:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      blog_slug: item.blog_slug,
      chunk_index: item.chunk_index,
      content: item.content,
      embedding: item.embedding ? JSON.parse(item.embedding) : undefined,
      metadata: item.metadata || {},
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('Error in getBlogChunks:', error);
    return [];
  }
}

/**
 * Delete all chunks for a specific blog post
 */
export async function deleteBlogChunks(blogSlug: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blog_chunks')
      .delete()
      .eq('blog_slug', blogSlug);

    if (error) {
      console.error('Error deleting blog chunks:', error);
      return false;
    }

    console.log(`Deleted chunks for blog: ${blogSlug}`);
    return true;
  } catch (error) {
    console.error('Error in deleteBlogChunks:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const { data, error } = await supabase
      .from('blog_chunks')
      .select('blog_slug', { count: 'exact' });

    if (error) {
      console.error('Error getting database stats:', error);
      return null;
    }

    const { count } = data as any;
    const uniqueBlogsQuery = await supabase
      .from('blog_chunks')
      .select('blog_slug')
      .limit(1000); // Reasonable limit for distinct count

    const uniqueBlogs = new Set(
      (uniqueBlogsQuery.data || []).map(item => item.blog_slug)
    ).size;

    return {
      totalChunks: count || 0,
      uniqueBlogs,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}