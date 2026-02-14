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
  language?: string
  owner: string
  stars: number
  rawName: string
}

function transformReposToProjects(repos: GitHubRepo[]): Project[] {
  return repos.slice(0, 6).map((repo) => {
    const year = new Date(repo.created_at).getFullYear().toString()
    const tags =
      repo.topics && repo.topics.length > 0
        ? repo.topics.slice(0, 4)
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

/** Generates a deterministic pseudo-code snippet based on the project name */
function generateCodePreview(name: string, language?: string): string[] {
  const lcName = name.toLowerCase()
  if (lcName.includes("cartograph")) {
    return [
      `def build_graph(repo_path: str):`,
      `    nodes = parse_ast(repo_path)`,
      `    edges = trace_imports(nodes)`,
      `    return CodeGraph(nodes, edges)`,
      ``,
      `graph = build_graph("./src")`,
      `graph.visualize(depth=3)`,
    ]
  }
  if (lcName.includes("extractor") || lcName.includes("span")) {
    return [
      `class SpanExtractor(nn.Module):`,
      `    def forward(self, tokens, mask):`,
      `        h = self.encoder(tokens)`,
      `        spans = self.span_head(h, mask)`,
      `        return spans, self.classifier(h)`,
    ]
  }
  if (lcName.includes("synsearch") || lcName.includes("search")) {
    return [
      `async def semantic_search(query: str):`,
      `    embedding = model.encode(query)`,
      `    results = index.search(embedding, k=10)`,
      `    return rerank(results, query)`,
    ]
  }
  if (lcName.includes("capstone") || lcName.includes("bosch") || lcName.includes("metadata")) {
    return [
      `pipeline = Pipeline([`,
      `    ("extract", MetadataExtractor()),`,
      `    ("embed", LLMEmbedder(model="gpt-4")),`,
      `    ("classify", HierarchicalClassifier()),`,
      `])`,
      `pipeline.fit(training_data)`,
    ]
  }
  if (language === "Python") {
    return [
      `import numpy as np`,
      `from model import Transformer`,
      ``,
      `model = Transformer(d_model=512)`,
      `output = model(input_tensor)`,
    ]
  }
  return [
    `// ${name}`,
    `const run = async () => {`,
    `  const data = await fetch(api)`,
    `  return process(data)`,
    `}`,
  ]
}

/** Language color dot */
function langColor(language?: string): string {
  const map: Record<string, string> = {
    Python: "#c8b89a",
    TypeScript: "#6e9fba",
    JavaScript: "#c8a84e",
    Rust: "#b5654a",
    Go: "#5a9e8f",
    Jupyter: "#c8b89a",
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
  const codeLines = generateCodePreview(project.rawName, project.language)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      {/* Clickable card wrapper */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(!expanded) }}
        className="block cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="relative rounded-lg overflow-hidden border border-foreground/8 bg-card/60 backdrop-blur-sm hover:border-foreground/15 transition-all duration-500 hover:bg-card/80">
          {/* Terminal chrome */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-foreground/25 tracking-wide font-mono hidden md:inline">
                {project.owner}/{project.rawName}
              </span>
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

          {/* Card body */}
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
              {/* Left: meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: langColor(project.language) }}
                  />
                  <span className="text-foreground/30 text-[10px] tracking-wide font-light">
                    {project.year}
                  </span>
                  <div className="w-3 h-px bg-foreground/10" />
                  {project.language && (
                    <span className="text-foreground/35 text-[10px] tracking-wide font-light uppercase">
                      {project.language}
                    </span>
                  )}
                  {project.stars > 0 && (
                    <span className="text-foreground/25 text-[10px] tracking-wide font-light">
                      {"*"} {project.stars}
                    </span>
                  )}
                </div>

                <h3 className="text-xl md:text-2xl font-light text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors duration-500">
                  <span className="instrument italic">{project.title}</span>
                </h3>

                <p className="text-sm font-light text-foreground/40 leading-relaxed max-w-lg mb-4">
                  {project.description}
                </p>

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

              {/* Right: code preview */}
              <div className="md:w-[280px] lg:w-[340px] shrink-0 rounded-md bg-background/80 border border-foreground/5 p-4 overflow-hidden">
                <div className="font-mono text-[11px] leading-relaxed">
                  {codeLines.map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-foreground/15 select-none w-5 text-right mr-3 shrink-0">
                        {line.trim() ? i + 1 : ""}
                      </span>
                      <span className="text-foreground/35 whitespace-pre overflow-hidden text-ellipsis">
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
                  <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <span className="text-foreground/25 text-[10px] tracking-[0.2em] uppercase font-light">
                        Quick summary
                      </span>
                      <p className="text-sm font-light text-foreground/50 leading-relaxed max-w-lg">
                        {project.description}
                        {project.language ? ` Built primarily with ${project.language}.` : ""}
                        {project.tags.length > 0 ? ` Explores ${project.tags.slice(0, 2).join(", ")}.` : ""}
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
        <div className="flex flex-col gap-6 md:gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
