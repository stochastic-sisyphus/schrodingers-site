/**
 * RSS feed generation for blog posts
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const sortedPosts = posts.sort((a, b) =>
    b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: 'stochastic-sisyphus | blog',
    description: 'Computational atmospheres, emergent systems, and explorations at the intersection of code and thought',
    site: context.site || 'https://schrodingers-site.pages.dev',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
