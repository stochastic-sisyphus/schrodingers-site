/**
 * ORCID API utilities for fetching research publications
 */

import type { ORCIDProfile, ORCIDWork, ResearchPaper } from './types';

const ORCID_API = 'https://pub.orcid.org/v3.0';
const ORCID_ID = import.meta.env.ORCID_ID || '0009-0008-6611-535X';

/**
 * Get headers for ORCID API requests
 */
function getHeaders(): HeadersInit {
  return {
    'Accept': 'application/json',
    'User-Agent': 'stochastic-sisyphus-site',
  };
}

/**
 * Fetch ORCID profile information
 */
export async function fetchORCIDProfile(orcidId: string = ORCID_ID): Promise<ORCIDProfile | null> {
  try {
    const response = await fetch(
      `${ORCID_API}/${orcidId}/person`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      console.error(`ORCID API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ORCID profile:', error);
    return null;
  }
}

/**
 * Fetch ORCID research works/publications
 */
export async function fetchORCIDWorks(orcidId: string = ORCID_ID): Promise<ORCIDWork[]> {
  try {
    const response = await fetch(
      `${ORCID_API}/${orcidId}/works`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      console.error(`ORCID API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // ORCID returns a group structure, flatten to individual works
    const works = data.group?.map((group: any) => group['work-summary'][0]) || [];

    return works;
  } catch (error) {
    console.error('Error fetching ORCID works:', error);
    return [];
  }
}

/**
 * Transform ORCID works to ResearchPaper format
 */
export function transformORCIDWorksToResearchPapers(works: ORCIDWork[]): ResearchPaper[] {
  return works.map((work, index) => {
    const title = work.title?.title?.value || 'Untitled';
    const year = parseInt(work['publication-date']?.year?.value || '0');
    const journal = work['journal-title']?.value;

    // Extract DOI from external IDs
    const doi = work['external-ids']?.['external-id']?.find(
      id => id['external-id-type'] === 'doi'
    )?.['external-id-value'];

    const orcidUrl = work.url?.value;

    return {
      id: `work-${work['put-code'] || index}`,
      title,
      authors: [], // ORCID doesn't provide full author list in summary
      year,
      journal,
      doi,
      orcidUrl,
      type: work.type || 'publication',
    };
  });
}

/**
 * Fetch all research data (profile + papers)
 */
export async function fetchAllResearchData(orcidId: string = ORCID_ID) {
  const [profile, works] = await Promise.all([
    fetchORCIDProfile(orcidId),
    fetchORCIDWorks(orcidId),
  ]);

  const papers = transformORCIDWorksToResearchPapers(works);

  return {
    profile,
    papers: papers.sort((a, b) => b.year - a.year), // Sort by year descending
  };
}

/**
 * Get key papers (most cited or most recent)
 */
export function getKeyPapers(papers: ResearchPaper[], count: number = 3): ResearchPaper[] {
  // For now, just return most recent
  // In future, could integrate citation counts
  return papers.slice(0, count);
}
