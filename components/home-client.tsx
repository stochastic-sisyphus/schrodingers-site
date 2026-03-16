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
import type { Artifact } from "@/lib/artifact-registry"
import { buildArtifactRegistry } from "@/lib/artifact-registry"
import { getDisplayProjectRepos, getDisplayResearchEntries } from "@/lib/content-aggregator"
import { fetchAllRepos } from "@/lib/github"
import type { LocalArtifactMetadata } from "@/lib/local-artifacts"
import { fetchAllResearchData } from "@/lib/orcid"
import { fetchAllSubstackPosts, getRecentPosts } from "@/lib/substack"
import type { BlogPost, GitHubRepo, ResearchPaper } from "@/lib/types"

interface HomeClientProps {
  localArtifacts: LocalArtifactMetadata[]
}

export default function HomeClient({ localArtifacts }: HomeClientProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [substackPosts, setSubstackPosts] = useState<BlogPost[]>([])
  const [researchEntries, setResearchEntries] = useState<ResearchPaper[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])

  useEffect(() => {
    async function loadData() {
      const fetchedRepos = await fetchAllRepos()
      setRepos(getDisplayProjectRepos(fetchedRepos))

      try {
        const allPosts = await fetchAllSubstackPosts()
        setSubstackPosts(getRecentPosts(allPosts, 4))

        const { papers } = await fetchAllResearchData()
        setResearchEntries(getDisplayResearchEntries(papers, fetchedRepos, localArtifacts))
        setArtifacts(buildArtifactRegistry(fetchedRepos, papers, allPosts, localArtifacts))
      } catch (error) {
        console.error("Failed to load site content:", error)

        const { papers } = await fetchAllResearchData()
        setResearchEntries(getDisplayResearchEntries(papers, fetchedRepos, localArtifacts))
        setArtifacts(buildArtifactRegistry(fetchedRepos, papers, [], localArtifacts))
      }
    }

    loadData()
  }, [localArtifacts])

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
