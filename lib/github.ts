/**
 * GitHub API utilities for fetching repository data
 */

import type { GitHubRepo, RepoDetails, FileNode, CommitData, Contributor } from './types';
import { compareRankableItems } from './display-ranking';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'stochastic-sisyphus';

/**
 * Get headers for GitHub API requests
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'stochastic-sisyphus-site',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  return headers;
}

function getRepoTopics(repo: GitHubRepo): string[] {
  return Array.isArray(repo.topics) ? repo.topics : [];
}

async function fetchPinnedRepoNamesFromProfile(username: string): Promise<Set<string>> {
  if (typeof window !== 'undefined') {
    return new Set();
  }

  try {
    const response = await fetch(`https://github.com/${username}`, {
      headers: {
        'User-Agent': 'stochastic-sisyphus-site',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return new Set();

    const html = await response.text();
    const pinnedSectionMatch = html.match(/js-pinned-items-reorder-list[\s\S]*?<\/ol>/i);
    const pinnedSection = pinnedSectionMatch ? pinnedSectionMatch[0] : html;
    const repoMatches = pinnedSection.matchAll(new RegExp(`href="/${username}/([^"/?#]+)"`, 'g'));

    return new Set(
      Array.from(repoMatches, (match) => decodeURIComponent(match[1]))
    );
  } catch (error) {
    console.error('Error fetching pinned GitHub repos from profile:', error);
    return new Set();
  }
}

export function hasRepoTopic(repo: GitHubRepo, topic: string): boolean {
  return getRepoTopics(repo).includes(topic);
}

export function isRepoHidden(repo: GitHubRepo): boolean {
  return hasRepoTopic(repo, 'site-hide');
}

export function isRepoPinned(repo: GitHubRepo): boolean {
  return Boolean(repo.pinned) || hasRepoTopic(repo, 'site-pin');
}

export function getRepoPriority(repo: GitHubRepo): number {
  const priorityTopic = getRepoTopics(repo).find((topic) => /^site-priority-\d+$/.test(topic));

  if (!priorityTopic) return 0;

  const parsed = parseInt(priorityTopic.replace('site-priority-', ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getRepoCategory(repo: GitHubRepo): 'project' | 'research' {
  return hasRepoTopic(repo, 'site-research') ? 'research' : 'project';
}

export function getRepoDisplayTopics(repo: GitHubRepo): string[] {
  return getRepoTopics(repo).filter((topic) => !topic.startsWith('site-'));
}

export function compareReposForDisplay(a: GitHubRepo, b: GitHubRepo): number {
  return compareRankableItems(
    {
      title: a.name,
      pinned: isRepoPinned(a),
      priority: getRepoPriority(a),
      sortDate: a.pushed_at || a.updated_at,
      stars: a.stargazers_count,
    },
    {
      title: b.name,
      pinned: isRepoPinned(b),
      priority: getRepoPriority(b),
      sortDate: b.pushed_at || b.updated_at,
      stars: b.stargazers_count,
    }
  );
}

/**
 * Intelligent repository filtering
 * Excludes: forks, archived repos, disabled repos, very small repos, old unmaintained repos
 * Pinned repos bypass quality filters.
 */
function shouldIncludeRepo(repo: GitHubRepo): boolean {
  if (isRepoHidden(repo)) return false;

  if (isRepoPinned(repo)) return true;

  // Exclude forks
  if (repo.fork) return false;

  // Exclude specific repos by name
  const excludedRepos = ['past-portfolio-old-very-old-geriatric-even'];
  if (excludedRepos.includes(repo.name)) return false;

  // Exclude archived or disabled repos
  if (repo.archived || repo.disabled) return false;

  // Exclude very small repos (likely test/placeholder repos)
  if (repo.size < 10) return false;

  // Exclude repos without descriptions
  if (!repo.description || repo.description.trim() === '') return false;

  // Check if repo is too old and unmaintained
  const lastUpdate = new Date(repo.updated_at);
  const monthsSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  // If not updated in 24 months and has very few stars, likely not worth showing
  if (monthsSinceUpdate > 24 && repo.stargazers_count < 2) {
    return false;
  }

  return true;
}

