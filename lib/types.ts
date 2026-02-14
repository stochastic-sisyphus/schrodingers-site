/**
 * Shared TypeScript types for data structures
 */

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  private: boolean;
  license: {
    key: string;
    name: string;
  } | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface RepoDetails extends GitHubRepo {
  readme: string | null;
  fileStructure: FileNode[];
  commitActivity: CommitData[];
  contributors: Contributor[];
}

export interface FileNode {
  path: string;
  type: 'file' | 'dir';
  size: number;
  language?: string;
}

export interface CommitData {
  sha: string;
  date: string;
  message: string;
  author: string;
  additions: number;
  deletions: number;
}

export interface Contributor {
  login: string;
  contributions: number;
  avatar_url: string;
}

export interface ORCIDWork {
  'put-code': number;
  title: {
    title: {
      value: string;
    };
  };
  'journal-title': {
    value: string;
  } | null;
  'publication-date': {
    year: {
      value: string;
    };
    month: {
      value: string;
    } | null;
  } | null;
  'external-ids': {
    'external-id': Array<{
      'external-id-type': string;
      'external-id-value': string;
      'external-id-url': {
        value: string;
      } | null;
    }>;
  } | null;
  type: string;
  url: {
    value: string;
  } | null;
}

export interface ORCIDProfile {
  'orcid-identifier': {
    path: string;
    uri: string;
  };
  person: {
    name: {
      'given-names': {
        value: string;
      } | null;
      'family-name': {
        value: string;
      } | null;
    } | null;
    biography: {
      content: string;
    } | null;
  };
}

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  author: string;
  guid: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: Date;
  excerpt: string;
  content?: string;
  tags: string[];
  substackUrl?: string;
  featured?: boolean;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  orcidUrl?: string;
  abstract?: string;
  type: string;
  githubUrl?: string;  // For repository entries
  description?: string; // For repository entries
}

export interface FeaturedProject {
  repo: GitHubRepo;
  featured: boolean;
  order: number;
  highlights?: string[];
}
