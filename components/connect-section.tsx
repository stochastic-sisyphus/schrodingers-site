"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const links = [
  { label: "GitHub", href: "https://github.com/stochastic-sisyphus", icon: "code" },
  { label: "HuggingFace", href: "https://huggingface.co/stochastic-sisyphus", icon: "model" },
  { label: "LinkedIn", href: "https://linkedin.com/in/vanessabeck", icon: "connect" },
  { label: "ORCID", href: "https://orcid.org/0009-0008-6611-535X", icon: "research" },
  { label: "Substack", href: "https://stochasticsisyphus.substack.com", icon: "write" },
]

function LinkCard({ link, index }: { link: (typeof links)[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.a
      ref={ref}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex items-center justify-between px-5 py-4 rounded-lg border border-foreground/5 bg-card/30 hover:border-foreground/15 hover:bg-card/50 transition-all duration-500 min-h-[56px]"
    >
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-foreground/15 group-hover:bg-primary/50 transition-colors duration-500" />
        <span className="text-sm font-light text-foreground/60 group-hover:text-foreground transition-colors duration-500 tracking-wide">
          {link.label}
        </span>
      </div>
      <svg
        className="w-3.5 h-3.5 text-foreground/15 group-hover:text-primary/60 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    </motion.a>
  )
}

export default function ConnectSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="connect" className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary/40" />
            <span className="text-primary/60 text-[10px] tracking-[0.3em] uppercase font-light">
              Connect
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16 mb-12">
            <div className="flex-1 max-w-md">
              <h2 className="text-3xl md:text-5xl font-light text-foreground tracking-tight mb-6 leading-[1.15]">
                Find me
                <br />
                <span className="instrument italic text-primary">elsewhere</span>
              </h2>
              <p className="text-sm font-light text-foreground/40 leading-relaxed">
                find me in the few places i reluctantly left digital footprints (mostly embeddings and existential dread)
              </p>
            </div>

            {/* Link cards */}
            <div className="flex flex-col gap-2 md:w-[320px]">
              {links.map((link, index) => (
                <LinkCard key={link.label} link={link} index={index} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="border-t border-foreground/5 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
            <span className="text-foreground/20 text-[10px] tracking-widest uppercase font-light">
              V. Beck
            </span>
          </div>
          <span className="text-foreground/15 text-[10px] tracking-wide font-light">
            {"Perpetually uphill"}
          </span>
        </div>
      </div>
    </section>
  )
}
