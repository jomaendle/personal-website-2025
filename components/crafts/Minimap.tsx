"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

// Detect if device is mobile/touch-enabled
const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// Determine optimal marker count based on device
const getMarkerCount = () => {
  if (typeof window === "undefined") {
    return 41;
  }
  return isTouchDevice() ? 16 : 41; // Reduced count for mobile performance
};

const toneProfiles = {
  largest: {
    frequency: 392,
    attack: 0.1,
    sustain: 0.1,
    release: 0.6,
    volume: 0.1,
  },
  larger: {
    frequency: 329,
    attack: 0.05,
    sustain: 0.4,
    release: 0.76,
    volume: 0.14,
  },
  regular: {
    frequency: 261,
    attack: 0.05,
    sustain: 1,
    release: 0.9,
    volume: 0.1,
  },
} as const;

// Cached marker position data
interface MarkerPosition {
  element: HTMLElement;
  centerX: number;
  centerY: number;
  index: number;
}

export function Minimap() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [markerCount] = useState(getMarkerCount());
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Refs for DOM elements and cached data
  const containerRef = useRef<HTMLDivElement>(null);
  const markerWrapperRef = useRef<HTMLDivElement>(null);
  const currentMarkerRef = useRef<SVGSVGElement>(null);
  const currentMarkerLineRef = useRef<HTMLDivElement>(null);

  // Performance optimization refs
  const markerPositionsRef = useRef<MarkerPosition[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const isInteractingRef = useRef(false);

  // Audio refs
  const previousMarkerRef = useRef<Element | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentOscillatorRef = useRef<OscillatorNode | null>(null);
  const currentGainRef = useRef<GainNode | null>(null);
  const lastSoundTimeRef = useRef(0);

  // Marker components with optimized rendering
  const marker = <div className="marker h-6 w-[1px] bg-foreground/50"></div>;
  const largerMarker = (
    <div className="marker h-10 w-[1px] bg-foreground/80"></div>
  );
  const largestMarker = (
    <div className="marker h-20 w-[1px] bg-foreground"></div>
  );

  // Initialize and unlock AudioContext (required for iOS)
  const unlockAudio = useCallback(async () => {
    if (audioUnlocked || !soundEnabled) return;

    try {
      // Create AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Resume the context if suspended
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Play a silent sound to fully unlock audio on iOS
      // This is required because iOS Safari needs both context creation AND a sound
      // to be played during a user gesture
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.value = 0; // Silent
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.01);

      setAudioUnlocked(true);
    } catch (error) {
      console.error("Failed to unlock audio:", error);
    }
  }, [audioUnlocked, soundEnabled]);

  /*const playTickSound = useCallback(
    async (marker: Element) => {
      if (!soundEnabled) return;

      // Create AudioContext lazily if it doesn't exist
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        } catch (error) {
          console.error("Failed to create AudioContext:", error);
          return;
        }
      }

      const ctx = audioContextRef.current;

      // Ensure AudioContext is running
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (error) {
          console.error("Failed to resume AudioContext:", error);
          return;
        }
      }

      // Additional safety check - don't play if context isn't running
      if (ctx.state !== "running") {
        return;
      }

      const now = ctx.currentTime;

      // Throttle sounds - minimum 30ms between sounds
      if (now - lastSoundTimeRef.current < 0.03) {
        return;
      }

      lastSoundTimeRef.current = now;

      // Fade out previous sound
      if (currentGainRef.current && currentOscillatorRef.current) {
        try {
          const prevGain = currentGainRef.current;
          const prevOsc = currentOscillatorRef.current;

          prevGain.gain.cancelScheduledValues(now);
          prevGain.gain.setValueAtTime(prevGain.gain.value, now);
          prevGain.gain.linearRampToValueAtTime(0.001, now + 0.015);

          setTimeout(() => {
            try {
              prevOsc.stop();
            } catch {
              // Already stopped
            }
          }, 20);
        } catch {
          // Oscillator may have already stopped
        }
      }

      // Determine marker type and sound properties
      const markerHeight = marker.classList.contains("h-20")
        ? "largest"
        : marker.classList.contains("h-10")
          ? "larger"
          : "regular";

      let frequency, volume, duration;
      if (markerHeight === "largest") {
        frequency = 600;
        volume = 0.4;
        duration = 0.05;
      } else if (markerHeight === "larger") {
        frequency = 650;
        volume = 0.35;
        duration = 0.06;
      } else {
        frequency = 700;
        volume = 0.3;
        duration = 0.05;
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);

      currentOscillatorRef.current = oscillator;
      currentGainRef.current = gainNode;

      setTimeout(
        () => {
          if (currentOscillatorRef.current === oscillator) {
            currentOscillatorRef.current = null;
            currentGainRef.current = null;
          }
        },
        duration * 1000 + 10,
      );
    },
    [soundEnabled],
  );*/

  const playTickSound = useCallback(
    async (marker: Element) => {
      if (!soundEnabled) return;

      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        } catch (error) {
          console.error("Failed to create AudioContext:", error);
          return;
        }
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (error) {
          console.error("Failed to resume AudioContext:", error);
          return;
        }
      }
      if (ctx.state !== "running") return;

      const now = ctx.currentTime;
      if (now - lastSoundTimeRef.current < 0.03) return;
      lastSoundTimeRef.current = now;

      if (currentGainRef.current && currentOscillatorRef.current) {
        const prevGain = currentGainRef.current;
        const prevOsc = currentOscillatorRef.current;
        prevGain.gain.cancelScheduledValues(now);
        prevGain.gain.setValueAtTime(prevGain.gain.value, now);
        prevGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        setTimeout(() => {
          try {
            prevOsc.stop();
          } catch {
            /* noop */
          }
        }, 120);
      }

      const markerHeight = marker.classList.contains("h-20")
        ? "largest"
        : marker.classList.contains("h-10")
          ? "larger"
          : "regular";

      const profile = toneProfiles[markerHeight as keyof typeof toneProfiles];
      const oscillator = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.value = profile.frequency;
      /*oscillator.detune.value = (Math.random() - 0.5) * 20; // subtle warmth*/

      filter.type = "lowpass";
      filter.frequency.value = 6000;
      filter.Q.value = 1;

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(
        profile.volume,
        now + profile.attack,
      );
      gainNode.gain.setTargetAtTime(
        profile.volume,
        now + profile.attack,
        profile.sustain,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        now + profile.attack + profile.release,
      );

      oscillator.start(now);
      oscillator.stop(now + profile.attack + profile.release + 0.05);

      currentOscillatorRef.current = oscillator;
      currentGainRef.current = gainNode;

      setTimeout(
        () => {
          if (currentOscillatorRef.current === oscillator) {
            currentOscillatorRef.current = null;
            currentGainRef.current = null;
          }
        },
        (profile.attack + profile.release + 0.1) * 1000,
      );
    },
    [soundEnabled],
  );

  // Cache marker positions - called on mount and resize
  const cacheMarkerPositions = useCallback(() => {
    if (!markerWrapperRef.current) return;

    const markers =
      markerWrapperRef.current.querySelectorAll<HTMLElement>(".marker");

    markerPositionsRef.current = Array.from(markers).map((marker, index) => {
      const rect = marker.getBoundingClientRect();
      // Set transition property for smooth scale animations
      marker.style.transition = "transform 0.15s ease-out";
      marker.style.willChange = "transform";
      return {
        element: marker,
        // Store positions relative to viewport for now, will adjust during interaction
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        index,
      };
    });
  }, []);

  // Optimized interaction handler using RAF
  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      // Throttle to 60fps (16ms)
      const now = performance.now();
      if (now - lastUpdateTimeRef.current < 16) {
        return;
      }
      lastUpdateTimeRef.current = now;

      // Cancel any pending RAF
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Schedule update in next animation frame
      rafIdRef.current = requestAnimationFrame(() => {
        if (!markerWrapperRef.current || !currentMarkerRef.current) {
          return;
        }

        const markerWrapper = markerWrapperRef.current;
        const areaRect = markerWrapper.getBoundingClientRect();

        // Early exit if outside interaction area
        if (
          clientX < areaRect.left ||
          clientX > areaRect.right ||
          clientY < areaRect.top ||
          clientY > areaRect.bottom
        ) {
          return;
        }

        const maxDistance = 100;
        let nearestMarker:
          | (MarkerPosition & { centerX: number; centerY: number })
          | null = null;
        let minDistanceSquared = Infinity; // Use squared distance to avoid sqrt

        // Re-calculate positions on each interaction (handles scroll/resize)
        const markers = markerPositionsRef.current;

        markers.forEach((markerPos) => {
          const rect = markerPos.element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Calculate squared distance (faster than Math.sqrt)
          const dx = clientX - centerX;
          const dy = clientY - centerY;
          const distanceSquared = dx * dx + dy * dy;

          // Track nearest marker
          if (distanceSquared < minDistanceSquared) {
            minDistanceSquared = distanceSquared;
            nearestMarker = { ...markerPos, centerX, centerY };
          }

          // Apply scale effect based on distance (use actual distance here)
          const distance = Math.sqrt(distanceSquared);
          if (distance < maxDistance) {
            const scale = 2.5 - distance / maxDistance;
            // Use transform for GPU acceleration
            markerPos.element.style.transform = `scaleY(${scale})`;
          } else {
            markerPos.element.style.transform = "scaleY(1)";
          }
        });

        // Update pointer position
        if (nearestMarker !== null && currentMarkerRef.current) {
          const containerRect = markerWrapper.getBoundingClientRect();
          const containerCenterX = containerRect.width / 2;
          const nearest: MarkerPosition & { centerX: number; centerY: number } =
            nearestMarker;
          let snapX = nearest.centerX - containerRect.left;

          // Constrain to first and last marker
          if (markers.length > 0) {
            const firstMarker = markers[0];
            const lastMarker = markers[markers.length - 1];
            if (firstMarker && lastMarker) {
              const firstRect = firstMarker.element.getBoundingClientRect();
              const lastRect = lastMarker.element.getBoundingClientRect();

              const firstX =
                firstRect.left + firstRect.width / 2 - containerRect.left;
              const lastX =
                lastRect.left + lastRect.width / 2 - containerRect.left;

              snapX = Math.max(firstX, Math.min(lastX, snapX));
            }
          }

          // Play sound if marker changed
          if (previousMarkerRef.current !== nearest.element) {
            void playTickSound(nearest.element);
            previousMarkerRef.current = nearest.element;
          }

          // Use transform for better performance
          // Transform is relative to element's current position, so adjust from container center
          const currentMarker = currentMarkerRef.current;
          const translateX =
            snapX - containerCenterX + 9 - currentMarker.clientWidth / 2;
          currentMarker.style.transition = "transform 0.2s ease-out";
          // Include rotation in transform to maintain the rotate-180 class effect
          currentMarker.style.transform = `translate(${translateX}px, -60px) rotate(180deg)`;

          // Update line position (also relative to container center)
          if (currentMarkerLineRef.current) {
            const line = currentMarkerLineRef.current;
            const lineTranslateX = snapX - containerCenterX;
            line.style.transition = "transform 0.2s ease-out";
            line.style.transform = `translateX(${lineTranslateX}px)`;
          }
        }
      });
    },
    [playTickSound],
  );

  // Unified pointer event handler for mouse and touch
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      isInteractingRef.current = true;
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction],
  );

  const handlePointerLeave = useCallback(() => {
    isInteractingRef.current = false;

    // Reset marker scales
    markerPositionsRef.current.forEach((markerPos) => {
      markerPos.element.style.transform = "scaleY(1)";
    });

    // Cancel any pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Cache marker positions on mount
    cacheMarkerPositions();

    // Recalculate positions on resize (debounced)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(cacheMarkerPositions, 150);
    };

    window.addEventListener("resize", handleResize);

    // Attach pointer events to the marker wrapper (not document!)
    const markerWrapper = markerWrapperRef.current;
    if (markerWrapper) {
      // Use pointer events for unified mouse/touch handling
      markerWrapper.addEventListener(
        "pointermove",
        handlePointerMove as EventListener,
        {
          passive: false, // Allow preventDefault for touch
        },
      );
      markerWrapper.addEventListener("pointerleave", handlePointerLeave);

      // Additional touch-specific handling for better mobile UX
      if (isTouchDevice()) {
        markerWrapper.addEventListener(
          "touchstart",
          (e) => {
            const touch = e.touches[0];
            if (touch) {
              handleInteraction(touch.clientX, touch.clientY);
              // Unlock audio on first touch (iOS requirement)
              if (soundEnabled && !audioUnlocked) {
                void unlockAudio();
              }
            }
          },
          { passive: false },
        );
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);

      if (markerWrapper) {
        markerWrapper.removeEventListener(
          "pointermove",
          handlePointerMove as EventListener,
        );
        markerWrapper.removeEventListener("pointerleave", handlePointerLeave);
      }

      // Cancel any pending RAF
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    cacheMarkerPositions,
    handleInteraction,
    handlePointerMove,
    handlePointerLeave,
    soundEnabled,
    audioUnlocked,
    unlockAudio,
  ]);

  return (
    <main
      ref={containerRef}
      className="flex size-full flex-col items-center justify-center"
    >
      {/* Sound Toggle Button */}
      <Button
        onClick={() => {
          const newSoundState = !soundEnabled;
          setSoundEnabled(newSoundState);
          // Unlock audio on iOS when enabling sound
          if (newSoundState) {
            void unlockAudio();
          }
        }}
        className={`absolute right-4 top-4 z-10 rounded-lg p-3 transition-all duration-200`}
        variant={soundEnabled ? "outline" : "outline"}
        aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
        title={soundEnabled ? "Sound On" : "Sound Off"}
      >
        {soundEnabled ? (
          <Volume2 className="size-6 stroke-current" />
        ) : (
          <VolumeX className="size-6 stroke-current" />
        )}
      </Button>

      <div className="relative flex w-full items-center justify-center">
        <svg
          ref={currentMarkerRef}
          width="18"
          height="18"
          viewBox="0 0 100 100"
          className="absolute top-10 z-10"
          style={{
            // Use transform for positioning instead of left/top
            // Rotation is included in transform to prevent override
            transform: "translate(0, -60px) rotate(180deg)",
            willChange: isInteractingRef.current ? "transform" : "auto",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            className="fill-orange-500 stroke-orange-600"
            points="50,20 80,80 20,80"
            strokeWidth="5"
          />
        </svg>
        <div
          ref={currentMarkerLineRef}
          className="absolute z-0 w-[1px]"
          style={{
            top: "-12px",
            bottom: "-50vh",
            transform: "translateX(0)",
            willChange: isInteractingRef.current ? "transform" : "auto",
            backgroundImage:
              "repeating-linear-gradient(to bottom, #f97316 0, #f97316 4px, transparent 4px, transparent 8px)",
          }}
        ></div>
      </div>

      <div
        ref={markerWrapperRef}
        className="marker-wrapper flex items-center gap-0 p-8"
        style={{
          // Improve touch target size on mobile
          touchAction: "none", // Prevent default touch behaviors
          cursor: "pointer",
        }}
      >
        {Array.from({ length: markerCount }).map((_, index) => (
          <div
            key={index}
            className={`z-0 ${isTouchDevice() ? "px-2" : "px-1.5"}`} // Larger spacing on mobile
            style={{
              // Add larger touch targets for mobile
              minWidth: isTouchDevice() ? "20px" : "auto",
              minHeight: isTouchDevice() ? "44px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {index % 20 === 0
              ? largestMarker
              : index % 5 === 0
                ? largerMarker
                : marker}
          </div>
        ))}
      </div>
    </main>
  );
}
