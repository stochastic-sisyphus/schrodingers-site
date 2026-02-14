"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import type { GitHubRepo } from "@/lib/types"

interface Project {
  title: string
  description: string
  tags: string[]
  repoUrl: string
  year: string
  language?: string
  owner: string
  stars: number
}

/**
 * Transform GitHub repo data into project card format
 */
function transformReposToProjects(repos: GitHubRepo[]): Project[] {
  return repos.slice(0, 6).map((repo) => {
    // Extract year from created_at or updated_at
    const year = new Date(repo.created_at).getFullYear().toString()

    // Use topics as tags if available, otherwise use language
    const tags = repo.topics && repo.topics.length > 0
      ? repo.topics.slice(0, 3)
      : repo.language
        ? [repo.language]
        : []

    return {
      title: formatTitle(repo.name),
      description: repo.description || "A project exploring computational depth.",
      tags,
      repoUrl: repo.html_url,
      year,
      language: repo.language || undefined,
      owner: repo.owner.login,
      stars: repo.stargazers_count,
    }
  })
}

/**
 * Format repository name into human-readable title
 */
function formatTitle(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-120px" })
  const [isHovered, setIsHovered] = useState(false)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [1.5, 0, -1.5])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ y }}
      className="group"
    >
      <a
        href={project.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Project meta */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-foreground/20 text-[10px] tracking-wide font-light tabular-nums">
                {project.year}
              </span>
              <div className="w-4 h-px bg-foreground/10" />
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] tracking-wide uppercase text-foreground/25 border border-foreground/8 rounded-full px-2.5 py-0.5 font-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-light text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors duration-500">
              <span className="instrument italic">{project.title}</span>
            </h3>
            <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-lg">
              {project.description}
            </p>
          </div>

          {/* Arrow */}
          <div className="shrink-0 ml-6 flex items-center justify-center w-10 h-10 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
        </div>

        {/* Visual card with parallax */}
        <motion.div
          style={{ rotateX: rotate }}
          className="relative perspective-[2000px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Outer glow on hover */}
          <motion.div
            className="absolute -inset-px rounded-sm pointer-events-none"
            animate={{
              boxShadow: isHovered
                ? "0 0 60px 2px rgba(200, 184, 154, 0.08), 0 0 120px 4px rgba(200, 184, 154, 0.03)"
                : "0 0 0px 0px rgba(200, 184, 154, 0)",
            }}
            transition={{ duration: 0.6 }}
          />

          <div className="relative rounded-sm overflow-hidden border border-foreground/8 bg-card p-6 md:p-8">
            {/* Terminal-style header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-foreground/10" />
                <div className="w-2 h-2 rounded-full bg-foreground/10" />
                <div className="w-2 h-2 rounded-full bg-foreground/10" />
              </div>
              <span className="text-[10px] text-foreground/20 tracking-wide font-light font-mono">
                github.com/stochastic-sisyphus
              </span>
            </div>

            {/* Code-like content */}
            <div className="font-mono text-xs leading-relaxed">
              <div className="text-foreground/15 mb-1">
                {"# "}{project.title.toLowerCase().replace(/\s+/g, "-")}
              </div>
              <div className="text-foreground/30 mb-3">
                {project.description.substring(0, 80)}
                {project.description.length > 80 ? "..." : ""}
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                {project.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/40" />
                    <span className="text-foreground/25">{project.language}</span>
                  </span>
                )}
                <span className="text-foreground/15">{project.owner}</span>
                {project.stars > 0 && (
                  <span className="text-foreground/15">★ {project.stars}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </a>
    </motion.div>
  )
}

interface FigmaShowcaseProps {
  repos: GitHubRepo[]
}

export default function FigmaShowcase({ repos }: FigmaShowcaseProps) {
  const sectionRef = useRef(null)
  const headerInView = useInView(sectionRef, { once: true, margin: "-50px" })

  // Transform GitHub repos into project format
  const projects = transformReposToProjects(repos)

  return (
    <section
      id="projects"
      className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary/40" />
            <span className="text-primary/60 text-[10px] tracking-[0.3em] uppercase font-light">
              Projects
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-4">
            Open <span className="instrument italic">work</span>
          </h2>
          <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-lg">
            Tools, experiments, and systems in various stages of becoming.
            Everything lives on GitHub.
          </p>
        </motion.div>

        {/* Project cards */}
        <div className="flex flex-col gap-16 md:gap-24">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
