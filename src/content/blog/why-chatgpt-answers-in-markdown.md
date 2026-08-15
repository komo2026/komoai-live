---
title: "Why ChatGPT answers in Markdown"
description: "Why ChatGPT and other LLMs answer in Markdown by default: training corpora, token cost, OCR noise, and when to convert PDFs first."
pubDate: 2026-08-10T05:20:38Z
tags:
  - ai
  - llm
  - markdown
  - productivity
---

Ask ChatGPT for a recipe and you usually get numbered steps. Ask for a technical explanation and you usually get section titles before the details. Claude and Gemini do much the same. The formatting is Markdown: light marks for headings, emphasis, lists, and code fences that chat UIs know how to render.

John Gruber and Aaron Swartz published Markdown in 2004 so plain text could convert to HTML without forcing authors to write tags. The first audience was bloggers. Two decades later, the same marks show up as the ordinary shape of model answers. No standards body required AI systems to do this. Enough training text, products, and user habits already treated Markdown as normal that other formats feel like special requests.

## From blog markup to developer text

The early design goal was simple. Keep the source readable without a preview. A hash starts a heading. Asterisks or underscores mark emphasis. Hyphens make lists. Gruber optimized for speed of writing more than for a strict formal language. Blogs and sites such as Stack Overflow adopted it because people could type quickly and still get structure when the page rendered.

GitHub widened the footprint after 2008. READMEs, issues, pull requests, and comments all expected Markdown. Large numbers of developers wrote it weekly as ordinary work, not as a format experiment. CommonMark later fixed a shared core syntax. In 2017 GitHub published GitHub Flavored Markdown, which added tables, task lists, and a few other extensions on that core. Jupyter put Markdown cells next to code. Tools like Obsidian stored local notes as `.md` files. Static site generators defaulted to Markdown pages. By the early 2020s, a lot of developer documentation and personal knowledge bases lived in this form.

Chat products then started rendering model output the same way. Code blocks got highlighting. Tables drew as tables. People noticed that prompts with structure often got structured answers back. At that point Markdown was already thick in public text that model trainers like to keep: docs, Q&A, READMEs, technical posts.

## What pretraining already contained

Open corpora rarely publish a clean "percent Markdown" figure. You can still inspect the large slices.

EleutherAI's The Pile (late 2020) is about 825 GB across 22 subsets. The GitHub portion is on the order of 95 GB. Stack Exchange adds tens of gigabytes. Much of that material is README text, documentation, question and answer bodies, and edit histories written in Markdown or something very close to it. Technical blogs, doc sites, and note dumps stored as `.md` push the same patterns further into the mix: headings, lists, fenced code.

Under that diet, models do not need a post-hoc product rule that says "always answer in Markdown." They generate the structures that appeared often in training. Chat apps render those structures, users keep writing them in prompts and notes, and later crawls pick up more of the same. Cloudflare's February 2026 note on Markdown for agents put a cost number on the markup side: one blog post used about 16,180 tokens as HTML and about 3,150 tokens as Markdown, roughly an 80% reduction. Fewer tags leave more of the context window for content.

For human–model chat, that middle ground matters. Plain prose is easy to read but weak on explicit structure. HTML and XML carry structure with a lot of tag noise. JSON is fine for machine APIs and awkward as a default reading format in a conversation window. Markdown is structured enough to parse and short enough to skim in source form.

## Dashes after you ban the format

An arXiv paper from March 2026, *The Last Fingerprint* (2603.27006), measured em dash rates and related habits across several vendors' models. One result is easy to check for yourself. If you tell a model not to use Markdown, headings and lists often disappear, while long dashes still show up more than in typical human writing.

Headings and bullets are easy targets for a formatting instruction. A long dash is also ordinary English punctuation, so a "no Markdown" rule does not remove it cleanly. I would not rest the whole case on punctuation statistics. The paper is a small reminder that training leaves habits past a single toggle. Corpus density and product defaults do more of the work.

## Feeding models: text first, PDF when you must

Claude, ChatGPT, and Gemini all accept PDFs in 2026. The vendor docs say so. I still start with plain text or Markdown when the material exists in those forms.

PDF files, scans, and screenshots usually pass through OCR or layout parsing before the model sees usable text. That step can drop characters, break formulas, scramble multi-column order, disorder tables, and flatten heading levels. Zhang et al.'s *OCR Hinders RAG* (arXiv 2412.02592) builds OHR-Bench on thousands of document images and questions. In their evaluation, none of the OCR setups alone was enough to build high quality RAG knowledge bases, and as noise increased, retrieval and answer quality could fall by about half relative to cleaner conditions. Bad extraction tends to stay bad downstream; the generator does not reliably reconstruct what the parser destroyed.

PDF also spends context differently. Many pipelines treat each page as an image, or send extracted text together with page images. The same article as Markdown is usually shorter and already hierarchical, so fewer tokens go to whitespace, page chrome, and low-information pixels. The Cloudflare HTML versus Markdown comparison is the same kind of accounting for markup instead of page images.

Upload a PDF when the figure or exact layout is the thing you need. Legal originals, archival scans, and dense diagrams are normal reasons. For everything else, export `.md` or `.txt` if you can. If you control a website that agents will read, publish a clean Markdown view or an `llms.txt`-style summary. When you do send a PDF, assume parse error and a higher token bill.

A lot of research and engineering material still only exists as PDF: two-column papers, formula-heavy preprints, white papers with nested tables. If the next step is notes, RAG, or an agent that depends on stable structure, converting that PDF to Markdown before ingestion usually beats pasting the raw file into chat. Getting characters out is the easy part. Keeping formulas, tables, and reading order intact on technical pages is where generic OCR and "page as image" paths get flaky.

For that conversion I use [KolmoPDF](https://kolmopdf.com): browser upload, Markdown out, with better odds on math and multi-column layout, plus layout-preserving translation when translation is the job. It is a cloud product. The quality gap is most visible on technical, structured PDFs; a one-page letter rarely needs it. Either way I treat clean text as the ordinary model input, and PDF as something I convert when the source leaves me no choice.

## Agent-facing files kept the same marks

New agent-oriented conventions mostly stayed on Markdown rather than inventing a fresh binary format for instructions.

Jeremy Howard's `llms.txt` proposal (September 2024) puts a Markdown summary at a site root for crawlers and agents. `AGENTS.md` does similar work inside repositories for coding assistants: project context and conventions in Markdown. Cloudflare's Markdown for Agents path converts HTML to Markdown on the server so clients skip a strip-and-clean step. Authors keep choosing a format people can read and models already handle with low friction, which is how de facto defaults extend into the next tool.

## Practice

I treat the history above as an engineering constraint, not a branding story. Prefer plain text or Markdown as model input. If you run a public site that agents will hit, ship a clean Markdown path or `llms.txt`. Reach for PDF when layout or figures carry the information, and convert technical PDFs to structured text before they enter a knowledge base if retrieval quality matters.

Better input formatting will not invent a thesis for you. It mostly decides how much of the context window and the retrieval stack gets spent on structure instead of extraction debris.

## References

John Gruber, Markdown (Daring Fireball). CommonMark Spec. GitHub Flavored Markdown Spec. Gao et al., *The Pile* (arXiv:2101.00027). *The Last Fingerprint* (arXiv:2603.27006). Zhang et al., *OCR Hinders RAG* / OHR-Bench (arXiv:2412.02592). Jeremy Howard / Answer.AI, llms.txt. agents.md. Cloudflare, Markdown for Agents. Anthropic, OpenAI, and Gemini docs on PDF and document processing.
