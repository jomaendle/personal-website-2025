import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { performRAGRetrieval, generateSystemPrompt } from '@/lib/ai/rag-retrieval';
import { ChatMessage } from '@/lib/types/chat';

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    console.log("🤖 Received chat messages:", messages);

    // Get the latest user message for RAG retrieval
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user") {
      return new Response("Latest message must be from user", { status: 400 });
    }

    // Extract query text from UIMessage parts
    const query = latestMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => ("text" in part ? part.text : ""))
      .join("")
      .trim();

    console.log(`🤖 Chat request: "${query}"`);

    // Convert UI messages to ChatMessage format for RAG
    const chatMessages: ChatMessage[] = messages.map((msg, index) => ({
      id: msg.id || `msg-${index}`,
      role: msg.role,
      content: msg.parts
        .filter((part) => part.type === "text")
        .map((part) => ("text" in part ? part.text : ""))
        .join(""),
      timestamp: new Date(),
      sources: []
    }));

    // Perform RAG retrieval to get relevant blog content
    console.log('🔍 Performing RAG retrieval...');
    const ragContext = await performRAGRetrieval(query, chatMessages);
    
    // Generate system prompt with retrieved context
    const systemPrompt = generateSystemPrompt(ragContext);
    
    const uniqueBlogs = new Set(ragContext.retrievedChunks.map(r => r.chunk.blog_slug)).size;
    console.log(`📚 Found ${ragContext.retrievedChunks.length} relevant chunks from ${uniqueBlogs} blogs`);

    // Use streamText with AI SDK v5 proper format
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("❌ Chat API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return new Response("Rate limit exceeded. Please try again later.", {
          status: 429,
        });
      }

      if (error.message.includes("API key")) {
        return new Response("AI service configuration error", {
          status: 500,
        });
      }
    }

    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
