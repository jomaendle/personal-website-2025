import OpenAI from "openai";
import { getEnvVar } from "../env-validation";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: getEnvVar("OPENAI_API_KEY"),
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
export async function generateEmbedding(
  text: string,
): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " "), // Replace newlines with spaces for better embeddings
    });

    const [data] = response.data;

    if (!data || !data.embedding) {
      throw new Error("No embedding data returned from OpenAI");
    }

    return {
      embedding: data.embedding,
      tokens: response.usage.total_tokens,
    };
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Generate embeddings for multiple texts in a single API call (more efficient)
 */
export async function generateBatchEmbeddings(
  texts: string[],
): Promise<BatchEmbeddingResult> {
  try {
    const cleanTexts = texts.map((text) => text.replace(/\n/g, " "));

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanTexts,
    });

    return {
      embeddings: response.data.map((item) => item.embedding),
      totalTokens: response.usage.total_tokens,
    };
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    throw new Error("Failed to generate batch embeddings");
  }
}

export { openai };
