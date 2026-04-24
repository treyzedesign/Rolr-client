"use client";

import { useEffect, useState } from "react";

interface AudioEqualizerProps {
  isPlaying: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatic?: boolean; // New prop to show static bars when not playing
}

export function AudioEqualizer({ isPlaying, size = "md", className = "", showStatic = false }: AudioEqualizerProps) {
  const [bars, setBars] = useState<number[]>([4, 4, 4, 4, 4]);

  useEffect(() => {
    if (!isPlaying) {
      if (showStatic) {
        // Show static bars when not playing but showStatic is true
        setBars([8, 12, 16, 12, 8]);
      } else {
        setBars([4, 4, 4, 4, 4]);
      }
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array.from({ length: 5 }, () => Math.random() * 20 + 4) // Random height between 4-24px
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, showStatic]);

  const heightClasses = {
    sm: "h-4",
    md: "h-6", 
    lg: "h-8"
  };

  const widthClasses = {
    sm: "w-1",
    md: "w-1.5",
    lg: "w-2"
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={`${widthClasses[size]} bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all duration-150 ease-out`}
          style={{
            height: `${height}px`,
            opacity: (isPlaying || showStatic) ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
