"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import type { BlogPost } from "@/lib/types"

// Placeholder thoughts (fallback if Substack feed fails)
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

interface ThoughtCardProps {
  thought: {
    date: string
    title: string
    excerpt: string
    readTime: string
    link: string
  }
  index: number
}

function ThoughtCard({ thought, index }: ThoughtCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <a
        href={thought.link}
        target={thought.link.startsWith("http") ? "_blank" : undefined}
        rel={thought.link.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block"
      >
        <div className="border border-foreground/5 rounded-sm p-6 md:p-8 hover:border-foreground/15 transition-all duration-500 hover:bg-foreground/[0.02]">
          <div className="flex items-center justify-between mb-5">
            <span className="text-foreground/30 text-[10px] tracking-wide uppercase font-light">
              {thought.date}
            </span>
            <span className="text-foreground/20 text-[10px] tracking-wide font-light">
              {thought.readTime}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-light text-foreground mb-4 tracking-tight group-hover:text-primary transition-colors duration-500">
            <span className="instrument italic">{thought.title}</span>
          </h3>

          <p className="text-sm font-light text-foreground/35 leading-relaxed">
            {thought.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-primary/60 text-[10px] tracking-wide uppercase font-light">
              Read more
            </span>
            <svg
              className="w-3 h-3 text-primary/60"
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

  // Transform BlogPost[] to display format
  const thoughts = posts.length > 0
    ? posts.map((post) => ({
        date: post.date.getFullYear().toString(),
        title: post.title,
        excerpt: post.excerpt,
        readTime: estimateReadTime(post.content || post.excerpt),
        link: post.substackUrl || `#`,
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
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
            scattered <span className="instrument italic">embers</span>
          </h2>
        </motion.div>

        {/* Thoughts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {thoughts.map((thought, index) => (
            <ThoughtCard key={thought.title} thought={thought} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Estimate read time from content length
 */
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return `${minutes} min`
}
