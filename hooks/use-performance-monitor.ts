'use client';

import { useEffect, useRef, useState } from 'react';
import { onLCP, onCLS, onTTFB, onFCP, onINP } from 'web-vitals';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  inp?: number;
}

interface WebGLPerformance {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [webglPerf, setWebglPerf] = useState<WebGLPerformance>({ fps: 0, frameTime: 0 });
  const observerRef = useRef<PerformanceObserver | null>(null);
  const fpsRef = useRef<{ frames: number; lastTime: number }>({ frames: 0, lastTime: 0 });

  // Monitor Core Web Vitals using web-vitals library
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set up web-vitals monitoring
    onLCP((metric) => {
      setMetrics(prev => ({ ...prev, lcp: metric.value }));
    });

    onCLS((metric) => {
      setMetrics(prev => ({ ...prev, cls: metric.value }));
    });

    onTTFB((metric) => {
      setMetrics(prev => ({ ...prev, ttfb: metric.value }));
    });

    onFCP((metric) => {
      setMetrics(prev => ({ ...prev, fcp: metric.value }));
    });

    onINP((metric) => {
      setMetrics(prev => ({ ...prev, inp: metric.value }));
    });

  }, []);

  // Monitor WebGL/Canvas FPS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animationId: number;
    
    const measureFPS = () => {
      const now = performance.now();
      
      if (fpsRef.current.lastTime) {
        fpsRef.current.frames++;
        
        if (now - fpsRef.current.lastTime >= 1000) {
          const fps = Math.round((fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime));
          const frameTime = (now - fpsRef.current.lastTime) / fpsRef.current.frames;
          
          setWebglPerf(prev => ({
            ...prev,
            fps,
            frameTime,
            memoryUsage: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
          }));
          
          fpsRef.current = { frames: 0, lastTime: now };
        }
      } else {
        fpsRef.current.lastTime = now;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Only start FPS monitoring if we detect WebGL usage
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length > 0) {
      measureFPS();
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Get performance grade
  const getPerformanceGrade = (): 'good' | 'needs-improvement' | 'poor' => {
    const { lcp = 0, cls = 0, inp = 0 } = metrics;
    
    const lcpGood = lcp <= 2500;
    const clsGood = cls <= 0.1;
    const inpGood = inp <= 200;
    
    const goodCount = [lcpGood, clsGood, inpGood].filter(Boolean).length;
    
    if (goodCount >= 2) return 'good';
    if (goodCount >= 1) return 'needs-improvement';
    return 'poor';
  };

  // Check if shaders are impacting performance
  const getShadersImpact = (): 'low' | 'medium' | 'high' => {
    const { fps, frameTime } = webglPerf;
    
    if (fps >= 50 && frameTime <= 20) return 'low';
    if (fps >= 30 && frameTime <= 33) return 'medium';
    return 'high';
  };

  return {
    metrics,
    webglPerf,
    grade: getPerformanceGrade(),
    shadersImpact: getShadersImpact(),
    // Helper to log metrics for debugging
    logMetrics: () => {
      console.table({
        'LCP (ms)': metrics.lcp?.toFixed(0),
        'FID (ms)': metrics.fid?.toFixed(0), 
        'CLS': metrics.cls?.toFixed(3),
        'INP (ms)': metrics.inp?.toFixed(0),
        'TTFB (ms)': metrics.ttfb?.toFixed(0),
        'FCP (ms)': metrics.fcp?.toFixed(0),
        'FPS': webglPerf.fps,
        'Frame Time (ms)': webglPerf.frameTime?.toFixed(1),
        'Grade': getPerformanceGrade(),
        'Shader Impact': getShadersImpact()
      });
    }
  };
};