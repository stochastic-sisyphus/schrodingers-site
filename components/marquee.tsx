"use client"

import { motion } from "framer-motion"

const words = [
  "Transformers",
  "Embeddings",
  "Retrieval",
  "Stochastic",
  "Semantic",
  "Pipelines",
  "Uncertainty",
  "Emergence",
  "Inference",
  "Sisyphus",
]

export default function Marquee() {
  return (
    <div className="relative z-10 bg-background overflow-hidden py-12 md:py-16 border-t border-b border-foreground/5">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: [0, -1920] }}
        transition={{
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {[...words, ...words, ...words, ...words].map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground/[0.06] tracking-tight instrument italic"
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
