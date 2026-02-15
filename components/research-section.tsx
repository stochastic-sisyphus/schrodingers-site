"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import type { ResearchPaper } from "@/lib/types"

interface ResearchSectionProps {
  papers: ResearchPaper[]
}

const TYPE_STYLES: Record<
  string,
  { label: string; accent: string; glow: string }
> = {
  visualization: {
    label: "Interactive",
    accent: "#4ade80",
    glow: "0 0 12px #4ade8020",
  },
  repository: {
    label: "Repository",
    accent: "#6e9fba",
    glow: "0 0 12px #6e9fba20",
  },
  default: {
    label: "Paper",
    accent: "#c8b89a",
    glow: "0 0 12px #c8b89a15",
  },
}

function getStyle(type: string) {
  return TYPE_STYLES[type] || TYPE_STYLES.default
}

function ResearchCard({
  paper,
  index,
  number,
}: {
  paper: ResearchPaper
  index: number
  number: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [expanded, setExpanded] = useState(false)

  const style = getStyle(paper.type)

  const isVerificationReversal = paper.doi === "10.5281/zenodo.18159898"
  const href = isVerificationReversal
    ? "/research/verification-reversal"
    : paper.githubUrl
      ? paper.githubUrl
      : paper.doi
        ? `https://doi.org/${paper.doi}`
        : paper.orcidUrl || undefined

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(!expanded)
        }}
        className="cursor-pointer"
        aria-expanded={expanded}
      >
        <div
          className="relative rounded-lg overflow-hidden border border-foreground/[0.06] bg-[#0d0c0b]/80 backdrop-blur-sm hover:border-foreground/[0.12] transition-all duration-500 hover:bg-[#0d0c0b]"
          style={{
            boxShadow: expanded ? style.glow : "none",
          }}
        >
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] opacity-30 group-hover:opacity-70 transition-opacity duration-500"
            style={{ backgroundColor: style.accent }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pl-6 py-3 border-b border-foreground/[0.04]">
            <div className="flex items-center gap-3">
              <span className="text-foreground/15 text-xs font-light tabular-nums font-mono">
                {number}
              </span>
              <span
                className="text-[9px] tracking-wide uppercase border rounded-full px-2.5 py-0.5 font-light"
                style={{
                  borderColor: `${style.accent}33`,
                  color: `${style.accent}99`,
                }}
              >
                {style.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-foreground/20 text-[10px] tracking-wide font-light">
                {paper.year || "N/A"}
              </span>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-3.5 h-3.5 text-foreground/25"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-5 md:p-6 pl-6 md:pl-8">
            <h3 className="text-lg md:text-xl font-light text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors duration-500 leading-snug">
              <span className="instrument italic">{paper.title}</span>
            </h3>

            {paper.authors.length > 0 && (
              <p className="text-xs font-light text-foreground/35 mb-2">
                {paper.authors.join(", ")}
              </p>
            )}

            {paper.journal && (
              <p className="text-xs font-light text-foreground/25 mb-3 italic">
                {paper.journal}
              </p>
            )}

            {paper.description && (
              <p className="text-sm font-light text-foreground/30 leading-relaxed mb-3 line-clamp-2">
                {paper.description}
              </p>
            )}

            {paper.doi && (
              <span className="text-[10px] font-mono tracking-wide" style={{ color: `${style.accent}55` }}>
                DOI: {paper.doi}
              </span>
            )}
          </div>

          {/* Expanded panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-foreground/[0.04] px-5 md:px-6 pl-6 md:pl-8 py-5">
                  <div className="flex flex-col gap-5">
                    {(paper.abstract || paper.description) && (
                      <div>
                        <span className="text-foreground/20 text-[10px] tracking-[0.2em] uppercase font-light block mb-2">
                          About this work
                        </span>
                        <p className="text-sm font-light text-foreground/45 leading-relaxed max-w-2xl">
                          {paper.abstract || paper.description}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {href && (
                        <a
                          href={href}
                          target={
                            isVerificationReversal ? undefined : "_blank"
                          }
                          rel={
                            isVerificationReversal
                              ? undefined
                              : "noopener noreferrer"
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs tracking-wide font-light hover:bg-primary/10 transition-all duration-300 min-h-[44px]"
                          style={{
                            borderColor: `${style.accent}44`,
                            color: style.accent,
                          }}
                        >
                          {isVerificationReversal
                            ? "View interactive paper"
                            : paper.type === "repository"
                              ? "View on GitHub"
                              : paper.doi
                                ? "Read full paper"
                                : "View source"}
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 17L17 7M17 7H7M17 7V17"
                            />
                          </svg>
                        </a>
                      )}
                      {paper.doi && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(
                              `Beck, V. (${paper.year}). ${paper.title}. ${paper.journal || ""}. https://doi.org/${paper.doi}`
                            )
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/[0.08] text-foreground/35 text-xs tracking-wide font-light hover:text-foreground/55 hover:border-foreground/15 transition-all duration-300 min-h-[44px]"
                        >
                          Copy citation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}

export default function ResearchSection({ papers }: ResearchSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section
      id="research"
      className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary/40" />
            <span className="text-primary/60 text-[10px] tracking-[0.3em] uppercase font-light">
              Research & Papers
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-2">
            thoughts i{" "}
            <span className="instrument italic">fixated on</span>
          </h2>
          <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-lg">
            long enough to formalize
          </p>
        </motion.div>

        <div className="flex flex-col gap-5 md:gap-6">
          {papers.map((paper, index) => (
            <ResearchCard
              key={paper.id}
              paper={paper}
              index={index}
              number={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
