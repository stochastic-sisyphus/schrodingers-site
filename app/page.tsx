"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"
import Marquee from "@/components/marquee"
import ProjectShowcase from "@/components/project-showcase"
import ResearchSection from "@/components/research-section"
import ThoughtsSection from "@/components/thoughts-section"
import ConnectSection from "@/components/connect-section"
import { fetchAllSubstackPosts, getRecentPosts } from "@/lib/substack"
import { fetchAllRepos } from "@/lib/github"
import { fetchAllResearchData, getKeyPapers } from "@/lib/orcid"
import { getFeaturedProjects } from "@/lib/content-aggregator"
import type { GitHubRepo, ResearchPaper, BlogPost } from "@/lib/types"

export default function Home() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [substackPosts, setSubstackPosts] = useState<BlogPost[]>([])
  const [researchEntries, setResearchEntries] = useState<ResearchPaper[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all sources in parallel
        const [fetchedRepos, allPosts, researchData] = await Promise.all([
          fetchAllRepos().catch(() => [] as GitHubRepo[]),
          fetchAllSubstackPosts().catch(() => [] as BlogPost[]),
          fetchAllResearchData().catch(() => ({ profile: null, papers: [] as ResearchPaper[] })),
        ])

        // Sort repos by featured order
        const featuredProjects = getFeaturedProjects(fetchedRepos)
        const orderedRepos = featuredProjects.map((fp) => fp.repo)
        setRepos(orderedRepos)

        // Set substack posts
        setSubstackPosts(getRecentPosts(allPosts, 6))

        // Build research entries
        const featuredPapers = getKeyPapers(researchData.papers, 4)
        const propheticRepo = fetchedRepos.find(
          (r) => r.name === "prophetic-emergentomics"
        )

        const entries: ResearchPaper[] = [
          {
            id: "verification-reversal-viz",
            title: "Verification Reversal (Interactive)",
            authors: ["Vanessa Beck"],
            year: 2026,
            journal: "Interactive Visualization",
            type: "visualization",
            description:
              "Interactive p5.js visualization of information cascade dynamics",
            githubUrl: "/verification-reversal.html",
          },
          ...featuredPapers,
          ...(propheticRepo
            ? [
                {
                  id: `repo-${propheticRepo.id}`,
                  title: propheticRepo.name,
                  description: propheticRepo.description || "",
                  authors: [] as string[],
                  year: new Date(propheticRepo.created_at).getFullYear(),
                  type: "repository",
                  githubUrl: propheticRepo.html_url,
                },
              ]
            : []),
          {
            id: "self",
            title: "self (Interactive Graph)",
            authors: ["Vanessa Beck"],
            year: 2026,
            journal: "Interactive Visualization",
            type: "visualization",
            description: "Self-directed graph visualization",
            githubUrl: "https://github.com/stochastic-sisyphus/self",
          },
        ]

        setResearchEntries(entries)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()
  }, [])

  return (
    <div className="bg-background">
      {/* Hero with shader background */}
      <ShaderBackground>
        <Header />
        <HeroContent />
      </ShaderBackground>

      {/* Scrolling marquee divider */}
      <Marquee />

      {/* Project showcase with real GitHub data */}
      <ProjectShowcase repos={repos} />

      {/* Research publications from ORCID + related repos */}
      <ResearchSection papers={researchEntries} />

      {/* Thoughts / Writing */}
      <ThoughtsSection posts={substackPosts} />

      {/* Marquee divider again */}
      <Marquee />

      {/* Connect / Footer */}
      <ConnectSection />
    </div>
  )
}
