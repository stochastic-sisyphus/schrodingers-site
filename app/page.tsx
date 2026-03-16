import HomeClient from "@/components/home-client"
import { loadLocalArtifacts } from "@/lib/local-artifacts"

export default async function Home() {
  const localArtifacts = await loadLocalArtifacts()

  return <HomeClient localArtifacts={localArtifacts} />
}
