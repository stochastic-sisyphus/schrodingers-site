"use client"

import { useEffect, useMemo, useState } from "react"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"
import Marquee from "@/components/marquee"
import ProjectShowcase from "@/components/project-showcase"
import ResearchSection from "@/components/research-section"
import ThoughtsSection from "@/components/thoughts-section"
import ConnectSection from "@/components/connect-section"
import type { Artifact } from "@/lib/artifact-registry"
import { buildArtifactRegistry } from "@/lib/artifact-registry"
import { getDisplayProjectRepos, getDisplayResearchEntries } from "@/lib/content-aggregator"
import type { LocalArtifactMetadata } from "@/lib/local-artifacts"
import { fetchAllResearchData } from "@/lib/orcid"
import type { BlogPost, GitHubRepo, ResearchPaper } from "@/lib/types"

type SerializedBlogPost = Omit<BlogPost, "date"> & {
  date: string
}

interface HomeClientProps {
  initialRepos: GitHubRepo[]
  localArtifacts: LocalArtifactMetadata[]
  initialPosts: SerializedBlogPost[]
}

export default function HomeClient({ initialRepos, localArtifacts, initialPosts }: HomeClientProps) {
  const hydratedPosts = useMemo<BlogPost[]>(
    () =>
      initialPosts.map((post) => ({
        ...post,
        date: new Date(post.date),
      })),
    [initialPosts]
  )
  const displayRepos = useMemo(
    () => getDisplayProjectRepos(initialRepos),
    [initialRepos]
  )
  const [repos] = useState<GitHubRepo[]>(displayRepos)
  const [substackPosts] = useState<BlogPost[]>(hydratedPosts)
  const [researchEntries, setResearchEntries] = useState<ResearchPaper[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>(
    buildArtifactRegistry(initialRepos, [], hydratedPosts, localArtifacts)
  )

  useEffect(() => {
    async function loadData() {
      try {
        const { papers } = await fetchAllResearchData()
        setResearchEntries(getDisplayResearchEntries(papers, initialRepos, localArtifacts))
        setArtifacts(buildArtifactRegistry(initialRepos, papers, hydratedPosts, localArtifacts))
      } catch (error) {
        console.error("Failed to load site content:", error)

        const { papers } = await fetchAllResearchData()
        setResearchEntries(getDisplayResearchEntries(papers, initialRepos, localArtifacts))
        setArtifacts(buildArtifactRegistry(initialRepos, papers, hydratedPosts, localArtifacts))
      }
    }

    loadData()
  }, [hydratedPosts, initialRepos, localArtifacts])

  return (
    <div className="bg-background">
      {/* Hero with shader background */}
      <ShaderBackground>
        <Header artifacts={artifacts} />
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
