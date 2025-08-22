'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'Ask me anything about my blog posts...',
  className,
  maxLength = 1000
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (min 40px, max 120px)
    const minHeight = 40;
    const maxHeight = 120;
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    
    textarea.style.height = `${newHeight}px`;
  };

  // Adjust height when input changes
  useEffect(() => {
    adjustHeight();
  }, [input]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Respect max length
    if (value.length <= maxLength) {
      setInput(value);
    }
  };

  // Handle send message
  const handleSend = () => {
    const trimmedInput = input.trim();
    
    if (trimmedInput && !isLoading && !disabled) {
      onSendMessage(trimmedInput);
      setInput('');
      
      // Reset textarea height
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '40px';
        }
      }, 0);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className={cn(
      "flex items-end gap-2 p-4 bg-background border-t border-border",
      className
    )}>
      {/* Input container */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            "w-full resize-none rounded-lg border border-input bg-background px-3 py-2",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors"
          )}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            height: '40px'
          }}
        />
        
        {/* Character count (show when approaching limit) */}
        {input.length > maxLength * 0.8 && (
          <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
            {input.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={!canSend}
        size="icon"
        className={cn(
          "h-10 w-10 flex-shrink-0 rounded-lg",
          "transition-all duration-200",
          canSend && "bg-primary hover:bg-primary/90"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default ChatInput;