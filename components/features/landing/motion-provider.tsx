"use client";

import * as React from "react";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

// Interaction-Spec.md §3.5: treat low-end devices (deviceMemory < 4 or a 2g
// connection) as reduced-motion even without the OS preference.
function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };
  return (
    (nav.deviceMemory !== undefined && nav.deviceMemory < 4) ||
    nav.connection?.effectiveType === "2g"
  );
}

// LazyMotion + `m` components (never `motion.*`) keeps framer-motion's
// landing footprint to the domAnimation feature set -- no layout/drag.
function MotionProvider({ children }: { children: React.ReactNode }) {
  const [lowEnd, setLowEnd] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only API post-mount
    setLowEnd(isLowEndDevice());
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={lowEnd ? "always" : "user"}>{children}</MotionConfig>
    </LazyMotion>
  );
}

export { MotionProvider };
