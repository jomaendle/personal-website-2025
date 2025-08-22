import OpenAI from 'openai';
import { getEnvVar } from '../env-validation';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: getEnvVar('OPENAI_API_KEY'),
});

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
}

/**
 * Generate embeddings for a single text using OpenAI's text-embedding-3-small model
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '), // Replace newlines with spaces for better embeddings
    });

    const [data] = response.data;
    return {
      embedding: data.embedding,
      tokens: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in a single API call (more efficient)
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<BatchEmbeddingResult> {
  try {
    const cleanTexts = texts.map(text => text.replace(/\n/g, ' '));
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleanTexts,
    });

    return {
      embeddings: response.data.map(item => item.embedding),
      totalTokens: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length');
  }

  const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

export { openai };