"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const links = [
  { label: "GitHub", href: "https://github.com/stochastic-sisyphus" },
  { label: "HuggingFace", href: "https://huggingface.co/stochastic-sisyphus" },
  { label: "LinkedIn", href: "https://linkedin.com/in/vanessabeck" },
  { label: "ORCID", href: "https://orcid.org/0000-0000-0000-0000" },
  { label: "Substack", href: "#" },
]

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

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 md:gap-20 mb-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-light text-foreground tracking-tight mb-6 leading-[1.15]">
                Find me
                <br />
                <span className="instrument italic text-primary">elsewhere</span>
              </h2>
              <p className="text-sm font-light text-foreground/40 leading-relaxed max-w-md">
                Interested in ML research, open-source collaboration, or just
                want to talk about embeddings and existential dread -- all the
                usual places.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <a
                href="https://github.com/stochastic-sisyphus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg md:text-xl font-light text-foreground hover:text-primary transition-colors duration-500 tracking-tight instrument italic"
              >
                stochastic-sisyphus
              </a>
              <div className="flex items-center gap-4 mt-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/30 hover:text-foreground/60 text-[10px] tracking-wide uppercase font-light transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
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
