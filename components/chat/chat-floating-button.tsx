'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  showPulse?: boolean;
}

export const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({
  isOpen,
  onClick,
  className,
  showPulse = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Hide tooltip after user interaction
  const handleClick = () => {
    setShowTooltip(false);
    onClick();
  };

  // Button animation variants
  const buttonVariants = {
    initial: { 
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    animate: { 
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Pulse animation for the button
  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 0.3, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Tooltip animation
  const tooltipVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      x: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-40 flex items-center gap-3",
      className
    )}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 max-w-xs"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-medium">Ask me anything!</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              I can help you explore the blog content
            </p>
            
            {/* Tooltip arrow */}
            <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2">
              <div className="w-3 h-3 bg-background border-r border-b border-border transform rotate-[-45deg]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.div
        className="relative"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Pulse rings (only when not open and showPulse is true) */}
        {showPulse && !isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              variants={pulseVariants}
              animate="pulse"
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              variants={pulseVariants}
              animate="pulse"
              style={{ animationDelay: '1s' }}
            />
          </>
        )}

        {/* Button */}
        <Button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative h-14 w-14 rounded-full shadow-lg",
            "bg-gradient-to-r from-blue-500 to-purple-600",
            "hover:from-blue-600 hover:to-purple-700",
            "transition-all duration-300",
            "group"
          )}
        >
          {/* Button content */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <MessageSquare className="h-6 w-6 text-white" />
                
                {/* Sparkle effect on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 45 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="h-3 w-3 text-yellow-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
};

export default ChatFloatingButton;