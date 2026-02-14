"use client"

import { motion } from "framer-motion"

export default function HeroContent() {
  return (
    <main className="relative z-20 flex flex-col justify-end min-h-[calc(100vh-80px)] px-6 pb-10 md:px-10 md:pb-16">
      <div className="max-w-3xl">
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="text-foreground/40 text-[10px] md:text-xs tracking-[0.3em] uppercase font-light">
            ML Engineering / NLP / Research
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-light text-foreground mb-6 leading-[1.1]"
        >
          Perpetually
          <br />
          <span className="instrument italic text-primary">uphill</span>, stochastic
          <br />
          sisyphus
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-sm md:text-base font-light mb-8 leading-relaxed max-w-md"
        >
          <p className="text-foreground">Applied ML Engineer</p>
          <p className="text-[#8a8478]">That's all</p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-px bg-foreground/20" />
          <span className="text-foreground/30 text-[10px] tracking-[0.2em] uppercase font-light">
            Scroll to explore
          </span>
        </motion.div>
      </div>
    </main>
  )
}
