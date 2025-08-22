export interface BlogChunk {
  id: string;
  blog_slug: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  metadata: {
    title?: string;
    section?: string;
    tags?: string[];
    url?: string;
    date?: string;
    author?: string;
  };
  created_at?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description?: string;
  keywords?: string;
  category?: string;
  readTime?: string;
  author?: string;
  content: string;
}

export interface SearchResult {
  chunk: BlogChunk;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: BlogSource[];
  timestamp: Date;
}

export interface BlogSource {
  title: string;
  slug: string;
  url: string;
  relevantSection?: string;
  similarity?: number;
}

export interface RAGContext {
  query: string;
  retrievedChunks: SearchResult[];
  conversationHistory: ChatMessage[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
}

export interface EmbeddingStats {
  totalChunks: number;
  totalTokens: number;
  totalCost: number; // Approximate cost in USD
  lastUpdated: Date;
}