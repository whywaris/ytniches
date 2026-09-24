"use client";

import * as React from "react";

import { m, useReducedMotion } from "framer-motion";

// Scroll-into-view fade + rise, once per page load (Interaction-Spec §1.4).
// whileInView uses IntersectionObserver under the hood (§3.4).
//
// Items are explicit <StaggerItem>s (not auto-wrapped children) so each one
// can carry its own layout classes -- a grid cell's col-span has to live on
// the grid's direct child, which is the motion wrapper itself.
const ItemConfig = React.createContext({ duration: 0.3, rise: 8, as: "div" as "div" | "ul" });

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between items. */
  stagger: number;
  /** Seconds per item. */
  duration: number;
  /** Pixels each item rises. */
  rise: number;
  as?: "div" | "ul";
}

function Stagger({ children, className, stagger, duration, rise, as = "div" }: StaggerProps) {
  const reduce = useReducedMotion();
  const Container = as === "ul" ? m.ul : m.div;

  return (
    <ItemConfig.Provider value={{ duration, rise, as }}>
      <Container
        className={className}
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ shown: { transition: { staggerChildren: stagger } } }}
      >
        {children}
      </Container>
    </ItemConfig.Provider>
  );
}

function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const { duration, rise, as } = React.useContext(ItemConfig);
  const Item = as === "ul" ? m.li : m.div;
  return (
    <Item
      className={className}
      variants={{
        hidden: { opacity: 0, y: rise },
        shown: { opacity: 1, y: 0, transition: { duration, ease: "easeOut" } },
      }}
    >
      {children}
    </Item>
  );
}

export { Stagger, StaggerItem };
