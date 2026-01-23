/**
 * Content aggregation orchestrator
 * Fetches and caches data from all sources
 */

import { fetchAllRepos, getFeaturedRepos } from './github';
import { fetchAllResearchData, getKeyPapers } from './orcid';
import { fetchAllSubstackPosts, getRecentPosts } from './substack';
import type { GitHubRepo, ResearchPaper, BlogPost, FeaturedProject } from './types';

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
 * Get featured projects with metadata
 */
export function getFeaturedProjects(repos: GitHubRepo[]): FeaturedProject[] {
  const featured = getFeaturedRepos(repos);

  const featuredOrder = [
    'prophetic-emergentomics',
    'code-cartographer',
    'synsearch',
    'Masters-Capstone-Bosch-Metadata-LLM',
  ];

  return featured.map(repo => ({
    repo,
    featured: true,
    order: featuredOrder.indexOf(repo.name) !== -1
      ? featuredOrder.indexOf(repo.name)
      : 999,
    highlights: generateProjectHighlights(repo),
  })).sort((a, b) => a.order - b.order);
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

  if (repo.topics && repo.topics.length > 0) {
    highlights.push(...repo.topics.slice(0, 3));
  }

  return highlights;
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
  // For now, return the data for use in Astro pages

  return {
    repos: data.repos,
    featuredProjects: getFeaturedProjects(data.repos),
    researchProfile: data.research.profile,
    researchPapers: data.research.papers,
    keyPapers: getKeyPapers(data.research.papers, 3),
    blogPosts: data.blogPosts,
    recentPosts: getRecentPosts(data.blogPosts, 3),
  };
}

/**
 * Main data fetching function for Astro pages
 */
export async function getAggregatedContent() {
  const data = await aggregateAllData();
  return cacheDataToPublic(data);
}
