import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

// ── Hashnode headless CMS ──────────────────────────────────────────────
// Content lives in Hashnode (the single source of truth) and is pulled at
// build time over the GraphQL API. komoai.live is the only public front-end.
// A Hashnode webhook (publish/update/delete) triggers a Vercel rebuild.
//
// Required build-time env:
//   HASHNODE_TOKEN            Hashnode Personal Access Token (Pro). Bearer auth.
//   HASHNODE_PUBLICATION_HOST publication host. Defaults to komoai.live.
// Note (2026-06): the live endpoint is gql-beta.hashnode.com; the old
// gql.hashnode.com is deprecated (301s to an announcement page). GraphQL
// read access is Pro-gated, so the token is required to fetch content.

const HASHNODE_ENDPOINT = 'https://gql-beta.hashnode.com/';
const PUBLICATION_HOST =
	import.meta.env.HASHNODE_PUBLICATION_HOST ??
	process.env.HASHNODE_PUBLICATION_HOST ??
	'komoai.live';
const HASHNODE_TOKEN =
	import.meta.env.HASHNODE_TOKEN ?? process.env.HASHNODE_TOKEN;

const POSTS_QUERY = `
	query PublicationPosts($host: String!, $first: Int!, $after: String) {
		publication(host: $host) {
			id
			posts(first: $first, after: $after) {
				edges {
					node {
						slug
						title
						brief
						publishedAt
						updatedAt
						readTimeInMinutes
						coverImage { url }
						tags { name slug }
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

			try {
				do {
					const res = await fetch(HASHNODE_ENDPOINT, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${HASHNODE_TOKEN}`,
						},
						body: JSON.stringify({
							query: POSTS_QUERY,
							variables: { host: PUBLICATION_HOST, first: 20, after },
						}),
					});

					if (!res.ok) {
						throw new Error(`Hashnode API responded ${res.status} ${res.statusText}`);
					}

					const json = await res.json();
					if (json.errors) {
						throw new Error(`Hashnode GraphQL errors: ${JSON.stringify(json.errors)}`);
					}

					const publication = json.data?.publication;
					if (!publication) {
						throw new Error(`Publication not found for host "${PUBLICATION_HOST}"`);
					}

					const connection = publication.posts;
					for (const edge of connection.edges) {
						const node = edge.node;
						const data = await parseData({
							id: node.slug,
							data: {
								title: node.title,
								description: node.brief ?? '',
								pubDate: node.publishedAt,
								updatedDate: node.updatedAt ?? undefined,
								coverImage: node.coverImage?.url ?? undefined,
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

				logger.info(`Loaded ${total} post(s) from Hashnode (${PUBLICATION_HOST}).`);
			} catch (err) {
				// Never crash the build on a CMS hiccup: ship what we have (possibly
				// empty) and surface the error in the build log.
				logger.error(`Hashnode load failed: ${(err as Error).message}`);
			}
		},
	};
}

const blog = defineCollection({
	loader: hashnodeLoader(),
	// Schema mirrors the Hashnode fields we pull. Field names (title /
	// description / pubDate) are kept stable so the page/RSS templates need no
	// churn; the rendered HTML is stored separately and surfaced via render().
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