/**
 * Fetch all repositories for a user, intelligently filtered
 */
export async function fetchAllRepos(username: string = GITHUB_USERNAME): Promise<GitHubRepo[]> {
  try {
    const [response, pinnedRepoNames] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, {
        headers: getHeaders(),
      }),
      fetchPinnedRepoNamesFromProfile(username),
    ]);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos: GitHubRepo[] = (await response.json()).map((repo: GitHubRepo) => ({
      ...repo,
      pinned: pinnedRepoNames.has(repo.name),
    }));

    // Apply intelligent filtering
    const filteredRepos = repos.filter(shouldIncludeRepo);

    filteredRepos.sort(compareReposForDisplay);

    return filteredRepos;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

/**
 * Fetch detailed information for a specific repository
 */
export async function fetchRepoDetails(
  owner: string,
  repo: string
): Promise<RepoDetails | null> {
  try {
    const [repoData, readme, commits, contributors] = await Promise.all([
      fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: getHeaders() }).then(r => r.json()),
      fetchRepoReadme(owner, repo),
      fetchRecentCommits(owner, repo),
      fetchContributors(owner, repo),
    ]);

    return {
      ...repoData,
      readme,
      fileStructure: [], // Will be populated on-demand for visualizations
      commitActivity: commits,
      contributors,
    };
  } catch (error) {
    console.error(`Error fetching details for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch README.md content
 */
export async function fetchRepoReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      { headers: getHeaders() }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Decode base64 content
    const content = atob(data.content.replace(/\n/g, ''));
    return content;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch recent commit activity
 */
export async function fetchRecentCommits(owner: string, repo: string): Promise<CommitData[]> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=100`,
      { headers: getHeaders() }
    );

    if (!response.ok) return [];

    const commits = await response.json();

    return commits.map((commit: any) => ({
      sha: commit.sha,
      date: commit.commit.author.date,
      message: commit.commit.message,
      author: commit.commit.author.name,
      additions: 0, // Would need detailed commit API for this
      deletions: 0,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Fetch repository contributors
 */
async function fetchContributors(owner: string, repo: string): Promise<Contributor[]> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=10`,
      { headers: getHeaders() }
    );

    if (!response.ok) return [];

    const contributors = await response.json();

    return contributors.map((contributor: any) => ({
      login: contributor.login,
      contributions: contributor.contributions,
      avatar_url: contributor.avatar_url,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Fetch repository file tree structure
 */
export async function fetchRepoStructure(owner: string, repo: string): Promise<FileNode[]> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      // Try 'master' branch if 'main' doesn't exist
      const masterResponse = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers: getHeaders() }
      );

      if (!masterResponse.ok) return [];

      const data = await masterResponse.json();
      return parseTreeToFileNodes(data.tree);
    }

    const data = await response.json();
    return parseTreeToFileNodes(data.tree);
  } catch (error) {
    return [];
  }
}

/**
 * Parse GitHub tree API response to FileNode array
 */
function parseTreeToFileNodes(tree: any[]): FileNode[] {
  return tree
    .filter(item => item.type === 'blob') // Only files, not directories
    .map(item => ({
      path: item.path,
      type: 'file' as const,
      size: item.size || 0,
      language: inferLanguageFromPath(item.path),
    }));
}

/**
 * Infer programming language from file path
 */
function inferLanguageFromPath(path: string): string | undefined {
  const ext = path.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    'ts': 'TypeScript',
    'js': 'JavaScript',
    'tsx': 'TypeScript',
    'jsx': 'JavaScript',
    'py': 'Python',
    'rs': 'Rust',
    'go': 'Go',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'rb': 'Ruby',
    'php': 'PHP',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'r': 'R',
    'jl': 'Julia',
    'md': 'Markdown',
    'json': 'JSON',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'css': 'CSS',
    'scss': 'SCSS',
    'html': 'HTML',
    'astro': 'Astro',
    'svelte': 'Svelte',
    'vue': 'Vue',
  };

  return ext ? languageMap[ext] : undefined;
}

/**
 * Get display-ranked repositories.
 */
export function getFeaturedRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos].sort(compareReposForDisplay);
}
