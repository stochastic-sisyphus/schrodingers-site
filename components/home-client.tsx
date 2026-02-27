"use client"

import dynamic from "next/dynamic"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"

const ShaderBackground = dynamic(() => import("@/components/shader-background"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black relative overflow-hidden" />,
})
import Marquee from "@/components/marquee"
import ProjectShowcase from "@/components/project-showcase"
import ResearchSection from "@/components/research-section"
import ThoughtsSection from "@/components/thoughts-section"
import ConnectSection from "@/components/connect-section"
import type { GitHubRepo, ResearchPaper } from "@/lib/types"

interface SerializedBlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content?: string
  tags: string[]
  substackUrl?: string
  featured?: boolean
}

interface HomeClientProps {
  repos: GitHubRepo[]
  researchEntries: ResearchPaper[]
  substackPosts: SerializedBlogPost[]
}

export default function HomeClient({
  repos,
  researchEntries,
  substackPosts,
}: HomeClientProps) {
  // Rehydrate dates
  const posts = substackPosts.map((p) => ({
    ...p,
    date: new Date(p.date),
  }))

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
      <ThoughtsSection posts={posts} />

      {/* Marquee divider again */}
      <Marquee />

      {/* Connect / Footer */}
      <ConnectSection />
    </div>
  )
}
