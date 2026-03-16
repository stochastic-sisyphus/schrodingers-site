/**
 * Substack RSS feed parsing utilities
 */

import type { SubstackPost, BlogPost } from './types';

const SUBSTACK_RSS_URL = process.env.SUBSTACK_RSS_URL || 'https://stochasticsisyphus.substack.com/feed';

/**
 * Parse RSS XML to extract posts
 */
async function parseRSSFeed(rssUrl: string): Promise<SubstackPost[]> {
  try {
    const response = await fetch(rssUrl);

    if (!response.ok) {
      console.error(`Substack RSS error: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();

    // Basic RSS parsing (in production, use a proper XML parser)
    const posts: SubstackPost[] = [];

    // Extract items using regex (simplified approach)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const matches = xmlText.matchAll(itemRegex);

    for (const match of matches) {
      const itemXml = match[1];

      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link');
      const pubDate = extractTag(itemXml, 'pubDate');
      const description = extractTag(itemXml, 'description');
      const content = extractTag(itemXml, 'content:encoded') || description;
      const author = extractTag(itemXml, 'dc:creator') || 'stochastic-sisyphus';
      const guid = extractTag(itemXml, 'guid') || link;

      if (title && link) {
        posts.push({
          title,
          link,
          pubDate,
          description,
          content,
          author,
          guid,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error('Error parsing Substack RSS:', error);
    return [];
  }
}

/**
 * Extract content from XML tag
 */
function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? cleanXMLContent(match[1]) : '';
}

/**
 * Clean XML content (remove CDATA, decode HTML entities)
 */
function cleanXMLContent(content: string): string {
  let cleaned = content
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();

  // Decode numeric HTML entities (&#246;, &#8217;, etc.)
  cleaned = cleaned.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // Decode named HTML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&'); // Must be last to avoid double-decoding

  return cleaned;
}

/**
 * Fetch Substack posts
 */
export async function fetchSubstackFeed(rssUrl: string = SUBSTACK_RSS_URL): Promise<SubstackPost[]> {
  return parseRSSFeed(rssUrl);
}

/**
 * Transform Substack post to BlogPost format
 */
export function transformSubstackPostToBlogPost(post: SubstackPost): BlogPost {
  // Generate slug from title
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Parse pub date
  const date = new Date(post.pubDate);

  // Extract excerpt from description (first 200 chars)
  const excerpt = post.description
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .slice(0, 200)
    .trim() + '...';

  // Extract tags from content (simplified - could be improved)
  const tags: string[] = [];

  return {
    slug,
    title: post.title,
    date,
    excerpt,
    content: post.content,
    tags,
    substackUrl: post.link,
  };
}

/**
 * Fetch and transform all Substack posts
 */
export async function fetchAllSubstackPosts(rssUrl: string = SUBSTACK_RSS_URL): Promise<BlogPost[]> {
  const substackPosts = await fetchSubstackFeed(rssUrl);

  return substackPosts.map(transformSubstackPostToBlogPost);
}

/**
 * Get recent posts
 */
export function getRecentPosts(posts: BlogPost[], count: number = 3): BlogPost[] {
  return posts
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, count);
}
