'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SmartGlassProps {
  children: React.ReactNode;
  className?: string;
  fallback?: 'light' | 'none';
}

const SmartGlass: React.FC<SmartGlassProps> = ({ 
  children, 
  className, 
  fallback = 'light' 
}) => {
  const [glassClass, setGlassClass] = useState('glass-bg');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Device capability detection
    const checkCapabilities = () => {
      const cores = navigator.hardwareConcurrency || 1;
      const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 1;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check if device seems low-end
      const isLowEnd = cores <= 2 || memory <= 2;
      
      // Check for backdrop-filter support
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') || 
                                    CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
      
      if (!supportsBackdropFilter || isLowEnd || prefersReducedMotion) {
        setGlassClass(fallback === 'light' ? 'glass-bg-light' : '');
      } else {
        setGlassClass('glass-bg');
      }
    };

    checkCapabilities();

    // Listen for reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkCapabilities);
    
    return () => mediaQuery.removeEventListener('change', checkCapabilities);
  }, [fallback]);

  // Server-side rendering fallback
  if (!isClient) {
    return (
      <div className={cn('glass-bg-light glass-container-spacing', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn(glassClass, 'glass-container-spacing', className)}>
      {children}
    </div>
  );
};

export { SmartGlass };