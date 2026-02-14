"use client"

import { useEffect, useState } from "react"
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

export default function Home() {
  const [repos, setRepos] = useState([])
  const [substackPosts, setSubstackPosts] = useState([])
  const [researchEntries, setResearchEntries] = useState([])

  useEffect(() => {
    async function loadData() {
      // Fetch GitHub repos
      const fetchedRepos = await fetchAllRepos()
      setRepos(fetchedRepos)

      // Fetch Substack posts
      try {
        const allPosts = await fetchAllSubstackPosts()
        setSubstackPosts(getRecentPosts(allPosts, 4))
      } catch (error) {
        console.error("Failed to fetch Substack posts:", error)
      }

      // Fetch research papers from ORCID
      const { papers } = await fetchAllResearchData()
      const featuredPapers = getKeyPapers(papers, 4)

      // Find prophetic-emergentomics repo
      const propheticRepo = fetchedRepos.find(r => r.name === 'prophetic-emergentomics')

      // Build research entries - verification-reversal featured first
      const entries = []

      // Add verification-reversal visualization FIRST (top featured)
      entries.push({
        id: 'verification-reversal-viz',
        title: 'Verification Reversal (Interactive)',
        authors: ['Vanessa Beck'],
        year: 2026,
        journal: 'Interactive Visualization',
        type: 'visualization',
        description: 'Interactive p5.js visualization of information cascade dynamics',
        githubUrl: '/verification-reversal.html',
      })

      // Add ORCID papers
      entries.push(...featuredPapers)

      // Add prophetic-emergentomics repo
      if (propheticRepo) {
        entries.push({
          id: `repo-${propheticRepo.id}`,
          title: propheticRepo.name,
          description: propheticRepo.description || '',
          authors: [],
          year: new Date(propheticRepo.created_at).getFullYear(),
          type: 'repository',
          githubUrl: propheticRepo.html_url,
        })
      }

      // Add self graph
      entries.push({
        id: 'self',
        title: 'self (Interactive Graph)',
        authors: ['Vanessa Beck'],
        year: 2026,
        journal: 'Interactive Visualization',
        type: 'visualization',
        description: 'Self-directed graph visualization',
        githubUrl: 'https://github.com/stochastic-sisyphus/self',
      })

      setResearchEntries(entries)
    }

    loadData()
  }, [])

  return (
    <div className="bg-background">
      {/* Hero with shader background */}
      <ShaderBackground>
        <Header />
        <HeroContent />
        {/* <PulsingCircle /> */}
      </ShaderBackground>

      {/* Scrolling marquee divider */}
      <Marquee />

      {/* Project showcase with real GitHub data */}
      <FigmaShowcase repos={repos} />

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
