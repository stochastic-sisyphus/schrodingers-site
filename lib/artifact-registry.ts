/**
 * Unified artifact registry
 * Normalizes repos, papers, and posts into a single searchable artifact type
 */

import type { GitHubRepo, ResearchPaper, BlogPost } from './types';

export type ArtifactCategory = 'project' | 'research' | 'writing';

export interface Artifact {
  id: string;
  title: string;
  category: ArtifactCategory;
  year: number;
  tags: string[];
  description: string;
  embedUrl?: string;
  externalUrl?: string;
  thumbnailHint: string; // Language color key or type indicator
  authors?: string[];
  journal?: string;
  doi?: string;
  language?: string;
  stars?: number;
}

/**
 * Transform GitHub repo into artifact
 */
function repoToArtifact(repo: GitHubRepo): Artifact {
  const year = new Date(repo.created_at).getFullYear();
  const tags = repo.topics && repo.topics.length > 0
    ? repo.topics.slice(0, 5)
    : repo.language
      ? [repo.language]
      : [];

  return {
    id: `repo-${repo.id}`,
    title: formatRepoName(repo.name),
    category: 'project',
    year,
    tags,
    description: repo.description || 'A computational project.',
    externalUrl: repo.html_url,
    thumbnailHint: repo.language || 'code',
    language: repo.language || undefined,
    stars: repo.stargazers_count,
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

  // Determine embed URL for special cases
  let embedUrl: string | undefined;
  if (paper.id === 'verification-reversal-viz') {
    embedUrl = '/verification-reversal.html';
  } else if (paper.doi === '10.5281/zenodo.18159898') {
    embedUrl = '/research/verification-reversal';
  }

  return {
    id: paper.id,
    title: paper.title,
    category: 'research',
    year: paper.year,
    tags,
    description: paper.description || paper.abstract || paper.journal || 'Research publication',
    embedUrl,
    externalUrl: paper.githubUrl || (paper.doi ? `https://doi.org/${paper.doi}` : paper.orcidUrl),
    thumbnailHint: paper.type || 'research',
    authors: paper.authors,
    journal: paper.journal,
    doi: paper.doi,
  };
}

/**
 * Transform blog post into artifact
 */
function postToArtifact(post: BlogPost): Artifact {
  const year = post.date instanceof Date ? post.date.getFullYear() : new Date(post.date).getFullYear();

  return {
    id: `post-${post.slug}`,
    title: post.title,
    category: 'writing',
    year,
    tags: post.tags?.length ? post.tags : ['substack', 'writing'],
    description: post.excerpt || 'A written piece.',
    externalUrl: post.substackUrl,
    thumbnailHint: 'writing',
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
  posts: BlogPost[]
): Artifact[] {
  const artifacts: Artifact[] = [];

  // Add repos (limit to featured/recent)
  artifacts.push(...repos.slice(0, 10).map(repoToArtifact));

  // Add research papers
  artifacts.push(...papers.map(paperToArtifact));

  // Add blog posts (limit to recent)
  artifacts.push(...posts.slice(0, 6).map(postToArtifact));

  // Sort by year (newest first), then by category priority
  const categoryOrder: Record<ArtifactCategory, number> = {
    research: 1,
    project: 2,
    writing: 3,
  };

  return artifacts.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return categoryOrder[a.category] - categoryOrder[b.category];
  });
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
