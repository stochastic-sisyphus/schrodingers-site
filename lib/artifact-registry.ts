/**
 * Unified artifact registry
 * Normalizes repos, papers, and posts into a single searchable artifact type
 */

import type { BlogPost, GitHubRepo, ResearchPaper } from './types';
import type { LocalArtifactMetadata } from './local-artifacts';
import {
  getRepoCategory,
  getRepoDisplayTopics,
  getRepoPriority,
  isRepoHidden,
  isRepoPinned,
} from './github';
import { compareRankableItems } from './display-ranking';

export type ArtifactCategory = 'project' | 'research' | 'writing';
export type ArtifactSource = 'github' | 'orcid' | 'substack' | 'local';

export interface Artifact {
  id: string;
  title: string;
  source: ArtifactSource;
  category: ArtifactCategory;
  year: number;
  sortDate: string;
  tags: string[];
  description: string;
  embedUrl?: string;
  externalUrl?: string;
  detailUrl?: string;
  thumbnailHint: string; // Language color key or type indicator
  authors?: string[];
  journal?: string;
  doi?: string;
  language?: string;
  stars?: number;
  pinned?: boolean;
  priority?: number;
}

/**
 * Transform GitHub repo into artifact
 */
function repoToArtifact(repo: GitHubRepo): Artifact {
  const year = new Date(repo.created_at).getFullYear();
  const tags = getRepoDisplayTopics(repo).length > 0
    ? getRepoDisplayTopics(repo).slice(0, 5)
    : repo.language
      ? [repo.language]
      : [];

  return {
    id: `repo-${repo.id}`,
    title: formatRepoName(repo.name),
    source: 'github',
    category: getRepoCategory(repo),
    year,
    sortDate: repo.pushed_at || repo.updated_at,
    tags,
    description: repo.description || 'A computational project.',
    externalUrl: repo.html_url,
    thumbnailHint: repo.language || 'code',
    language: repo.language || undefined,
    stars: repo.stargazers_count,
    pinned: isRepoPinned(repo),
    priority: getRepoPriority(repo),
  };
}

/**
 * Transform research paper into artifact
 */
function paperToArtifact(paper: ResearchPaper): Artifact {
  const tags: string[] = [];
  
  if (paper.type === 'repository') {
    tags.push('code', 'repository');
  } else {
    if (paper.journal) tags.push(paper.journal);
    if (paper.type && paper.type !== 'publication') tags.push(paper.type);
  }

  return {
    id: paper.id,
    title: paper.title,
    source: paper.source || 'orcid',
    category: 'research',
    year: paper.year,
    sortDate: paper.sortDate || `${paper.year || 0}-01-01`,
    tags,
    description: paper.description || paper.abstract || paper.journal || 'Research publication',
    embedUrl: paper.embedUrl,
    externalUrl: paper.externalUrl || paper.githubUrl || (paper.doi ? `https://doi.org/${paper.doi}` : paper.orcidUrl),
    detailUrl: paper.detailUrl,
    thumbnailHint: paper.type || 'research',
    authors: paper.authors,
    journal: paper.journal,
    doi: paper.doi,
    pinned: paper.pinned,
    priority: paper.priority,
  };
}

/**
 * Transform Substack post into artifact
 */
function postToArtifact(post: BlogPost): Artifact {
  const year = post.date.getFullYear();
  
  return {
    id: `post-${post.slug}`,
    title: post.title,
    source: 'substack',
    category: 'writing',
    year,
    sortDate: post.date.toISOString(),
    tags: ['substack', 'writing'],
    description: post.excerpt || 'A written piece.',
    externalUrl: post.substackUrl,
    thumbnailHint: 'writing',
    authors: ['Vanessa Beck'],
  };
}

function localArtifactToArtifact(artifact: LocalArtifactMetadata): Artifact {
  const year = new Date(artifact.displayDate).getUTCFullYear();

  return {
    id: artifact.id,
    title: artifact.title,
    source: 'local',
    category: artifact.category,
    year: Number.isNaN(year) ? new Date().getUTCFullYear() : year,
    sortDate: artifact.displayDate,
    tags: artifact.tags || [],
    description: artifact.description,
    embedUrl: artifact.embedUrl,
    externalUrl: artifact.externalUrl || artifact.detailUrl,
    detailUrl: artifact.detailUrl,
    thumbnailHint: artifact.thumbnailHint || artifact.kind || artifact.category,
    authors: artifact.authors,
    journal: artifact.journal,
    doi: artifact.doi,
    pinned: artifact.pinned,
    priority: artifact.priority,
  };
}

/**
 * Format repository name into human-readable title
 */
function formatRepoName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build unified artifact registry from all data sources
 */
export function buildArtifactRegistry(
  repos: GitHubRepo[],
  papers: ResearchPaper[],
  posts: BlogPost[],
  localArtifacts: LocalArtifactMetadata[] = []
): Artifact[] {
  const artifacts: Artifact[] = [];

  artifacts.push(...repos.filter((repo) => !isRepoHidden(repo)).map(repoToArtifact));

  artifacts.push(...papers.map(paperToArtifact));

  artifacts.push(...posts.map(postToArtifact));

  artifacts.push(...localArtifacts.filter((artifact) => !artifact.hidden).map(localArtifactToArtifact));

  const dedupedArtifacts = Array.from(
    new Map(artifacts.map((artifact) => [artifact.id, artifact])).values()
  );

  return dedupedArtifacts.sort((a, b) =>
    compareRankableItems(
      {
        title: a.title,
        pinned: a.pinned,
        priority: a.priority,
        sortDate: a.sortDate,
        stars: a.stars,
      },
      {
        title: b.title,
        pinned: b.pinned,
        priority: b.priority,
        sortDate: b.sortDate,
        stars: b.stars,
      }
    )
  );
}

/**
 * Language color mapping (reused from existing card components)
 */
export const LANG_COLORS: Record<string, string> = {
  Python: 'bg-blue-500/20 border-blue-500/30',
  TypeScript: 'bg-blue-400/20 border-blue-400/30',
  JavaScript: 'bg-yellow-500/20 border-yellow-500/30',
  Rust: 'bg-orange-500/20 border-orange-500/30',
  Go: 'bg-cyan-500/20 border-cyan-500/30',
  Ruby: 'bg-red-500/20 border-red-500/30',
  Java: 'bg-orange-600/20 border-orange-600/30',
  code: 'bg-foreground/5 border-foreground/10',
  research: 'bg-primary/10 border-primary/20',
  writing: 'bg-foreground/5 border-foreground/10',
  repository: 'bg-foreground/5 border-foreground/10',
  visualization: 'bg-primary/15 border-primary/25',
};
