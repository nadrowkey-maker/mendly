"use client";

import { useEffect, useState } from "react";
import { TubesCursor } from "@/components/tube-cursor";

export function TubeCursor() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setVisible(!isTouch && !reduced);
  }, []);

  if (!visible) return null;

  return (
    <div
  className="fixed inset-0 pointer-events-none z-[9999] mix-blend-screen"
  aria-hidden="true"
>
  <TubesCursor
    title=""
    subtitle=""
    caption=""
    initialColors={["#8B5CF6", "#06B6D4", "#F0ABFC"]}
    lightColors={["#A78BFA", "#06B6D4", "#8B5CF6", "#F0ABFC"]}
    lightIntensity={150}
    enableRandomizeOnClick={false}
  />
</div> )}
