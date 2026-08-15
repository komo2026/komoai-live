---
title: "The Next Agent Supply Chain Bug Will Look Like Documentation"
description: "AI agent skills look like documentation, but they behave like dependencies. That makes them a supply-chain surface, not a harmless prompt bundle."
pubDate: 2026-07-02T13:51:28Z
tags:
  - ai
  - security
  - programming
  - devtools
---

# The Next Agent Supply Chain Bug Will Look Like Documentation

AI agent skills are being treated like README files with a nicer icon. That is the bug.

A skill looks harmless because the main file is usually Markdown: a `SKILL.md`, a few instructions, maybe a helper script, maybe a link to external docs. It does not feel like installing a package. It feels like teaching the agent a new trick.

But from the agent's point of view, that Markdown is not documentation. It is operating procedure. It changes what the agent loads, what it trusts, which tools it reaches for, and sometimes which shell commands it is willing to run.

That makes a skill much closer to a browser extension or an npm dependency than a blog post.

[NVIDIA's SkillSpector](https://github.com/NVIDIA/SkillSpector) is interesting because it says the quiet part out loud. It is a security scanner for AI agent skills, not for model prompts in the abstract. It scans a skill before installation and looks for the messy stuff that actually matters: prompt injection, data exfiltration, privilege escalation, unsafe scripts, MCP tool poisoning, over-broad permissions, and dependency problems.

The specific tool matters less than the direction. Agent skills have crossed the line from convenience feature to supply-chain surface.

## The weird part: the attack can be plain English

Classic supply-chain security trained us to look at code. A malicious package has a postinstall script. A compromised dependency reaches out to a strange domain. A binary does something it never advertised.

Skills make that boundary uglier.

A bad skill can still ship code, of course. It can include shell scripts, Python, JavaScript, or a helper that fetches something at runtime. That part is familiar.

The new part is that the dangerous payload can live in natural language.

A `SKILL.md` can tell an agent to ignore certain failures. It can frame a remote install step as required setup. It can instruct the agent to read local configuration. It can bias tool choice. It can make a suspicious command look like routine environment bootstrapping.

No buffer overflow. No exotic exploit. Just instructions aimed at a system whose job is to follow instructions.

That is why I do not like the phrase "prompt injection" for this whole category. It makes the problem sound like someone pasted a naughty sentence into a chat box. In a skill system, the injected text may be part of the trusted package. The agent is not being tricked by untrusted data; it is being handed a new operating manual.

That is a much worse trust boundary.

## Static scanning helps. It is not the finish line.

SkillSpector's README says it checks 68 vulnerability patterns across 17 categories and can run as a fast static scanner, with optional LLM-based semantic review. It also supports JSON, Markdown, and SARIF output, which means the result can actually fail CI instead of becoming another report nobody reads.

That is useful. I want this kind of gate in front of any shared skill registry.

But a scanner is not a permission model.

[Trail of Bits has already shown](https://blog.trailofbits.com/2026/06/03/the-sorry-state-of-skill-distribution/) how brittle scanner-only thinking can be: when attackers can iterate against a fixed scanner, they get as many attempts as they need to find a phrasing or package shape that passes. [AIR Security's fake-skill experiment](https://www.csoonline.com/article/4188840/how-a-malicious-ai-agent-skill-passed-security-checks-and-reached-26000-users.html) made the same point from a different angle: the submitted package can be clean while the real payload sits behind an external documentation link that changes later.

That second failure mode is the one that should make developers uncomfortable.

A skill can pass review on Monday because the linked setup guide is boring. On Friday, the same URL can tell the agent to download and run something else. If your trust decision only happened at install time, you are now trusting a mutable web page with the same practical authority as the skill.

That is not a scanner bug. That is a model of trust bug.

## The useful mental model: skills are dependencies

The safest default is boring: treat skills like dependencies that happen to contain prose.

That means a few things in practice.

Do not install random skills straight into a powerful agent. Put them through review. Read the Markdown. Read the scripts. Look at every external URL. If a skill tells the agent to fetch setup instructions from a domain, pin the content or vendor it internally. A mutable link should not be able to change what your agent does after approval.

Run a scanner, but make it one layer. Static rules catch the obvious mess: credential reads, `curl | bash`, suspicious shell, unpinned dependencies, over-broad MCP permissions. Semantic review catches some of the natural-language tricks. Neither catches every delayed payload.

Constrain the runtime anyway. A skill for formatting Markdown probably does not need network access. A code-review skill probably does not need your browser cookies. A documentation helper probably should not get a shell by default. Least privilege is annoying until the day it is the only reason a bad skill only breaks one sandbox.

Also: keep a ledger. Which skill version did you install? From where? Which hash? Which external resources did it reference? If that sounds like dependency management, good. That is the point.

## What I would put in CI

For a team-owned skill registry, I would start small.

Every skill change comes in through a pull request. CI scans only the changed skill directories. A static scanner runs first because it is cheap and deterministic. If the score is high, the PR fails. If it is medium, the PR needs a human to accept or fix the finding. For anything with scripts, network calls, external setup docs, or MCP tools, add a second review pass.

The rule I would care about most is not "the scanner says safe." It is: no new skill gets broad tool access without a clear reason.

That is where agent systems get sloppy. We install a tiny skill, but it inherits a giant context: filesystem, shell, secrets in the environment, browser sessions, repo history, previous conversation, maybe deployment credentials. The skill itself may be small. The authority it receives is not.

A scanner can tell you the package looks suspicious. It cannot make an overpowered runtime safe.

## The boring answer is the right one

AI agent skills are useful. I use this pattern because it keeps procedures out of my head and closer to the tools that need them.

But the convenience is exactly why the risk is easy to miss. Markdown feels harmless. A marketplace with stars feels vetted. A passing scanner feels final.

None of those are trust.

The next agent supply-chain incident probably will not look like a dramatic exploit. It will look like a helpful setup note, a renamed package, a link to documentation, or a skill that asks for "temporary" access to more than it needs.

Treat it like code before it gets to act like code.

Where do you draw the line today: scanner pass, human review, sandbox-only, or no third-party skills at all?
