import { promises as fs } from "node:fs"
import type { Dirent } from "node:fs"
import path from "node:path"

import type { ArtifactCategory } from "./artifact-registry"

export interface LocalArtifactMetadata {
  id: string;
  title: string;
  category: ArtifactCategory;
  description: string;
  displayDate: string;
  kind?: string;
  tags?: string[];
  authors?: string[];
  journal?: string;
  doi?: string;
  embedUrl?: string;
  detailUrl?: string;
  externalUrl?: string;
  thumbnailHint?: string;
  priority?: number;
  pinned?: boolean;
  hidden?: boolean;
}

const ARTIFACTS_ROOT = path.join(process.cwd(), "content", "artifacts");

function isArtifactCategory(value: string): value is ArtifactCategory {
  return value === "project" || value === "research" || value === "writing";
}

function normalizeArtifactMetadata(
  raw: Record<string, unknown>,
  fallbackId: string
): LocalArtifactMetadata | null {
  const {
    id,
    title,
    category,
    description,
    displayDate,
    kind,
    tags,
    authors,
    journal,
    doi,
    embedUrl,
    detailUrl,
    externalUrl,
    thumbnailHint,
    priority,
    pinned,
    hidden,
  } = raw;

  if (
    typeof title !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof displayDate !== "string" ||
    !isArtifactCategory(category)
  ) {
    return null;
  }

  return {
    id: typeof id === "string" ? id : fallbackId,
    title,
    category,
    description,
    displayDate,
    kind: typeof kind === "string" ? kind : undefined,
    tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : undefined,
    authors: Array.isArray(authors) ? authors.filter((author): author is string => typeof author === "string") : undefined,
    journal: typeof journal === "string" ? journal : undefined,
    doi: typeof doi === "string" ? doi : undefined,
    embedUrl: typeof embedUrl === "string" ? embedUrl : undefined,
    detailUrl: typeof detailUrl === "string" ? detailUrl : undefined,
    externalUrl: typeof externalUrl === "string" ? externalUrl : undefined,
    thumbnailHint: typeof thumbnailHint === "string" ? thumbnailHint : undefined,
    priority: typeof priority === "number" ? priority : undefined,
    pinned: typeof pinned === "boolean" ? pinned : undefined,
    hidden: typeof hidden === "boolean" ? hidden : undefined,
  };
}

async function readArtifactDirectories(root: string): Promise<LocalArtifactMetadata[]> {
  let entries: Dirent[];

  try {
    entries = await fs.readdir(root, { encoding: "utf8", withFileTypes: true });
  } catch {
    return [];
  }

  const artifacts = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const filePath = path.join(root, entry.name, "artifact.json");

        try {
          const content = await fs.readFile(filePath, "utf8");
          const parsed = JSON.parse(content) as Record<string, unknown>;
          return normalizeArtifactMetadata(parsed, entry.name);
        } catch {
          return null;
        }
      })
  );

  return artifacts.filter((artifact): artifact is LocalArtifactMetadata => artifact !== null);
}

export async function loadLocalArtifacts(): Promise<LocalArtifactMetadata[]> {
  const artifacts = await readArtifactDirectories(ARTIFACTS_ROOT);

  return artifacts
    .filter((artifact) => !artifact.hidden)
    .sort((a, b) => a.title.localeCompare(b.title));
}
