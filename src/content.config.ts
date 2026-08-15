import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';

// ── Hashnode headless CMS ──────────────────────────────────────────────
// Content normally lives in Hashnode and is pulled at build time over the
// GraphQL API. Public front-end is reidmarlow.com.
//
// Emergency local fallback:
// If Hashnode API access is unavailable, set BLOG_CONTENT_SOURCE=local and put
// MD/MDX posts in src/content/blog. This bypass keeps the public site publishable
// without changing the public URL structure. Default remains Hashnode.

const CONTENT_SOURCE =
	import.meta.env.BLOG_CONTENT_SOURCE || process.env.BLOG_CONTENT_SOURCE || 'hashnode';

const localLoader = glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' });

const HASHNODE_ENDPOINT = 'https://gql-beta.hashnode.com/';
const PUBLICATION_ID =
	import.meta.env.HASHNODE_PUBLICATION_ID ||
	process.env.HASHNODE_PUBLICATION_ID ||
	'';
// Hashnode "host" is CMS metadata for GraphQL lookup — independent of the
// public Vercel domain (reidmarlow.com). Hashnode custom domain is reidmarlow.com.
const PUBLICATION_HOST =
	import.meta.env.HASHNODE_PUBLICATION_HOST ||
	process.env.HASHNODE_PUBLICATION_HOST ||
	'reidmarlow.com';
const HASHNODE_TOKEN =
	import.meta.env.HASHNODE_TOKEN ?? process.env.HASHNODE_TOKEN;

const POSTS_QUERY_BY_HOST = `
	query PublicationPosts($host: String!, $first: Int!, $after: String) {
		publication(host: $host) {
			id
			posts(first: $first, after: $after) {
				edges {
					node {
						id
						slug
						title
						brief
						publishedAt
						updatedAt
						readTimeInMinutes
						coverImage { url }
						tags { id name slug }
						seo { title description }
						content { html }
					}
				}
				pageInfo { hasNextPage endCursor }
			}
		}
	}
`;

const POSTS_QUERY_BY_ID = `
	query PublicationPostsById($id: ObjectId!, $first: Int!, $after: String) {
		publication(id: $id) {
			id
			posts(first: $first, after: $after) {
				edges {
					node {
						id
						slug
						title
						brief
						publishedAt
						updatedAt
						readTimeInMinutes
						coverImage { url }
						tags { id name slug }
						seo { title description }
						content { html }
					}
				}
				pageInfo { hasNextPage endCursor }
			}
		}
	}
`;

function hashnodeLoader(): Loader {
	return {
		name: 'hashnode-loader',
		load: async ({ store, logger, parseData }) => {
			store.clear();

			if (!HASHNODE_TOKEN) {
				logger.warn(
					'HASHNODE_TOKEN is not set — building with an empty blog. ' +
						'Set it in the build environment (Vercel project env / laptop secrets.env).',
				);
				return;
			}

			let after: string | null = null;
			let total = 0;
			// Retry the whole request on transient failure (network / HTTP 5xx /
			// GraphQL error) — Stellate can miss right after a publish. 2s backoff.
			const MAX_FETCH_RETRIES = 2;
			const lookup = PUBLICATION_ID
				? `id=${PUBLICATION_ID}`
				: `host=${PUBLICATION_HOST}`;

			try {
				do {
					let json: any;
					let lastErr: Error | undefined;

					for (let attempt = 0; attempt <= MAX_FETCH_RETRIES; attempt++) {
						try {
							const res = await fetch(HASHNODE_ENDPOINT, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${HASHNODE_TOKEN}`,
								},
								body: JSON.stringify(
									PUBLICATION_ID
										? {
												query: POSTS_QUERY_BY_ID,
												variables: { id: PUBLICATION_ID, first: 20, after },
											}
										: {
												query: POSTS_QUERY_BY_HOST,
												variables: { host: PUBLICATION_HOST, first: 20, after },
											},
								),
							});
							if (!res.ok) {
								throw new Error(`Hashnode API responded ${res.status} ${res.statusText}`);
							}
							const body = await res.json();
							if (body.errors) {
								throw new Error(`Hashnode GraphQL errors: ${JSON.stringify(body.errors)}`);
							}
							json = body;
							break; // success — exit retry loop
						} catch (err) {
							lastErr = err as Error;
							if (attempt < MAX_FETCH_RETRIES) {
								logger.warn(
									`Hashnode request attempt ${attempt + 1} failed, retrying in 2s: ${lastErr.message}`,
								);
								await new Promise((r) => setTimeout(r, 2000));
							}
						}
					}

					if (!json) throw lastErr ?? new Error('Hashnode request failed after retries');

					const publication = json.data?.publication;
					if (!publication) {
						throw new Error(`Publication not found for ${lookup}`);
					}

					const connection = publication.posts;
					for (const edge of connection.edges) {
						const node = edge.node;
						// coverImage.url can be "" (empty string) from Hashnode when no
						// cover image is set. Use || (not ??) to catch both null and "".
						const coverUrl = node.coverImage?.url || undefined;
						const data = await parseData({
							id: node.slug,
							data: {
								title: node.title,
								description: node.brief ?? '',
								pubDate: node.publishedAt,
								updatedDate: node.updatedAt ?? undefined,
								coverImage: coverUrl,
								tags: (node.tags ?? []).map((t: { name: string }) => t.name),
								readingTime: node.readTimeInMinutes ?? undefined,
								seoTitle: node.seo?.title ?? undefined,
								seoDescription: node.seo?.description ?? undefined,
							},
						});

						store.set({
							id: node.slug,
							data,
							rendered: { html: node.content?.html ?? '' },
						});
						total += 1;
					}

					after = connection.pageInfo?.hasNextPage
						? connection.pageInfo.endCursor
						: null;
				} while (after);

				logger.info(`Loaded ${total} post(s) from Hashnode (${lookup}).`);
			} catch (err) {
				// On a real CMS error, FAIL the build so Vercel keeps the last good deploy
				// (a genuinely empty publication returns 0 posts with no error and still builds).
				logger.error(`Hashnode load failed: ${(err as Error).message}`);
				throw err;
			}
		},
	};
}

const blog = defineCollection({
	loader: CONTENT_SOURCE === 'local' ? localLoader : hashnodeLoader(),
	// Schema mirrors the fields needed by the page/RSS templates and the
	// Hashnode fields we pull.
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
