"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import type { GitHubRepo } from "@/lib/types"
import EmbedDrawer from "@/components/embed-drawer"
import ContentPreviewDrawer from "@/components/content-preview-drawer"
import { compareReposForDisplay, getRepoDisplayTopics } from "@/lib/github"

interface Project {
  title: string
  description: string
  tags: string[]
  repoUrl: string
  homepageUrl: string | null
  previewUrl: string | null
  year: string
  lastActive: string
  language: string | null
  owner: string
  rawName: string
}

/** URLs that refuse iframe embedding (X-Frame-Options / CSP) */
const BLOCKED_EMBED_URLS = [
  "pypi.org",
  "npmjs.com",
  "doi.org",
  "zenodo.org",
  "github.com",
  "arxiv.org",
]

const REPO_PREVIEW_OVERRIDES: Record<string, string> = {
  "verification-reversal": "/verification-reversal.html",
}

function canEmbed(url: string | null): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) return false
    if (BLOCKED_EMBED_URLS.some((blocked) => parsed.hostname.includes(blocked))) return false
    if (parsed.pathname.endsWith(".pdf")) return false
    return true
  } catch {
    return false
  }
}

function transformReposToProjects(repos: GitHubRepo[]): Project[] {
  return repos.map((repo) => ({
    title: formatTitle(repo.name),
    description: repo.description || "",
    tags:
      getRepoDisplayTopics(repo).length > 0
        ? getRepoDisplayTopics(repo).slice(0, 5)
        : repo.language
          ? [repo.language]
          : [],
    repoUrl: repo.html_url,
    homepageUrl: repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null,
    previewUrl:
      REPO_PREVIEW_OVERRIDES[repo.name.toLowerCase()] ||
      (repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null),
    year: new Date(repo.created_at).getUTCFullYear().toString(),
    lastActive: formatRelativeDate(repo.pushed_at || repo.updated_at),
    language: repo.language,
    owner: repo.owner.login,
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

  const embeddable = canEmbed(project.previewUrl)

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
      {/* Terminal chrome header */}
      <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg border border-b-0 border-foreground/[0.12] bg-[#16130f]">
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowEmbed(!showEmbed)
              if (!showEmbed) setExpanded(false)
            }}
            className="flex items-center gap-1.5 text-[9px] tracking-wide uppercase font-light transition-colors duration-300 min-h-[44px] px-2"
            style={{ color: showEmbed ? langColor : `${langColor}88` }}
            aria-label={showEmbed ? "Hide preview" : "Show preview"}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: showEmbed ? langColor : `${langColor}44`,
                boxShadow: showEmbed ? `0 0 6px ${langColor}66` : "none",
              }}
            />
            {showEmbed ? "Hide" : "Preview"}
          </button>
        </div>
      </div>

      {/* Card body */}
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
          className="relative overflow-hidden border border-foreground/[0.12] bg-[#1b1712]/92 backdrop-blur-sm transition-all duration-500 hover:bg-[#241f19]"
          style={{
            borderRadius:
              showEmbed || expanded ? "0" : "0 0 0.5rem 0.5rem",
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
            <p className="text-sm font-light text-foreground/55 leading-relaxed max-w-2xl mb-5">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] tracking-wide uppercase text-foreground/45 border border-foreground/[0.12] rounded-full px-2.5 py-0.5 font-light"
                >
                  {tag}
                </span>
              ))}
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
                <div className="border-t border-foreground/[0.04] px-5 md:px-6 pl-6 md:pl-8 py-5">
                  <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
                    <p className="text-sm font-light text-foreground/40 leading-relaxed max-w-lg">
                      {project.description}
                      {project.language ? ` Built with ${project.language}.` : ""}
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
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
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
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
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

      {/* Embed drawer */}
      {embeddable && project.previewUrl && (
        <EmbedDrawer
          open={showEmbed}
          url={project.previewUrl}
          title={project.title}
          variant="terminal"
        />
      )}
      {!embeddable && (
        <ContentPreviewDrawer
          open={showEmbed}
          title={project.title}
          description={project.description || "Project snapshot"}
          tags={project.tags}
          metrics={[
            {
              label: "Focus",
              value:
                project.tags.length > 0
                  ? project.tags.slice(0, 2).join(" • ")
                  : "computational project",
            },
            { label: "Stack", value: project.language || "mixed" },
            { label: "Maintained", value: project.lastActive },
            { label: "Path", value: `${project.owner}/${project.rawName}` },
          ]}
          actions={[
            ...(project.homepageUrl
              ? [{ label: "Visit site", url: project.homepageUrl }]
              : []),
            { label: "View on GitHub", url: project.repoUrl },
          ]}
          variant="terminal"
        />
      )}
    </motion.div>
  )
}

interface ProjectShowcaseProps {
  repos: GitHubRepo[]
}

export default function ProjectShowcase({ repos }: ProjectShowcaseProps) {
  const sectionRef = useRef(null)
  const headerInView = useInView(sectionRef, { once: true, margin: "-50px" })
  const projects = transformReposToProjects([...repos].sort(compareReposForDisplay))

  return (
    <section
      id="projects"
      className="relative z-10 bg-background px-6 md:px-10 py-20 md:py-32"
    >
      <div className="max-w-5xl mx-auto">
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

        <div className="flex flex-col gap-6 md:gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.rawName} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
