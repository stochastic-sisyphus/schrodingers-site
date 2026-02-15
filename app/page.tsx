import { fetchAllRepos } from "@/lib/github"
import { fetchAllResearchData, getKeyPapers } from "@/lib/orcid"
import { fetchAllSubstackPosts, getRecentPosts } from "@/lib/substack"
import { getFeaturedProjects } from "@/lib/content-aggregator"
import type { GitHubRepo, ResearchPaper, BlogPost } from "@/lib/types"
import HomeClient from "@/components/home-client"

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

  // Build research entries -- deduplicate verification reversal
  const featuredPapers = getKeyPapers(researchData.papers, 4)
  const propheticRepo = fetchedRepos.find(
    (r) => r.name === "prophetic-emergentomics"
  )

  // Filter out the ORCID version of verification reversal since we have
  // a merged entry with the interactive viz + paper DOI
  const filteredPapers = featuredPapers.filter(
    (p) => !p.title.toLowerCase().includes("verification reversal")
  )

  // Find the ORCID paper to pull DOI from it
  const vrPaper = featuredPapers.find((p) =>
    p.title.toLowerCase().includes("verification reversal")
  )

  const researchEntries: ResearchPaper[] = [
    // Merged verification reversal: paper + interactive viz in one card
    {
      id: "verification-reversal",
      title:
        vrPaper?.title ||
        "Verification Reversal: Cascades and Synthetic Productivity in an AI-Mediated Economy",
      authors: vrPaper?.authors || ["Vanessa Beck"],
      year: vrPaper?.year || 2026,
      journal: vrPaper?.journal || "Preprint",
      doi: vrPaper?.doi || "10.5281/zenodo.18159898",
      type: "visualization",
      description: vrPaper?.description || "",
      abstract: vrPaper?.abstract,
      orcidUrl: vrPaper?.orcidUrl,
      githubUrl: "/verification-reversal.html",
    },
    ...filteredPapers,
    ...(propheticRepo
      ? [
          {
            id: `repo-${propheticRepo.id}`,
            title: "Prophetic Emergentomics",
            description: propheticRepo.description || "",
            authors: [] as string[],
            year: new Date(propheticRepo.created_at).getUTCFullYear(),
            type: "repository",
            githubUrl: propheticRepo.html_url,
          },
        ]
      : []),
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
