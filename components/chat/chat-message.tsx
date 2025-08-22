'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, ExternalLink } from 'lucide-react';
import { ChatMessage as ChatMessageType, BlogSource } from '@/lib/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
  className?: string;
}

interface MessageSourcesProps {
  sources: BlogSource[];
}

// Component to display blog post sources
const MessageSources: React.FC<MessageSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <p className="text-xs text-muted-foreground mb-2">Sources:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={`${source.slug}-${index}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary/80 rounded-md transition-colors"
          >
            <span>{source.title}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    </div>
  );
};

// Main chat message component
export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isLast = false, 
  className 
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Animation variants
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex gap-3 p-4",
        isLast && "mb-4",
        className
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
        isUser && "bg-primary text-primary-foreground",
        isAssistant && "bg-secondary text-secondary-foreground"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Role label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <time className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </time>
        </div>

        {/* Message text */}
        <div className={cn(
          "prose prose-sm max-w-none",
          "prose-p:leading-relaxed prose-p:my-2",
          "prose-pre:bg-secondary prose-pre:border prose-pre:border-border",
          "prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-strong:text-foreground prose-em:text-foreground",
          "prose-headings:text-foreground prose-headings:font-semibold",
          "prose-ul:my-2 prose-ol:my-2 prose-li:my-1",
          // Dark mode adjustments
          "dark:prose-invert",
          isUser && "text-foreground"
        )}>
          {/* Format message content with basic markdown support */}
          <div 
            dangerouslySetInnerHTML={{ 
              __html: formatMessageContent(message.content) 
            }} 
          />
        </div>

        {/* Sources (only for assistant messages) */}
        {isAssistant && message.sources && (
          <MessageSources sources={message.sources} />
        )}
      </div>
    </motion.div>
  );
};

// Helper function to format message content with basic markdown
function formatMessageContent(content: string): string {
  return content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks (basic)
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Links (basic)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export default ChatMessage;