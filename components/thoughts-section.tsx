"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import type { BlogPost } from "@/lib/types"

const placeholderThoughts = [
  {
    date: "2025",
    title: "On building systems that know what they don't know",
    excerpt:
      "Most ML pipelines output confidence scores like they mean something. But calibrated uncertainty is a different animal entirely -- it requires the model to be honest about its own ignorance. What does it take to build that?",
    readTime: "7 min",
    link: "#",
  },
  {
    date: "2025",
    title: "The stochastic Sisyphus problem",
    excerpt:
      "Every gradient descent is a hill you climb knowing the landscape will shift. The boulder rolls back. You adjust the learning rate and start again. There is something deeply human about optimization under uncertainty.",
    readTime: "5 min",
    link: "#",
  },
  {
    date: "2025",
    title: "Embeddings as compressed worldviews",
    excerpt:
      "When we project language into vector space, we're not just reducing dimensions -- we're encoding an entire epistemology. What a model places near each other reveals what it believes is similar. And that belief is never neutral.",
    readTime: "6 min",
    link: "#",
  },
  {
    date: "2024",
    title: "Retrieval is not search",
    excerpt:
      "Search engines find documents. Retrieval systems find meaning. The difference sounds subtle until you've built both and watched one fail gracefully while the other returns ten blue links to nowhere.",
    readTime: "4 min",
    link: "#",
  },
]

interface ThoughtData {
  date: string
  title: string
  excerpt: string
  readTime: string
  link: string
}

function ThoughtCard({ thought, index, isFeatured }: { thought: ThoughtData; index: number; isFeatured: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [touched, setTouched] = useState(false)

  const isExternal = thought.link.startsWith("http")

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      className={`group ${isFeatured ? "md:col-span-2" : ""}`}
    >
      <a
        href={thought.link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block h-full"
        onTouchStart={() => setTouched(true)}
        onTouchEnd={() => setTimeout(() => setTouched(false), 300)}
      >
        <div
          className={`relative h-full rounded-lg overflow-hidden border border-foreground/5 transition-all duration-500 hover:border-foreground/15 ${
            touched ? "border-foreground/15 bg-card/60" : "bg-card/30"
          } hover:bg-card/60`}
        >
          {/* Accent stripe */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className={`p-5 md:p-6 ${isFeatured ? "md:p-8" : ""} flex flex-col h-full`}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-foreground/30 text-[10px] tracking-wide uppercase font-light">
                  {thought.date}
                </span>
                <div className="w-3 h-px bg-foreground/10" />
                <span className="text-foreground/20 text-[10px] tracking-wide font-light">
                  {thought.readTime}
                </span>
              </div>
              {isFeatured && (
                <span className="text-[9px] tracking-wide uppercase text-primary/40 border border-primary/15 rounded-full px-2.5 py-0.5 font-light">
                  Latest
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className={`font-light text-foreground tracking-tight mb-4 group-hover:text-primary transition-colors duration-500 leading-snug ${
                isFeatured ? "text-xl md:text-2xl" : "text-lg md:text-xl"
              }`}
            >
              <span className="instrument italic">{thought.title}</span>
            </h3>

            {/* Excerpt */}
            <p
              className={`text-sm font-light text-foreground/35 leading-relaxed flex-1 ${
                isFeatured ? "line-clamp-4" : "line-clamp-3"
              }`}
            >
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
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

  const thoughts: ThoughtData[] =
    posts.length > 0
      ? posts.map((post) => ({
          date: post.date.getFullYear().toString(),
          title: post.title,
          excerpt: post.excerpt,
          readTime: estimateReadTime(post.content || post.excerpt),
          link: post.substackUrl || "#",
        }))
      : placeholderThoughts

  return (
    <section id="thoughts" className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32">
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
              Thoughts
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-4">
            scattered <span className="instrument italic">embers</span>
          </h2>
          <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-lg">
            Long-form writing on ML, uncertainty, and the spaces between things that work and things that almost do.
          </p>
        </motion.div>

        {/* Bento-style grid: first card spans 2 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {thoughts.map((thought, index) => (
            <ThoughtCard
              key={thought.title}
              thought={thought}
              index={index}
              isFeatured={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}
