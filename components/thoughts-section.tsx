"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import type { BlogPost } from "@/lib/types"

interface ThoughtData {
  date: string
  title: string
  excerpt: string
  readTime: string
  link: string
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  // Use UTC methods to avoid server/client timezone hydration mismatch
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

/** Featured / lead story card -- newspaper front-page style */
function LeadStoryCard({ thought, index }: { thought: ThoughtData; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const isExternal = thought.link.startsWith("http")

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      className="group md:col-span-2"
    >
      <a
        href={thought.link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block"
      >
        <div className="relative rounded-lg overflow-hidden border border-foreground/8 bg-card/30 hover:border-foreground/15 hover:bg-card/50 transition-all duration-500">
          {/* Newspaper masthead stripe */}
          <div className="border-b border-foreground/10 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-light">
                Latest
              </span>
              <div className="w-px h-3 bg-foreground/10" />
              <span className="text-foreground/25 text-[10px] tracking-wide font-light">
                {thought.date}
              </span>
            </div>
            <span className="text-foreground/20 text-[10px] tracking-wide font-light">
              {thought.readTime}
            </span>
          </div>

          <div className="p-6 md:p-8">
            {/* Headline */}
            <h3 className="text-2xl md:text-3xl font-light text-foreground tracking-tight mb-5 group-hover:text-primary transition-colors duration-500 leading-snug text-balance">
              <span className="instrument italic">{thought.title}</span>
            </h3>

            {/* Two-column excerpt on desktop, mimicking newspaper columns */}
            <div className="md:columns-2 md:gap-8">
              <p className="text-sm font-light text-foreground/35 leading-relaxed">
                {thought.excerpt}
              </p>
            </div>

            {/* Read more indicator */}
            <div className="mt-6 pt-4 border-t border-foreground/5 flex items-center gap-2">
              <div className="w-4 h-px bg-primary/40" />
              <span className="text-primary/50 text-[10px] tracking-wide uppercase font-light">
                Continue reading
              </span>
              <svg
                className="w-3 h-3 text-primary/50 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </motion.article>
  )
}

/** Column article card -- compact newspaper column style */
function ColumnCard({ thought, index }: { thought: ThoughtData; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const isExternal = thought.link.startsWith("http")

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      className="group"
    >
      <a
        href={thought.link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block h-full"
      >
        <div className="relative h-full rounded-lg overflow-hidden border border-foreground/5 bg-card/20 hover:border-foreground/12 hover:bg-card/40 transition-all duration-500">
          <div className="p-5 md:p-6 flex flex-col h-full">
            {/* Date & read time */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground/25 text-[10px] tracking-wide font-light">
                {thought.date}
              </span>
              <span className="text-foreground/15 text-[10px] tracking-wide font-light">
                {thought.readTime}
              </span>
            </div>

            {/* Thin rule separator like a newspaper */}
            <div className="w-full h-px bg-foreground/8 mb-4" />

            {/* Title */}
            <h3 className="text-lg md:text-xl font-light text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors duration-500 leading-snug">
              <span className="instrument italic">{thought.title}</span>
            </h3>

            {/* Excerpt */}
            <p className="text-sm font-light text-foreground/30 leading-relaxed flex-1 line-clamp-3">
              {thought.excerpt}
            </p>

            {/* Read indicator */}
            <div className="mt-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-4 h-px bg-primary/40" />
              <span className="text-primary/50 text-[10px] tracking-wide uppercase font-light">
                Read
              </span>
              <svg
                className="w-3 h-3 text-primary/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </motion.article>
  )
}

interface ThoughtsSectionProps {
  posts?: BlogPost[]
}

export default function ThoughtsSection({ posts = [] }: ThoughtsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  // Only render real posts from Substack -- no placeholders
  const thoughts: ThoughtData[] = posts.map((post) => ({
    date: formatDate(post.date instanceof Date ? post.date.toISOString() : String(post.date)),
    title: post.title,
    excerpt: stripHtml(post.excerpt),
    readTime: estimateReadTime(post.content || post.excerpt),
    link: post.substackUrl || "#",
  }))

  if (thoughts.length === 0) return null

  return (
    <section
      id="thoughts"
      className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
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
              Writing
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-2">
            writing into the{" "}
            <span className="instrument italic">abyss</span>
          </h2>
          <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-lg">
            just writing into the abyss
          </p>
        </motion.div>

        {/* Newspaper-style grid: lead story full width, rest in columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {thoughts.map((thought, index) =>
            index === 0 ? (
              <LeadStoryCard key={thought.title} thought={thought} index={index} />
            ) : (
              <ColumnCard key={thought.title} thought={thought} index={index} />
            )
          )}
        </div>
      </div>
    </section>
  )
}
