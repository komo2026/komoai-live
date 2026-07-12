// Global site data. Import from anywhere with the `import` keyword.

export const SITE_TITLE = 'komo.sh';
export const SITE_DESCRIPTION =
	'Small sharp tools, AI agents, and the boring plumbing that makes them work. Linux, Python, automation.';

// Hero / brand tagline shown on the homepage.
export const TAGLINE = 'ship small. overengineer nothing.';
export const QUOTE =
	'I visualize a time when we will be to robots what dogs are to humans. And I am rooting for the machines.';

// About / whoami.
export const AUTHOR = {
	name: 'Reid Marlow',
	pronouns: 'he/him',
	born: '2001-05-12',
	edu: 'PhD Automation, HK PolyU',
	bio: "I'm Reid Marlow, a technologist working in automation - currently doing PhD research in the field at the Hong Kong Polytechnic University. Here I write up what I actually learn building tools, engineering AI agents, and keeping systems running, along with the workflows and habits that stick. The best is yet to come. We've only scratched the surface.",
};

// Primary navigation.
export const NAV_LINKS = [
	{ href: '/blog', label: 'Blog' },
	{ href: '/about', label: 'About' },
];

// Social links shown in the footer.
export const SOCIAL_LINKS = [
	{ label: 'X', href: 'https://x.com/swartzberg_ryan' },
	{ label: 'Bluesky', href: 'https://bsky.app/profile/komoai.net' },
	{ label: 'YouTube', href: 'https://www.youtube.com/channel/UCHIB3rEdXqRDERY7qKehgpg' },
];

// Recommended tools. Single source of truth for both the homepage "Tools"
// section and the per-post sidebar (see BlogPost.astro), so every blog page
// carries the outbound link automatically — no manual authoring per post.
export const TOOLS = [
	{
		name: 'KolmoPDF',
		kicker: 'pdf -> markdown',
		href: 'https://kolmopdf.com',
		host: 'kolmopdf.com',
		blurb:
			'VLM-based PDF parsing that keeps formulas, tables, code blocks, and multi-column order intact — clean text you can wire straight into an agent or knowledge base.',
	},
];
