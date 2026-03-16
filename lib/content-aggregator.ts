/**
 * Content aggregation orchestrator
 * Fetches and caches data from all sources
 */

import {
  compareReposForDisplay,
  fetchAllRepos,
  getRepoCategory,
  getRepoDisplayTopics,
  getRepoPriority,
  isRepoHidden,
  isRepoPinned,
} from './github';
import { fetchAllResearchData } from './orcid';
import { fetchAllSubstackPosts, getRecentPosts } from './substack';
import type { GitHubRepo, ResearchPaper, BlogPost, FeaturedProject } from './types';
import type { LocalArtifactMetadata } from './local-artifacts';
import { compareRankableItems } from './display-ranking';

function formatRepoTitle(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Aggregate all data from external sources
 */
export async function aggregateAllData() {
  console.log('Fetching data from all sources...');

  const [repos, research, blogPosts] = await Promise.all([
    fetchAllRepos().catch(err => {
      console.error('GitHub fetch failed:', err);
      return [];
    }),
    fetchAllResearchData().catch(err => {
      console.error('ORCID fetch failed:', err);
      return { profile: null, papers: [] };
    }),
    fetchAllSubstackPosts().catch(err => {
      console.error('Substack fetch failed:', err);
      return [];
    }),
  ]);

  console.log(`Fetched ${repos.length} repos, ${research.papers.length} papers, ${blogPosts.length} posts`);

  return {
    repos,
    research,
    blogPosts,
  };
}

/**
 * Get display-ranked projects with metadata.
 */
export function getFeaturedProjects(repos: GitHubRepo[]): FeaturedProject[] {
  return [...repos]
    .filter((repo) => !isRepoHidden(repo) && getRepoCategory(repo) === 'project')
    .sort(compareReposForDisplay)
    .map((repo, index) => ({
    repo,
    featured: isRepoPinned(repo),
    order: index,
    highlights: generateProjectHighlights(repo),
  }));
}

/**
 * Generate highlight points for a project
 */
function generateProjectHighlights(repo: GitHubRepo): string[] {
  const highlights: string[] = [];

  if (repo.stargazers_count > 5) {
    highlights.push(`${repo.stargazers_count} stars`);
  }

  if (repo.language) {
    highlights.push(repo.language);
  }

  const displayTopics = getRepoDisplayTopics(repo);
  if (displayTopics.length > 0) {
    highlights.push(...displayTopics.slice(0, 3));
  }

  return highlights;
}

export function getDisplayProjectRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos]
    .filter((repo) => !isRepoHidden(repo) && getRepoCategory(repo) === 'project')
    .sort(compareReposForDisplay);
}

function localArtifactToResearchPaper(artifact: LocalArtifactMetadata): ResearchPaper {
  const year = new Date(artifact.displayDate).getUTCFullYear();

  return {
    id: artifact.id,
    title: artifact.title,
    authors: artifact.authors || [],
    year: Number.isNaN(year) ? new Date().getUTCFullYear() : year,
    journal: artifact.journal,
    doi: artifact.doi,
    type: artifact.kind || 'publication',
    description: artifact.description,
    embedUrl: artifact.embedUrl,
    externalUrl: artifact.externalUrl || artifact.detailUrl,
    detailUrl: artifact.detailUrl,
    source: 'local',
    sortDate: artifact.displayDate,
    pinned: artifact.pinned,
    priority: artifact.priority,
  };
}

function repoToResearchPaper(repo: GitHubRepo): ResearchPaper {
  const createdYear = new Date(repo.created_at).getUTCFullYear();

  return {
    id: `repo-${repo.id}`,
    title: formatRepoTitle(repo.name),
    authors: [],
    year: Number.isNaN(createdYear) ? new Date().getUTCFullYear() : createdYear,
    type: 'repository',
    githubUrl: repo.html_url,
    externalUrl: repo.html_url,
    description: repo.description || 'Repository',
    source: 'github',
    sortDate: repo.pushed_at || repo.updated_at,
    pinned: isRepoPinned(repo),
    priority: getRepoPriority(repo),
  };
}

function compareResearchEntries(a: ResearchPaper, b: ResearchPaper): number {
  return compareRankableItems(
    {
      title: a.title,
      pinned: a.pinned,
      priority: a.priority,
      sortDate: a.sortDate || `${a.year}-01-01`,
    },
    {
      title: b.title,
      pinned: b.pinned,
      priority: b.priority,
      sortDate: b.sortDate || `${b.year}-01-01`,
    }
  );
}

export function getDisplayResearchEntries(
  papers: ResearchPaper[],
  repos: GitHubRepo[],
  localArtifacts: LocalArtifactMetadata[]
): ResearchPaper[] {
  const localResearch = localArtifacts
    .filter((artifact) => artifact.category === 'research' && !artifact.hidden)
    .map(localArtifactToResearchPaper);

  const repoResearch = repos
    .filter((repo) => !isRepoHidden(repo) && getRepoCategory(repo) === 'research')
    .map(repoToResearchPaper);

  const orcidResearch = papers.map((paper) => ({
    ...paper,
    source: paper.source || 'orcid',
    sortDate: paper.sortDate || `${paper.year || 0}-01-01`,
    pinned: paper.pinned || false,
    priority: paper.priority || 0,
  }));

  return [...localResearch, ...repoResearch, ...orcidResearch].sort(compareResearchEntries);
}

/**
 * Cache data to public directory
 */
export async function cacheDataToPublic(data: {
  repos: GitHubRepo[];
  research: { profile: any; papers: ResearchPaper[] };
  blogPosts: BlogPost[];
}) {
  // This function would write JSON files to public/data/
  // For now, return the data for use in Next.js pages

  return {
    repos: data.repos,
    featuredProjects: getFeaturedProjects(data.repos),
    researchProfile: data.research.profile,
    researchPapers: data.research.papers,
    keyPapers: data.research.papers.slice(0, 3),
    blogPosts: data.blogPosts,
    recentPosts: getRecentPosts(data.blogPosts, 3),
  };
}

/**
 * Main data fetching function for Next.js pages
 */
export async function getAggregatedContent() {
  const data = await aggregateAllData();
  return cacheDataToPublic(data);
}
