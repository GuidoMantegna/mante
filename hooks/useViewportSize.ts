"use client";

import { useState, useEffect } from "react";

interface ViewportSize {
  width: number;
  height: number;
}

export function useViewportSize() {
  // 1. Initialize state with 0 to prevent hydration mismatches during SSR
  const [windowSize, setWindowSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 2. Handler to calculate and update window size
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // 3. Set size immediately on mount (runs only in the browser)
    handleResize();

    // 4. Attach event listener for subsequent resizes
    window.addEventListener("resize", handleResize);

    // 5. Clean up event listener when component unmounts
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}