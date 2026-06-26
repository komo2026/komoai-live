# Blog Visual Upgrade Design

## Goal

Upgrade `komo.sh` from a narrow warm e-ink blog into a more deliberate engineering journal while keeping the Astro static-blog architecture intact.

## Chosen Direction

Use a refined editorial developer-journal style: warm paper background, dark ink, restrained green accents, thin rules, subtle grid texture, stronger typography, and richer hover/focus states. The site should still feel personal and quiet, not like a SaaS landing page.

## Scope

- Keep Astro layouts, content collections, RSS, sitemap, and the current routes.
- Redesign the global visual system in `src/styles/global.css`.
- Improve homepage composition with a stronger hero, live-looking terminal/post preview, identity strip, latest/empty-state module, and recent-post list.
- Improve blog archive, about page, article header/prose, header, footer, and empty states.
- Fix mojibake text and icon artifacts by using stable ASCII text or HTML entities.
- Preserve the existing light/dark toggle and localStorage behavior.

## Interaction

- Header remains sticky with clearer active states.
- Theme toggle uses stable text icons and a compact circular control.
- Links, post rows, topic tiles, and feature modules receive clear hover/focus states.
- Empty states should feel intentional for a fresh blog, with command-line text and clear CTAs.
- Responsive layouts collapse from two-column hero/content bands into single-column mobile layouts without horizontal overflow.

## Constraints

- No framework migration, no new frontend runtime, no heavy image dependency.
- No generic purple AI gradients, bento clutter, nested cards, or marketing badge rows.
- Keep generated concept as visual reference only; implement UI natively in Astro and CSS.

## Verification

- Run `npm run build`.
- Start with `astro dev --background`.
- Inspect desktop and mobile layouts in a browser.
- Compare implementation against the generated concept for palette, hierarchy, header, hero balance, post modules, and responsive behavior.
