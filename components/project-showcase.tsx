"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import type { GitHubRepo } from "@/lib/types"

interface Project {
  title: string
  description: string
  tags: string[]
  repoUrl: string
  homepageUrl: string | null
  year: string
  lastActive: string
  language: string | null
  owner: string
  stars: number
  forks: number
  size: number
  rawName: string
}

function transformReposToProjects(repos: GitHubRepo[]): Project[] {
  return repos.map((repo) => ({
    title: formatTitle(repo.name),
    description: repo.description || "",
    tags:
      repo.topics && repo.topics.length > 0
        ? repo.topics.slice(0, 5)
        : repo.language
          ? [repo.language]
          : [],
    repoUrl: repo.html_url,
    homepageUrl:
      repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null,
    year: new Date(repo.created_at).getUTCFullYear().toString(),
    lastActive: formatRelativeDate(repo.pushed_at || repo.updated_at),
    language: repo.language,
    owner: repo.owner.login,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    size: repo.size,
    rawName: repo.name,
  }))
}

function formatTitle(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const MONTHS_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
]

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const LANG_COLORS: Record<string, string> = {
  Python: "#c8b89a",
  TypeScript: "#6e9fba",
  JavaScript: "#c8a84e",
  Rust: "#b5654a",
  Go: "#5a9e8f",
  "Jupyter Notebook": "#c8b89a",
  HTML: "#b5654a",
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
  const [showEmbed, setShowEmbed] = useState(false)

  const langColor = project.language
    ? LANG_COLORS[project.language] || "rgba(200,184,154,0.4)"
    : "rgba(200,184,154,0.2)"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      {/* ── Terminal chrome header ────────────────────────────── */}
      <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg border border-b-0 border-foreground/[0.06] bg-[#0d0c0b]">
        {/* Subtle top-edge glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${langColor}33, transparent)`,
          }}
        />
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: `${langColor}55` }}
          />
          <span className="w-2 h-2 rounded-full bg-foreground/[0.06]" />
          <span className="w-2 h-2 rounded-full bg-foreground/[0.06]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-foreground/20 tracking-wide truncate">
          ~/{project.owner}/{project.rawName}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {project.homepageUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEmbed(!showEmbed)
              }}
              className="flex items-center gap-1.5 text-[9px] tracking-wide uppercase font-light transition-colors duration-300 min-h-[44px] px-2"
              style={{ color: showEmbed ? langColor : `${langColor}88` }}
              aria-label={showEmbed ? "Hide preview" : "Show live preview"}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: showEmbed ? "#4ade80" : `${langColor}44`,
                  boxShadow: showEmbed ? "0 0 6px #4ade8066" : "none",
                }}
              />
              {showEmbed ? "Hide" : "Preview"}
            </button>
          )}
        </div>
      </div>

      {/* ── Card body ────────────────────────────────────────── */}
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
          className="relative overflow-hidden border border-foreground/[0.06] bg-[#0d0c0b]/80 backdrop-blur-sm transition-all duration-500 hover:bg-[#0d0c0b]"
          style={{
            borderRadius: showEmbed ? "0" : "0 0 0.5rem 0.5rem",
          }}
        >
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] opacity-40 group-hover:opacity-80 transition-opacity duration-500"
            style={{ backgroundColor: langColor }}
          />

          <div className="p-5 md:p-6 pl-6 md:pl-8">
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-4 text-[10px] tracking-wide font-light">
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: langColor }}
              />
              {project.language && (
                <span className="text-foreground/35 uppercase">
                  {project.language}
                </span>
              )}
              <span className="text-foreground/10">{"/"}</span>
              <span className="text-foreground/20">est. {project.year}</span>
              <span className="text-foreground/10">{"/"}</span>
              <span className="text-foreground/20">
                active {project.lastActive}
              </span>
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

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-light text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors duration-500">
              <span className="instrument italic">{project.title}</span>
            </h3>

            {/* Description */}
            <p className="text-sm font-light text-foreground/35 leading-relaxed max-w-2xl mb-5">
              {project.description}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-5 mb-4">
              {project.stars > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-foreground/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="text-foreground/25 text-xs font-light">
                    {project.stars}
                  </span>
                </div>
              )}
              {project.forks > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-foreground/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="text-foreground/25 text-xs font-light">
                    {project.forks}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-foreground/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
                <span className="text-foreground/25 text-xs font-light">
                  {formatSize(project.size)}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] tracking-wide uppercase text-foreground/25 border border-foreground/[0.06] rounded-full px-2.5 py-0.5 font-light"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── Expanded detail panel ──────────────────────────── */}
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
                  <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
                    <p className="text-sm font-light text-foreground/40 leading-relaxed max-w-lg">
                      {project.description}
                      {project.language
                        ? ` Built with ${project.language}.`
                        : ""}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      {project.homepageUrl && (
                        <a
                          href={project.homepageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/10 text-foreground/45 text-xs tracking-wide font-light hover:text-foreground/70 hover:border-foreground/20 transition-all duration-300 min-h-[44px]"
                        >
                          Visit site
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
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-xs tracking-wide font-light hover:bg-primary/10 transition-all duration-300 min-h-[44px]"
                      >
                        View on GitHub
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Embedded live preview (iframe) ────────────────────── */}
      <AnimatePresence>
        {showEmbed && project.homepageUrl && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-b-lg border border-t-0 border-foreground/[0.06] overflow-hidden bg-[#0d0c0b]">
              {/* Browser-style address bar */}
              <div className="flex items-center gap-2.5 px-4 py-2 border-b border-foreground/[0.04] bg-[#0a0908]">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-green-500/50"
                  style={{ boxShadow: "0 0 4px #4ade8044" }}
                />
                <div className="flex-1 flex items-center rounded bg-foreground/[0.03] px-3 py-1">
                  <svg
                    className="w-2.5 h-2.5 text-foreground/15 mr-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                  <span className="text-[10px] font-mono text-foreground/25 truncate">
                    {project.homepageUrl}
                  </span>
                </div>
              </div>
              {/* Iframe container with inner shadow */}
              <div
                className="relative w-full"
                style={{ height: "min(60vh, 500px)" }}
              >
                <div className="pointer-events-none absolute inset-0 z-10 rounded-b-lg" style={{ boxShadow: "inset 0 2px 20px rgba(0,0,0,0.5)" }} />
                <iframe
                  src={project.homepageUrl}
                  title={`Live preview of ${project.title}`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ProjectShowcaseProps {
  repos: GitHubRepo[]
}

export default function ProjectShowcase({ repos }: ProjectShowcaseProps) {
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
        <div className="flex flex-col gap-6 md:gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.rawName}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
