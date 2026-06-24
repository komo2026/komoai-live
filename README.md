# komo.sh — komoai.live

Personal developer blog for **komo**. Built with [Astro](https://astro.build).
Design: calm indie-dev, e-ink warm (light) ↔ soft dark, monospace + green accents.

- **Live:** https://komoai.live
- **Stack:** Astro 7 · content collections (MDX) · RSS · sitemap · zero client JS except the theme toggle.

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
├─ content.config.ts      # blog collection schema (frontmatter)
├─ content/blog/          # ← posts live here (one .md / .mdx per post). Empty for now.
├─ styles/global.css      # the whole design system (theme vars + components)
├─ components/            # BaseHead, Header (+ theme toggle), Footer, FormattedDate
├─ layouts/
│  ├─ BaseLayout.astro    # html/head/body shell, header + footer
│  └─ BlogPost.astro      # single-post article layout
└─ pages/
   ├─ index.astro         # homepage (hero · whoami · latest · blog)
   ├─ about.astro         # About
   ├─ blog/index.astro    # blog archive
   ├─ blog/[...slug].astro# renders each post
   └─ rss.xml.js          # RSS feed
```

## Add a post

Drop a Markdown/MDX file into `src/content/blog/`. The filename becomes the URL slug
(`my-first-post.md` → `/blog/my-first-post/`). Frontmatter:

```mdx
---
title: 'Most AI agent demos are a for-loop in a trench coat'
description: 'The loop was never the hard part.'
pubDate: 2026-06-20
# updatedDate: 2026-06-25      # optional
# heroImage: ./hero.jpg        # optional, relative to this file
---

Your content here. Markdown + MDX components both work.
```

The homepage, blog archive, and RSS feed pick it up automatically. With no posts,
the site shows empty states instead.

## Theme

Light/dark is toggled in the header and remembered in `localStorage` (`komo-theme`),
applied before paint to avoid a flash.
