# komo.sh — komoai.live

Personal developer blog for **komo**. Built with [Astro](https://astro.build).
Design: calm indie-dev, e-ink warm (light) ↔ soft dark, monospace + green accents.

- **Live:** https://komoai.live
- **Stack:** Astro 7 · **Hashnode (headless CMS) as the single content source** · RSS · sitemap · zero client JS except the theme toggle.

## Content model (headless)

Posts are **written in Hashnode** and pulled at **build time** over the Hashnode
GraphQL API (`gql-beta.hashnode.com`, Bearer PAT). komoai.live is the only public
front-end; Hashnode handles the editor, image hosting, drafts and scheduling.

```
Hashnode (write/publish)
   └─ GraphQL  ──build-time──▶  Astro content loader (src/content.config.ts)
                                   └─▶ komoai.live/blog/<slug>  (your domain, your front-end)
   └─ Webhook (publish/update/delete) ──▶ Vercel Deploy Hook ──▶ rebuild
```

Build-time env (see `.env.example`): `HASHNODE_TOKEN` (required, Pro PAT) and
optional `HASHNODE_PUBLICATION_HOST` (defaults to `komoai.live`). Set them as Vercel
Project env vars for production builds; locally they come from `.env`. Without a
token the site builds with an **empty** blog (graceful empty states) rather than
failing.

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
├─ content.config.ts      # Hashnode GraphQL loader + blog collection schema
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

## Publish a post

Write and publish in **Hashnode** (set the slug, SEO title/description, cover image
and tags there). On publish, the Hashnode webhook triggers a Vercel rebuild; the new
build pulls the post via GraphQL and it appears at `/blog/<slug>/`. The Hashnode
`slug` becomes the URL slug. The homepage, blog archive and RSS feed pick it up
automatically; with no posts the site shows empty states instead.

To preview locally with real content, put a `HASHNODE_TOKEN` in `.env` and run
`npm run build` / `npm run preview`.

## Theme

Light/dark is toggled in the header and remembered in `localStorage` (`komo-theme`),
applied before paint to avoid a flash.
