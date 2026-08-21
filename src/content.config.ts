import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Content lives as Markdown/MDX in src/content/blog. Public front-end is
// reidmarlow.com. Hashnode is no longer the CMS — do not fetch GraphQL at
// build time (Pro API expired 2026-08; a failed loader would blank the site).

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		coverImage: z.string().url().optional(),
		tags: z.array(z.string()).default([]),
		readingTime: z.number().optional(),
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),
	}),
});

export const collections = { blog };
