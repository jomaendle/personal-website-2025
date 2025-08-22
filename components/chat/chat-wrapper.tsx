'use client';

import React, { useState } from 'react';
import { AIChat } from './ai-chat';
import { ChatFloatingButton } from './chat-floating-button';

/**
 * Main chat wrapper component that manages the chat state
 * and provides the floating button + chat interface
 */
export const ChatWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <ChatFloatingButton
        isOpen={isOpen}
        onClick={toggleChat}
        showPulse={true}
      />
      
      {/* Chat interface */}
      <AIChat
        isOpen={isOpen}
        onClose={closeChat}
      />
    </>
  );
};

export default ChatWrapper;