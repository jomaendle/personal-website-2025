-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create blog_chunks table
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

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS blog_chunks_embedding_idx 
ON blog_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS blog_chunks_slug_idx 
ON blog_chunks (blog_slug);

CREATE INDEX IF NOT EXISTS blog_chunks_created_at_idx 
ON blog_chunks (created_at DESC);

-- Function to search blog chunks using vector similarity
CREATE OR REPLACE FUNCTION search_blog_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  blog_slug TEXT,
  chunk_index INTEGER,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    blog_chunks.id,
    blog_chunks.blog_slug,
    blog_chunks.chunk_index,
    blog_chunks.content,
    blog_chunks.metadata,
    1 - (blog_chunks.embedding <=> query_embedding) AS similarity
  FROM blog_chunks
  WHERE blog_chunks.embedding IS NOT NULL
    AND 1 - (blog_chunks.embedding <=> query_embedding) >= match_threshold
  ORDER BY blog_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get embedding statistics
CREATE OR REPLACE FUNCTION get_embedding_stats()
RETURNS TABLE (
  total_chunks BIGINT,
  unique_blogs BIGINT,
  avg_chunk_length FLOAT,
  latest_update TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_chunks,
    COUNT(DISTINCT blog_slug) AS unique_blogs,
    AVG(LENGTH(content)) AS avg_chunk_length,
    MAX(created_at) AS latest_update
  FROM blog_chunks;
END;
$$;

-- Function to execute arbitrary SQL (for migrations and setup)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'Success';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant necessary permissions (adjust as needed)
-- These would typically be run by a database admin
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON blog_chunks TO authenticated;
-- GRANT EXECUTE ON FUNCTION search_blog_chunks TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_embedding_stats TO authenticated;