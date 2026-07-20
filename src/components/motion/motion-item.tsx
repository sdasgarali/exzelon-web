"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

/**
 * A motion child intended to live inside <StaggerGroup>. It inherits the
 * parent's stagger orchestration via shared variant names ("hidden"/"show").
 */
export function MotionItem({
  children,
  className,
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
