/**
 * Content Collections configuration
 * Defines schemas for blog posts, projects, and research papers
 */

import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    substackUrl: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    githubUrl: z.string(),
    featured: z.boolean().default(false),
    stars: z.number().optional(),
    language: z.string().optional(),
    homepage: z.string().optional(),
    demo: z.string().optional(),
    highlights: z.array(z.string()).optional(),
  }),
});

const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number(),
    journal: z.string().optional(),
    doi: z.string().optional(),
    orcidUrl: z.string().optional(),
    abstract: z.string().optional(),
    type: z.string().default('publication'),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, projects, research };
