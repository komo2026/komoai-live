---
title: "Agent-Built Software Still Needs a Human-Shaped Test"
description: "Kuna shows why coding agents need benchmarks more than bravado."
pubDate: 2026-07-31T16:36:29Z
tags:
  - ai
  - programming
  - opensource
  - webdev
---

Kuna is the most interesting coding-agent release I saw this week because it does not pretend the agent is the clever part.

Zion Basque released Kuna on July 29th as an experimental decompiler written in Rust and designed to be refined by other agents. The headline is good enough to make people stop scrolling. Basque says an LLM wrote nearly every line, and on DecBench control-flow structuring for C programs, Kuna lands at 44.4% perfect structuring against IDA Pro 9.2 at 45.7%.

That is close enough to be surprising. It is not close enough to mean "agents solved reverse engineering." The second sentence matters more than the first.

Decompiler quality is not a single score. Control-flow structuring is the part that turns low-level jumps back into readable loops, conditionals, and switches. It is important, but it is not the whole job. Types, variable recovery, optimization, recompilability, weird architectures, pathological compiler output, and all the ugly cases reversers actually meet still matter. Basque says this plainly in the release post. Kuna is doing well on structuring and still has a lot of ground to cover.

That restraint is why the project is worth taking seriously.

The usual agent-software story is too neat. Give the model a task, let it run, watch a codebase appear. The demo ends before the part where someone asks whether the output is any good.

Kuna is built around the less glamorous version of the story. The hard work happened before the agent started writing code. Someone had to decide what "better" means. Someone had to build DecBench. Someone had to know why angr, Ghidra, and IDA Pro behave differently. Someone had to turn failures into examples an agent could act on. The agent is not replacing that judgment. It is spending it.

That sounds smaller than the marketing version. It is also much more useful.

A coding agent can grind through implementation work if the problem has a tight feedback loop. Decompilers are unusually good for that. You can run the tool on a corpus, compare output, find a regression, and point the agent at a concrete failure. Kuna's repository leans into this. The phases are separated, the feature switches are exposed, and important behavior is described in natural-language specs so an agent has something better than a vague tour of a Rust workspace.

That is the pattern I want more teams to copy. Not "let the agent build the thing." Build the harness first. Give the agent a narrow surface to change. Give it a failing case, a metric, and a test it cannot talk its way around.

The DecBench result also shows the trap. Metrics make agent work possible, but they also define what the agent will chase. If the metric is control-flow structuring, the system will get better at control-flow structuring. That is not a criticism. It is the point. But it means the human still owns the denominator. If the benchmark underrepresents a class of binaries, the agent will not magically care. If the metric rewards output that looks clean but loses semantic detail, the agent will learn that too.

This is where a lot of "autonomous research" claims get mushy. The system produces a paper, a benchmark, a chart, or a repository, and the output looks finished enough that people skip the boring audit. Kuna is different because the audit is the product. It exposes the working loop. It lets outsiders inspect the code, the tests, the specs, and the stated limitations.

That does not make the result automatically reproducible outside Basque's environment. DecBench is still an experimental, living benchmark. Independent runs will matter. The project still needs to prove it can improve the less mature parts of decompilation, not just the piece with a strong feedback signal. Those are real caveats, not footnotes.

But the caveats do not make the release less interesting. They make it a better model for agent-built software.

The lesson I take from Kuna is not that agents can write a decompiler. It is that agents can make serious progress when a domain expert turns taste into tests. The expert work moves up a layer. Less time typing boilerplate. More time choosing metrics, curating failures, and deciding which "improvement" is actually a bug with better vibes.

That is the boring half of agent engineering, and it keeps being the part that matters.

Sources: Zion Basque's Kuna release post, the Noelo-Lab/kuna repository, and RuntimeWire's July 29 coverage.
