---
title: "Your AI Bill Is a Routing Bug Now"
description: "AI costs are turning into an observability and routing problem. The right metric is not cost per token, but cost per accepted result."
pubDate: 2026-07-01T08:09:06Z
tags:
  - ai
  - programming
  - productivity
  - softwaredevelopment
---

# Your AI Bill Is a Routing Bug Now

AI used to be sold like a productivity cheat code. Give every developer a coding assistant, let every team wire up a chatbot, and treat the rising usage chart as proof that the company had become more productive.

That was the fun part. The bill is the part where the room gets quiet.

[Reuters reported this week](https://www.itnews.com.au/news/soaring-bills-reshape-how-businesses-choose-ai-models-627026) that companies are starting to hit the wall on AI costs. Uber reportedly burned through its entire 2026 AI budget in four months after employees rushed into AI coding tools. BlueRock CEO Harold Byun said some customers saw 20 to 30 percent over-budget spikes after license models changed. Gartner expects AI coding costs to surpass the average developer's salary by 2028.

That last line should bother people building with agents.

Not because AI coding tools are useless. They are not. The problem is simpler and more embarrassing: a lot of teams still route work like it is 2024. Every request goes to the biggest model they can buy, with the longest context they can fit, through an agent loop nobody is measuring per completed task.

That is not an AI strategy. That is a billing accident with a nicer dashboard.

## Tokenmaxxing was always going to break

The Reuters piece uses a good ugly word: "tokenmaxxing." It describes the early enterprise habit of treating more AI usage as automatically better. More prompts. More context. More tools. More generated output. More agent loops.

In a demo, that feels like momentum. In production, it becomes a unit economics problem.

A token bill does not care that the workflow felt magical. It cares about input size, output size, model choice, cache hits, retries, tool calls, and how many times the agent loops before it gives up. [BCG made the same point](https://www.bcg.com/publications/2026/managing-ai-token-costs) in a recent token-cost piece: the bill depends on prompt length, retrieved context, reasoning effort, tools, cache behavior, and loop count. In other words, the expensive part is often not the model call. It is the shape of the system around the model call.

Developers know this pattern from every other infrastructure layer. If a service gets slow, you do not immediately buy the largest instance and call it architecture. You profile it. You find the hot path. You cache the thing that repeats. You stop doing work that did not need to happen.

AI should not get an exception just because the output speaks English.

## The cheapest model is not the answer either

The obvious reaction is to swing too far the other way: replace frontier models with smaller models everywhere, declare victory, and wait for the quality bugs to show up in customer support.

That is also lazy.

The interesting number in the Reuters report is not just that Chinese and open-source models are cheaper. It is that open-source tokens processed through OpenRouter reportedly jumped to 65 percent in June from 34 percent in January, according to a Citi note. That means teams are not only hunting for cheaper models. They are starting to accept model choice as a runtime decision.

That is the right direction. But cheap-first routing only works if you measure the full task, not the sticker price.

A smaller model that answers in one call is cheaper. A smaller model that fails, retries twice, escalates to a bigger model, and still needs a human cleanup pass may be more expensive than using the better model first. The same is true for latency. A cheap fast path is great until the fallback path becomes the common path.

The metric I would watch is not cost per million tokens. It is cost per accepted result.

That includes retries. It includes fallback rate. It includes latency. It includes the boring human review step nobody wants to count because it ruins the spreadsheet.

## Model routing is becoming normal engineering

The mature pattern is not complicated. It looks like a request gateway with judgment.

Simple extraction goes to a small or specialized model. Classification might not need a language model at all. A deterministic policy check should be code. A support reply draft might start with a cheaper model and escalate only when confidence is low. A gnarly refactor or incident analysis earns the expensive model because the cost of being wrong is higher than the cost of the tokens.

That sounds obvious when written down. Most waste in software does.

The hard part is making the routing policy visible. Every request should carry enough metadata to answer basic questions later: which app sent it, which team owns it, which model handled it, how many tokens went in and out, whether the response was accepted, whether it retried, whether it escalated, and what the final cost was. [CIO called this](https://www.cio.com/article/4184596/tokenomics-in-enterprise-ai.html) token telemetry at the request level, aggregated by app, environment, team, model, and use case. That is the right level of boring.

Without that telemetry, the cheapest model debate is mostly vibes. With it, you can make changes like an engineer instead of a procurement team.

## The agent tax is where budgets disappear

This matters more for agents than for chatbots.

A normal chatbot turn is one prompt and one response, maybe with retrieval. An agent turn can include planning, tool schemas, tool results, history, retries, reflection, validation, and a final answer. If it gets stuck, it can burn money very politely for several more loops.

That is why agent workflows need budgets as a design primitive, not a finance afterthought.

I want every production agent to know its ceiling: max tokens, max tool calls, max retries, max wall time, and a clear rule for when it should stop and ask for help. Not because constraints make agents weaker. Because unbounded autonomy is just a while loop with a credit card.

There is a useful split here:

- Use software for deterministic work.
- Use small models for cheap, narrow judgment.
- Use frontier models for the hard tail.
- Use humans when the cost of a wrong answer is higher than the cost of waiting.

That is not anti-AI. It is pro-not-waking-up-to-a finance escalation.

## What I would build before buying more tokens

If I were cleaning up a messy AI stack, I would not start by swapping vendors. I would start with five boring controls.

First, log every model call with task type, model, input tokens, output tokens, latency, retries, fallback path, and accepted or rejected outcome. No dashboard poetry. Just the facts.

Second, cap output length by default. Long answers are one of the easiest ways to waste money because output tokens usually cost more than input tokens.

Third, move stable context into cacheable prefixes where the provider supports it. Giant system prompts and policy blobs should not be paid for from scratch on every request.

Fourth, route by task class before routing by brand. Extraction, summarization, code review, planning, customer support, and incident analysis are different jobs. They should not share one default model just because it made the first demo look good.

Fifth, measure cost per accepted result. If a cheaper path creates more retries, more escalations, or more human cleanup, it is not cheaper. It is just hiding the cost somewhere else.

The AI labs will keep cutting token prices. Open-source models will keep getting better. Frontier models will keep being worth it for some work. All of that can be true at once.

The teams that win will not be the ones that always pick the newest model or always pick the cheapest one. They will be the ones that treat model choice like infrastructure: measured, routed, capped, cached, and reviewed.

The bill is not a mystery. It is a trace.

If you cannot explain where the tokens went, you do not have an AI problem yet. You have an observability problem.


---

Originally published at [komoai.live](https://komoai.live/ai-bill-routing-bug).
