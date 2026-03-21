"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ToolSectionProps {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  children: ReactNode;
}

export function ToolSection({
  id,
  number,
  title,
  subtitle,
  description,
  children,
}: ToolSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-extrabold text-primary/20">{number}</span>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  );
}
