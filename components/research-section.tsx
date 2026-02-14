"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import type { ResearchPaper } from "@/lib/types"

interface ResearchSectionProps {
  papers: ResearchPaper[]
}

interface ProjectCardProps {
  paper: ResearchPaper
  index: number
  number: string
}

function ProjectCard({ paper, index, number }: ProjectCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Build DOI or ORCID URL link
  const href = paper.doi
    ? `https://doi.org/${paper.doi}`
    : paper.orcidUrl || undefined

  const Wrapper = href ? "a" : "div"
  const wrapperProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {}

  // Extract tags from journal name or type
  const tags: string[] = []
  if (paper.journal) tags.push(paper.journal)
  if (paper.type && paper.type !== 'publication') tags.push(paper.type)

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group border-t border-foreground/10 py-8 md:py-10"
    >
      <Wrapper {...wrapperProps} className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
        {/* Number + Meta */}
        <div className="flex items-start gap-4 md:gap-6 md:w-48 shrink-0">
          <span className="text-foreground/20 text-xs font-light tabular-nums">
            {number}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-foreground/40 text-[10px] tracking-wide uppercase font-light">
              {paper.year || 'N/A'}
            </span>
            {paper.doi && (
              <span className="text-primary/70 text-[10px] tracking-wide uppercase font-light">
                Published
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-light text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-500">
            <span className="instrument italic">{paper.title}</span>
          </h3>
          {paper.authors.length > 0 && (
            <p className="text-sm font-light text-foreground/50 mb-2">
              {paper.authors.join(', ')}
            </p>
          )}
          {paper.journal && (
            <p className="text-sm font-light text-foreground/40 leading-relaxed mb-4 max-w-lg">
              {paper.journal}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] tracking-wide uppercase text-foreground/30 border border-foreground/10 rounded-full px-3 py-1 font-light"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        {href && (
          <div className="hidden md:flex items-center justify-center w-10 h-10 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <svg
              className="w-4 h-4 text-primary"
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
          </div>
        )}
      </Wrapper>
    </motion.article>
  )
}

export default function ResearchSection({ papers }: ResearchSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="research" className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
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
              Research
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
            Selected <span className="instrument italic">publications</span>
          </h2>
        </motion.div>

        {/* Paper List */}
        <div>
          {papers.map((paper, index) => (
            <ProjectCard
              key={paper.id}
              paper={paper}
              index={index}
              number={String(index + 1).padStart(2, '0')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
