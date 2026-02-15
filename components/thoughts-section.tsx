"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import type { BlogPost } from "@/lib/types"

interface ThoughtData {
  date: string
  title: string
  excerpt: string
  content: string
  htmlContent: string
  readTime: string
  link: string
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

/**
 * Sanitize HTML content from RSS for safe rendering.
 * Keeps structural tags (p, h1-h6, em, strong, a, br, blockquote, ul, ol, li)
 * and removes everything else (script, style, img, iframe, etc.)
 */
function sanitizeHtml(html: string): string {
  // Remove script/style tags and their content
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")

  // Remove images (Substack images won't load with correct auth)
  cleaned = cleaned.replace(/<img[^>]*\/?>/gi, "")

  // Remove all tags except allowed ones
  const allowed =
    /<\/?(p|h[1-6]|em|strong|b|i|a|br|blockquote|ul|ol|li|hr|div|span|figure|figcaption|pre|code)(\s[^>]*)?>/gi
  const parts: string[] = []
  let last = 0

  // Walk through and keep only allowed tags
  const tagPattern = /<\/?[a-z][a-z0-9]*(\s[^>]*)?>/gi
  let match
  while ((match = tagPattern.exec(cleaned)) !== null) {
    parts.push(cleaned.slice(last, match.index))
    if (allowed.test(match[0])) {
      // Reset the allowed regex lastIndex
      allowed.lastIndex = 0
      parts.push(match[0])
    }
    last = match.index + match[0].length
  }
  parts.push(cleaned.slice(last))

  return parts.join("")
}

const WRITING_ACCENT = "#c8b89a"

function WritingCard({
  thought,
  index,
}: {
  thought: ThoughtData
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.08 }}
      className="group"
    >
      {/* Newspaper terminal chrome header */}
      <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg border border-b-0 border-foreground/[0.08] bg-[#1a1917]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${WRITING_ACCENT}22, transparent)`,
          }}
        />
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: `${WRITING_ACCENT}44` }}
          />
          <span className="w-2 h-2 rounded-full bg-foreground/[0.05]" />
          <span className="w-2 h-2 rounded-full bg-foreground/[0.05]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-foreground/20 tracking-wide truncate">
          substack/{thought.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <a
            href={thought.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[9px] tracking-wide uppercase font-light transition-colors duration-300 min-h-[44px] px-2"
            style={{ color: `${WRITING_ACCENT}88` }}
            aria-label="Read on Substack"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open
          </a>
          <span className="text-foreground/20 text-[10px] tracking-wide font-light">
            {thought.readTime}
          </span>
        </div>
      </div>

      {/* Card body */}
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
          className="relative overflow-hidden border border-foreground/[0.08] bg-[#16150f]/80 backdrop-blur-sm transition-all duration-500 hover:bg-[#1a1917]"
          style={{
            borderRadius: expanded ? "0" : "0 0 0.5rem 0.5rem",
          }}
        >
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] opacity-25 group-hover:opacity-60 transition-opacity duration-500"
            style={{ backgroundColor: WRITING_ACCENT }}
          />

          <div className="p-5 md:p-6 pl-6 md:pl-8">
            {/* Date */}
            <span className="text-foreground/25 text-[10px] tracking-wide font-light block mb-3">
              {thought.date}
            </span>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-light text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors duration-500 leading-snug">
              <span className="instrument italic">{thought.title}</span>
            </h3>

            {/* Excerpt */}
            <p className="text-sm font-light text-foreground/30 leading-relaxed line-clamp-2 mb-3">
              {thought.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-4 h-px bg-primary/30" />
                <span className="text-primary/40 text-[10px] tracking-wide uppercase font-light">
                  {expanded ? "Collapse" : "Read preview"}
                </span>
              </div>
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
      </div>

      {/* Expanded reading pane -- inline content from RSS, no iframe */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-b-lg border border-t-0 border-foreground/[0.08] bg-[#1a1917] overflow-hidden">
              {/* Reading pane header bar */}
              <div className="flex items-center gap-2.5 px-4 py-2 border-b border-foreground/[0.06] bg-[#16150f]">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: WRITING_ACCENT,
                    boxShadow: `0 0 4px ${WRITING_ACCENT}44`,
                  }}
                />
                <span className="text-[10px] font-mono text-foreground/25 truncate">
                  preview
                </span>
                <a
                  href={thought.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto text-foreground/20 hover:text-foreground/40 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  aria-label={`Read ${thought.title} on Substack`}
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              {/* Inline reading content -- rendered from RSS HTML */}
              <div className="px-6 md:px-8 py-6 md:py-8 max-h-[60vh] overflow-y-auto">
                <div
                  className="writing-prose max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: thought.htmlContent }}
                />
                  <div className="mt-6 pt-4 border-t border-foreground/[0.06]">
                    <a
                      href={thought.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs tracking-wide font-light transition-all duration-300 min-h-[44px]"
                      style={{
                        borderColor: `${WRITING_ACCENT}44`,
                        color: WRITING_ACCENT,
                      }}
                    >
                      Continue reading on Substack
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
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

interface ThoughtsSectionProps {
  posts?: BlogPost[]
}

export default function ThoughtsSection({ posts = [] }: ThoughtsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const thoughts: ThoughtData[] = posts.map((post) => {
    const rawContent = post.content || post.excerpt
    return {
      date: formatDate(
        post.date instanceof Date ? post.date.toISOString() : String(post.date)
      ),
      title: post.title,
      excerpt: stripHtml(post.excerpt),
      content: stripHtml(rawContent),
      htmlContent: sanitizeHtml(rawContent),
      readTime: estimateReadTime(rawContent),
      link: post.substackUrl || "#",
    }
  })

  if (thoughts.length === 0) return null

  return (
    <section
      id="thoughts"
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

        <div className="flex flex-col gap-5 md:gap-6">
          {thoughts.map((thought, index) => (
            <WritingCard
              key={thought.title}
              thought={thought}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
