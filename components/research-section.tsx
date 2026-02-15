"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import type { ResearchPaper } from "@/lib/types"
import EmbedDrawer from "@/components/embed-drawer"

interface ResearchSectionProps {
  papers: ResearchPaper[]
}

const TYPE_ACCENTS: Record<string, string> = {
  visualization: "#c8a84e",
  repository: "#8a8478",
}
const DEFAULT_ACCENT = "#c8b89a"

function getAccent(type: string) {
  return TYPE_ACCENTS[type] || DEFAULT_ACCENT
}

function getTypeLabel(type: string) {
  if (type === "visualization") return "Interactive"
  if (type === "repository") return "Repository"
  return "Paper"
}

/** Determine if this paper has an embeddable URL */
function getEmbedUrl(paper: ResearchPaper): string | null {
  // Verification reversal interactive HTML
  if (paper.id === "verification-reversal" || paper.id === "verification-reversal-viz") {
    return "/verification-reversal.html"
  }
  // GitHub-hosted pages
  if (paper.githubUrl && paper.type === "visualization") {
    return paper.githubUrl.startsWith("/") ? paper.githubUrl : null
  }
  return null
}

/** External link for navigating away */
function getExternalUrl(paper: ResearchPaper): string | null {
  if (paper.doi) return `https://doi.org/${paper.doi}`
  if (paper.githubUrl) return paper.githubUrl
  if (paper.orcidUrl) return paper.orcidUrl
  return null
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
  const [showEmbed, setShowEmbed] = useState(false)

  const accent = getAccent(paper.type)
  const embedUrl = getEmbedUrl(paper)
  const externalUrl = getExternalUrl(paper)

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group"
    >
      {/* Newspaper terminal chrome header */}
      <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg border border-b-0 border-foreground/[0.08] bg-[#1a1917]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`,
          }}
        />
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: `${accent}44` }}
          />
          <span className="w-2 h-2 rounded-full bg-foreground/[0.05]" />
          <span className="w-2 h-2 rounded-full bg-foreground/[0.05]" />
        </div>
        <div className="ml-2 flex items-center gap-2">
          <span className="text-foreground/15 text-[10px] font-mono tabular-nums tracking-wide">
            {number}
          </span>
          <span
            className="text-[9px] tracking-wide uppercase border rounded-full px-2.5 py-0.5 font-light"
            style={{
              borderColor: `${accent}33`,
              color: `${accent}88`,
            }}
          >
            {getTypeLabel(paper.type)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {embedUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEmbed(!showEmbed)
                if (!showEmbed) setExpanded(false)
              }}
              className="flex items-center gap-1.5 text-[9px] tracking-wide uppercase font-light transition-colors duration-300 min-h-[44px] px-2"
              style={{ color: showEmbed ? accent : `${accent}88` }}
              aria-label={showEmbed ? "Hide preview" : "Show preview"}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: showEmbed ? accent : `${accent}44`,
                  boxShadow: showEmbed ? `0 0 6px ${accent}66` : "none",
                }}
              />
              {showEmbed ? "Hide" : "Preview"}
            </button>
          )}
          <span className="text-foreground/20 text-[10px] tracking-wide font-light">
            {paper.year || "N/A"}
          </span>
        </div>
      </div>

      {/* Card body -- newspaper variant: lighter bg */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setExpanded(!expanded)
          if (expanded) setShowEmbed(false)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(!expanded)
        }}
        className="cursor-pointer"
        aria-expanded={expanded}
      >
        <div
          className="relative overflow-hidden border border-foreground/[0.08] bg-[#16150f]/80 backdrop-blur-sm transition-all duration-500 hover:bg-[#1a1917]"
          style={{
            borderRadius:
              showEmbed || expanded ? "0" : "0 0 0.5rem 0.5rem",
          }}
        >
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] opacity-30 group-hover:opacity-70 transition-opacity duration-500"
            style={{ backgroundColor: accent }}
          />

          <div className="p-5 md:p-6 pl-6 md:pl-8">
            {/* Title */}
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

            <div className="flex items-center gap-4">
              {paper.doi && (
                <span
                  className="text-[10px] font-mono tracking-wide"
                  style={{ color: `${accent}55` }}
                >
                  DOI: {paper.doi}
                </span>
              )}
              <div className="ml-auto">
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
          </div>

          {/* Expanded detail panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-foreground/[0.06] px-5 md:px-6 pl-6 md:pl-8 py-5">
                  <div className="flex flex-col gap-5">
                    {(paper.abstract || paper.description) && (
                      <p className="text-sm font-light text-foreground/40 leading-relaxed max-w-2xl">
                        {paper.abstract || paper.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {externalUrl && (
                        <a
                          href={externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs tracking-wide font-light transition-all duration-300 min-h-[44px]"
                          style={{
                            borderColor: `${accent}44`,
                            color: accent,
                          }}
                        >
                          {paper.type === "repository"
                            ? "View on GitHub"
                            : paper.doi
                              ? "Read paper"
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

      {/* Embed drawer -- newspaper variant */}
      {embedUrl && (
        <EmbedDrawer
          open={showEmbed}
          url={embedUrl}
          title={paper.title}
          variant="newspaper"
        />
      )}
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
            thoughts i <span className="instrument italic">fixated on</span>
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
