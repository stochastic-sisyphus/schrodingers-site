import HomeClient from "@/components/home-client"
import { fetchAllRepos } from "@/lib/github"
import { loadLocalArtifacts } from "@/lib/local-artifacts"
import { fetchAllSubstackPosts, getRecentPosts } from "@/lib/substack"

export default async function Home() {
  const initialRepos = await fetchAllRepos().catch(() => [])
  const localArtifacts = await loadLocalArtifacts()
  const substackPosts = await fetchAllSubstackPosts().catch(() => [])
  const initialPosts = getRecentPosts(substackPosts, 4).map((post) => ({
    ...post,
    date: post.date.toISOString(),
  }))

  return (
    <HomeClient
      initialRepos={initialRepos}
      localArtifacts={localArtifacts}
      initialPosts={initialPosts}
    />
  )
}
