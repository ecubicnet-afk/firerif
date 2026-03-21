"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolInfo } from "@/lib/guide-data";

const stepNumbers = ["①", "②", "③", "④", "⑤"];

export function ToolDescription({ tool, index = 0 }: { tool: ToolInfo; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
        {tool.isNew && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            NEW
          </Badge>
        )}
        <CardContent className="p-6 flex flex-col h-full gap-5">
          {/* Header: Icon + Title + Tagline */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                tool.bgColor
              )}
            >
              <tool.icon className={cn("h-6 w-6", tool.color)} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg leading-tight">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tool.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tool.description}
          </p>

          {/* Steps */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              使い方
            </p>
            <ol className="space-y-2">
              {tool.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={cn("font-bold flex-shrink-0", tool.color)}>
                    {stepNumbers[i] || `${i + 1}.`}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Benefits */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              期待できる効果
            </p>
            <ul className="space-y-1.5">
              {tool.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-2">
            <Button asChild className="w-full">
              <Link href={tool.href}>
                使ってみる
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
