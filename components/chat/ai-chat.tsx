"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, MessageSquare, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Chat header component
const ChatHeader: React.FC<{
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}> = ({ onClose, isMinimized, onToggleMinimize }) => (
  <div className="flex items-center justify-between border-b border-border bg-background p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
        <MessageSquare className="h-4 w-4 text-white" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">AI Assistant</h3>
        <p className="text-xs text-muted-foreground">Ask about my blog posts</p>
      </div>
    </div>

    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMinimize}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        {isMinimized ? (
          <Maximize2 className="h-4 w-4" />
        ) : (
          <Minimize2 className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <div className="flex flex-1 items-center justify-center p-8">
    <div className="max-w-sm text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
        <MessageSquare className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">
        Hi! I&apos;m your AI assistant
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        I can help you explore Johannes Mändle&apos;s blog posts. Ask me about
        React, CSS, animations, AI tools, web development, or any other topics
        covered in the blog.
      </p>
      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground">Try asking:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "How to create CSS animations?",
            "React component patterns",
            "AI development tools",
          ].map((suggestion, index) => (
            <span
              key={index}
              className="rounded bg-secondary/50 px-2 py-1 text-xs"
            >
              &quot;{suggestion}&quot;
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Main chat interface
export const AIChat: React.FC<AIChatProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestions = useChatSuggestions();

  // Use AI SDK's useChat hook with proper configuration
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
    }),
  });

  // Check if chat is loading/processing
  const isLoading = status === "streaming" || status === "submitted";

  // Convert AI SDK messages to our ChatMessage type
  const chatMessages: ChatMessageType[] = messages.map((msg, index) => {
    // Extract text content from parts array
    const textContent = msg.parts
      .filter((part) => part.type === "text")
      .map((part) => ("text" in part ? part.text : ""))
      .join("");

    return {
      id: msg.id || `msg-${index}`,
      role: msg.role as "user" | "assistant",
      content: textContent || "",
      timestamp: new Date(),
      sources: [], // TODO: Extract sources from response headers
    };
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length, isMinimized]);

  // Handle send message using AI SDK
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    sendMessage({ text: message.trim() });
  };

  // Chat animation variants
  const chatVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ai-chat"
        variants={chatVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "fixed bottom-4 right-4 z-50",
          "h-[600px] w-96",
          // Mobile responsive
          "max-sm:fixed max-sm:inset-4 max-sm:h-auto max-sm:w-auto",
          className,
        )}
      >
        <Card className="flex h-full flex-col border-border/50 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
          {/* Header */}
          <ChatHeader
            onClose={onClose}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(!isMinimized)}
          />

          {/* Main content */}
          <AnimatePresence mode="wait">
            {!isMinimized && (
              <motion.div
                key="chat-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <>
                      <EmptyState />
                      <ChatSuggestions
                        suggestions={suggestions.slice(0, 4)} // Show max 4 suggestions
                        onSuggestionClick={handleSendMessage}
                      />
                    </>
                  ) : (
                    <div className="space-y-1">
                      {chatMessages.map((message, index) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isLast={index === chatMessages.length - 1}
                        />
                      ))}
                      {isLoading && (
                        <div className="flex items-center gap-3 p-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"
                                style={{
                                  animationDelay: `${i * 0.2}s`,
                                  animationDuration: "1s",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Error display */}
                {error && (
                  <div className="border-t border-destructive/20 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                )}

                {/* Input area */}
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  disabled={!!error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChat;
