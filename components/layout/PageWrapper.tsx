"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col">
      <Nav />
      <motion.main
        initial={reduced ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 pt-24"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
