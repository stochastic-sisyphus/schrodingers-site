"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import type { GitHubRepo } from "@/lib/types"

interface Project {
  title: string
  description: string
  tags: string[]
  repoUrl: string
  year: string
  lastActive: string
  language?: string
  owner: string
  stars: number
  forks: number
  size: number
  rawName: string
}

function transformReposToProjects(repos: GitHubRepo[]): Project[] {
  return repos.slice(0, 6).map((repo) => {
    const year = new Date(repo.created_at).getFullYear().toString()
    const lastActive = formatRelativeDate(repo.pushed_at || repo.updated_at)
    const tags =
      repo.topics && repo.topics.length > 0
        ? repo.topics.slice(0, 5)
        : repo.language
          ? [repo.language]
          : []

    return {
      title: formatTitle(repo.name),
      description: repo.description || "A project exploring computational depth.",
      tags,
      repoUrl: repo.html_url,
      year,
      lastActive,
      language: repo.language || undefined,
      owner: repo.owner.login,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      size: repo.size,
      rawName: repo.name,
    }
  })
}

function formatTitle(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function langColor(language?: string): string {
  const map: Record<string, string> = {
    Python: "#c8b89a",
    TypeScript: "#6e9fba",
    JavaScript: "#c8a84e",
    Rust: "#b5654a",
    Go: "#5a9e8f",
    Jupyter: "#c8b89a",
    "Jupyter Notebook": "#c8b89a",
    HTML: "#b5654a",
  }
  return language ? map[language] || "rgba(200,184,154,0.4)" : "rgba(200,184,154,0.2)"
}

function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(!expanded)
        }}
        className="block cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="relative rounded-lg overflow-hidden border border-foreground/8 bg-card/60 backdrop-blur-sm hover:border-foreground/15 transition-all duration-500 hover:bg-card/80">
          {/* Card body */}
          <div className="p-5 md:p-6">
            {/* Top meta row */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: langColor(project.language) }}
                aria-hidden="true"
              />
              {project.language && (
                <span className="text-foreground/40 text-[10px] tracking-wide font-light uppercase">
                  {project.language}
                </span>
              )}
              <div className="w-3 h-px bg-foreground/10" />
              <span className="text-foreground/25 text-[10px] tracking-wide font-light">
                est. {project.year}
              </span>
              <span className="text-foreground/15 text-[10px]">{"/"}</span>
              <span className="text-foreground/25 text-[10px] tracking-wide font-light">
                active {project.lastActive}
              </span>
              <div className="ml-auto">
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-3.5 h-3.5 text-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-light text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors duration-500">
              <span className="instrument italic">{project.title}</span>
            </h3>

            {/* Description */}
            <p className="text-sm font-light text-foreground/40 leading-relaxed max-w-2xl mb-5">
              {project.description}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-5 mb-4">
              {project.stars > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-foreground/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-foreground/30 text-xs font-light">{project.stars}</span>
                </div>
              )}
              {project.forks > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-foreground/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-foreground/30 text-xs font-light">{project.forks}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-foreground/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span className="text-foreground/30 text-xs font-light">{formatSize(project.size)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] tracking-wide uppercase text-foreground/30 border border-foreground/8 rounded-full px-2.5 py-0.5 font-light"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Expandable detail panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-foreground/5 px-5 md:px-6 py-5">
                  <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
                    {/* Repo path */}
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-xs text-foreground/30 tracking-wide">
                        {project.owner}/{project.rawName}
                      </span>
                      <p className="text-sm font-light text-foreground/45 leading-relaxed max-w-lg">
                        {project.description}
                        {project.language ? ` Built with ${project.language}.` : ""}
                      </p>
                    </div>
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-xs tracking-wide font-light hover:bg-primary/10 transition-all duration-300 shrink-0 min-h-[44px]"
                    >
                      View on GitHub
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

interface FigmaShowcaseProps {
  repos: GitHubRepo[]
}

export default function FigmaShowcase({ repos }: FigmaShowcaseProps) {
  const sectionRef = useRef(null)
  const headerInView = useInView(sectionRef, { once: true, margin: "-50px" })

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
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary/40" />
            <span className="text-primary/60 text-[10px] tracking-[0.3em] uppercase font-light">
              Projects
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-4">
            the machine{"'"}s learning{" "}
            <span className="instrument italic">(with my supervision)</span>
          </h2>
          <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-lg">
            Tools, experiments, and systems in various stages of becoming.
            Tap any card to peek inside.
          </p>
        </motion.div>

        {/* Project cards */}
        <div className="flex flex-col gap-5 md:gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.rawName} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
