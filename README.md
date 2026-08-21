# Reid Marlow — reidmarlow.com

Personal developer blog for **Reid Marlow**. Built with [Astro](https://astro.build).
Design: calm indie-dev, e-ink warm (light) ↔ soft dark, monospace + green accents.

- **Live:** https://reidmarlow.com
- **Stack:** Astro 7 · **local Markdown/MDX in `src/content/blog`** · RSS · sitemap · zero client JS except the theme toggle.
- **Internal codename:** `komo` (repo/project names may still say komoai-live; never the public brand).

## Content model

Posts are **Markdown files in this repo**. Vercel builds from GitHub `main`. Hashnode is **not** in the publish path (Pro API expired; skip by default).

```
src/content/blog/<slug>.md
   └─ git push origin main ──▶  Vercel build
                                   └─▶ reidmarlow.com/<slug>  (public domain)
```

No Hashnode token is required to build. Cover images may still be remote URLs in frontmatter.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to ./dist
npm run preview  # preview the production build
```

## Architecture

```
src/
├─ consts.ts              # site title, description, nav, socials, author info
├─ content.config.ts      # local glob loader + blog collection schema
├─ content/blog/          # posts (one .md / .mdx per slug)
├─ styles/global.css      # the whole design system (theme vars + components)
├─ components/            # BaseHead, Header (+ theme toggle), Footer, FormattedDate
├─ layouts/
│  ├─ BaseLayout.astro    # html/head/body shell, header + footer
│  └─ BlogPost.astro      # single-post article layout
└─ pages/
   ├─ index.astro         # homepage (hero · whoami · latest · blog)
   ├─ about.astro         # About
   ├─ blog/index.astro    # blog archive
   ├─ [...slug].astro     # renders each post (root-level → /<slug>/)
   └─ rss.xml.js          # RSS feed
```

## Publish a post

1. Add `src/content/blog/<slug>.md` with frontmatter (`title`, `description`, `pubDate`; optional `tags`, `coverImage`, `seoTitle`, `seoDescription`).
2. `git push` to `main`. Wait until `https://reidmarlow.com/<slug>` returns 200.
3. Cross-post to **dev.to** with `canonical_url` = that live URL.

The Hashnode `slug` (if a historical post was imported) is still the URL slug. Homepage, archive and RSS pick new files up automatically.

## Theme

Light/dark is toggled in the header and remembered in `localStorage` (`komo-theme`),
applied before paint to avoid a flash.
