import { fetchAllRepos } from "@/lib/github"
import { fetchAllResearchData, getKeyPapers } from "@/lib/orcid"
import { fetchAllSubstackPosts, getRecentPosts } from "@/lib/substack"
import { getFeaturedProjects } from "@/lib/content-aggregator"
import type { GitHubRepo, ResearchPaper, BlogPost } from "@/lib/types"
import HomeClient from "@/components/home-client"

export const revalidate = 3600 // revalidate every hour

export default async function Home() {
  // Fetch all data server-side in parallel
  const [fetchedRepos, allPosts, researchData] = await Promise.all([
    fetchAllRepos().catch(() => [] as GitHubRepo[]),
    fetchAllSubstackPosts().catch(() => [] as BlogPost[]),
    fetchAllResearchData().catch(() => ({
      profile: null,
      papers: [] as ResearchPaper[],
    })),
  ])

  // Sort repos by featured order
  const featuredProjects = getFeaturedProjects(fetchedRepos)
  const orderedRepos = featuredProjects.map((fp) => fp.repo)

  // Get substack posts
  const substackPosts = getRecentPosts(allPosts, 6)

  // Build research entries
  const featuredPapers = getKeyPapers(researchData.papers, 4)
  const propheticRepo = fetchedRepos.find(
    (r) => r.name === "prophetic-emergentomics"
  )

  const researchEntries: ResearchPaper[] = [
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

  // Serialize dates for client component (Date objects can't cross the RSC boundary)
  const serializedPosts = substackPosts.map((p) => ({
    ...p,
    date: p.date instanceof Date ? p.date.toISOString() : String(p.date),
  }))

  return (
    <HomeClient
      repos={orderedRepos}
      researchEntries={researchEntries}
      substackPosts={serializedPosts}
    />
  )
}
