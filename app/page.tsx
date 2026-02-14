import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import PulsingCircle from "@/components/pulsing-circle"
import ShaderBackground from "@/components/shader-background"
import Marquee from "@/components/marquee"
import FigmaShowcase from "@/components/figma-showcase"
import ResearchSection from "@/components/research-section"
import ThoughtsSection from "@/components/thoughts-section"
import ConnectSection from "@/components/connect-section"
import { fetchAllSubstackPosts, getRecentPosts } from "@/lib/substack"
import { fetchAllRepos } from "@/lib/github"
import { fetchAllResearchData, getKeyPapers } from "@/lib/orcid"

export default async function Home() {
  // Fetch GitHub repos, Substack posts, and ORCID research data (server-side)
  const repos = await fetchAllRepos()

  let substackPosts = []
  try {
    const allPosts = await fetchAllSubstackPosts()
    substackPosts = getRecentPosts(allPosts, 4) // Get 4 most recent posts
  } catch (error) {
    console.error("Failed to fetch Substack posts:", error)
    // Continue rendering with empty array - component will show placeholder
  }

  // Fetch research papers from ORCID
  const { papers } = await fetchAllResearchData()
  const featuredPapers = getKeyPapers(papers, 4) // Get top 4 most recent papers

  return (
    <div className="bg-background">
      {/* Hero with shader background */}
      <ShaderBackground>
        <Header />
        <HeroContent />
        <PulsingCircle />
      </ShaderBackground>

      {/* Scrolling marquee divider */}
      <Marquee />

      {/* Project showcase with real GitHub data */}
      <FigmaShowcase repos={repos} />

      {/* Research publications from ORCID */}
      <ResearchSection papers={featuredPapers} />

      {/* Thoughts / Writing */}
      <ThoughtsSection posts={substackPosts} />

      {/* Marquee divider again */}
      <Marquee />

      {/* Connect / Footer */}
      <ConnectSection />
    </div>
  )
}
