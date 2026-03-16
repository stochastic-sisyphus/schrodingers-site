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
import { fetchAllRepos } from "@/lib/github"
import type { LocalArtifactMetadata } from "@/lib/local-artifacts"
import { fetchAllResearchData } from "@/lib/orcid"
import type { BlogPost, GitHubRepo, ResearchPaper } from "@/lib/types"

type SerializedBlogPost = Omit<BlogPost, "date"> & {
  date: string
}

interface HomeClientProps {
  localArtifacts: LocalArtifactMetadata[]
  initialPosts: SerializedBlogPost[]
}

export default function HomeClient({ localArtifacts, initialPosts }: HomeClientProps) {
  const hydratedPosts = useMemo<BlogPost[]>(
    () =>
      initialPosts.map((post) => ({
        ...post,
        date: new Date(post.date),
      })),
    [initialPosts]
  )
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [substackPosts] = useState<BlogPost[]>(hydratedPosts)
  const [researchEntries, setResearchEntries] = useState<ResearchPaper[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>(
    buildArtifactRegistry([], [], hydratedPosts, localArtifacts)
  )

  useEffect(() => {
    async function loadData() {
      const fetchedRepos = await fetchAllRepos()
      setRepos(getDisplayProjectRepos(fetchedRepos))

      try {
        const { papers } = await fetchAllResearchData()
        setResearchEntries(getDisplayResearchEntries(papers, fetchedRepos, localArtifacts))
        setArtifacts(buildArtifactRegistry(fetchedRepos, papers, hydratedPosts, localArtifacts))
      } catch (error) {
        console.error("Failed to load site content:", error)

        const { papers } = await fetchAllResearchData()
        setResearchEntries(getDisplayResearchEntries(papers, fetchedRepos, localArtifacts))
        setArtifacts(buildArtifactRegistry(fetchedRepos, papers, hydratedPosts, localArtifacts))
      }
    }

    loadData()
  }, [hydratedPosts, localArtifacts])

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
