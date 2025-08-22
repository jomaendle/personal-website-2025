"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";

interface OptimizedBackgroundProps {
  className?: string;
  reducedMotion?: boolean;
}

// Performance detection utilities
const getDeviceCapabilities = () => {
  if (typeof window === "undefined")
    return {
      canHandle3D: false,
      isLowEnd: true,
      prefersReducedMotion: false,
      cores: 1,
      memory: 1,
    };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Detect low-end devices based on hardware concurrency and memory
  const cores = navigator.hardwareConcurrency || 1;
  const memory =
    (navigator as unknown as { deviceMemory?: number }).deviceMemory || 1;
  const isLowEnd = cores <= 2 || memory <= 2;

  // Check WebGL support
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  const canHandle3D = !!gl && !isLowEnd;

  // Cleanup
  canvas.remove();

  return {
    canHandle3D,
    isLowEnd,
    prefersReducedMotion,
    cores,
    memory,
  };
};

// Battery API detection (experimental)
const getBatteryStatus = async () => {
  if ("getBattery" in navigator) {
    try {
      const battery = await (
        navigator as unknown as {
          getBattery: () => Promise<{ level: number; charging: boolean }>;
        }
      ).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
      };
    } catch {
      return null;
    }
  }
  return null;
};

const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  className,
  reducedMotion = false,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [deviceCaps, setDeviceCaps] = useState<ReturnType<
    typeof getDeviceCapabilities
  > | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<{
    level: number;
    charging: boolean;
  } | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { webglPerf, shadersImpact } = usePerformanceMonitor();

  // Memoize shader configuration based on device capabilities
  const shaderConfig = useMemo(() => {
    if (!deviceCaps) {
      return null;
    }

    const baseSpeed =
      deviceCaps.prefersReducedMotion || reducedMotion ? 0 : 0.03;
    const batteryAdjustment =
      batteryInfo && !batteryInfo.charging && batteryInfo.level < 0.3 ? 0.5 : 1;
    const performanceAdjustment = deviceCaps.isLowEnd ? 0.5 : 1;

    // Dynamic performance adjustment based on actual FPS
    const fpsAdjustment = (() => {
      if (webglPerf.fps === 0) return 1; // Initial load, no data yet
      if (webglPerf.fps >= 50) return 1.2; // Good performance, can increase
      if (webglPerf.fps >= 30) return 1; // Acceptable performance
      if (webglPerf.fps >= 20) return 0.7; // Struggling, reduce
      return 0.3; // Very poor performance, minimal animation
    })();

    // Shader impact adjustment
    const impactAdjustment =
      shadersImpact === "high" ? 0.5 : shadersImpact === "medium" ? 0.8 : 1;

    const finalSpeed =
      baseSpeed *
      batteryAdjustment *
      performanceAdjustment *
      fpsAdjustment *
      impactAdjustment;

    return {
      // Optimized single gradient that combines both original gradients
      colors: [
        "#000000", // black anchor
        "#1a1a1a", // dark gray
        "#2a1f3d", // blended muted violet
        "#2a3f5a", // blended muted blue
        "#4a4a4a", // medium gray
      ],
      speed: finalSpeed,
      // Reduce complexity on low-end devices
      segments: deviceCaps.isLowEnd ? 32 : 64,
    };
  }, [deviceCaps, batteryInfo, reducedMotion, webglPerf.fps, shadersImpact]);

  // Initialize device capabilities detection
  useEffect(() => {
    const caps = getDeviceCapabilities();
    setDeviceCaps(caps);

    // Get battery info if available
    getBatteryStatus().then(setBatteryInfo);

    // Set initial render decision
    setShouldRender(caps.canHandle3D && !caps.prefersReducedMotion);
  }, []);

  // Intersection Observer for performance
  useEffect(() => {
    if (!containerRef.current || !deviceCaps?.canHandle3D) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [deviceCaps]);

  // Handle reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setDeviceCaps((prev) =>
        prev ? { ...prev, prefersReducedMotion: e.matches } : null,
      );
      setShouldRender(!e.matches && deviceCaps?.canHandle3D === true);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [deviceCaps]);

  // Cleanup function for memory management
  const handleUnmount = useCallback(() => {
    observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    return handleUnmount;
  }, [handleUnmount]);

  // Static fallback gradient
  const StaticFallback = () => (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-slate-800",
        "opacity-60 transition-opacity duration-1000",
        className,
      )}
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(87, 63, 105, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(61, 89, 120, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(26, 26, 26, 0.8) 0%, transparent 50%),
          linear-gradient(135deg, #000000 0%, #1a1a1a 100%)
        `,
      }}
    />
  );

  // Don't render anything on server
  if (typeof window === "undefined") {
    return <StaticFallback />;
  }

  // Render static fallback for unsupported devices or user preferences
  if (!shouldRender || !deviceCaps?.canHandle3D || !shaderConfig) {
    return <StaticFallback />;
  }

  return (
    <div ref={containerRef} className={cn("absolute inset-0", className)}>
      {/* Progressive enhancement: start with static, upgrade to shader */}
      <StaticFallback />

      {/* Only render shader when visible and device can handle it */}
      {isVisible && shouldRender && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out motion-opacity-in"
          style={{
            opacity: isVisible ? 1 : 0,
            willChange: "opacity",
          }}
        >
          <MeshGradient
            colors={shaderConfig.colors}
            speed={shaderConfig.speed}
            className="h-full w-full"
            style={{
              contain: "layout style paint",
              transform: "translateZ(0)", // Force hardware acceleration
            }}
          />
        </div>
      )}
    </div>
  );
};

export { OptimizedBackground };
