---
title: "Nvidia's Router Is the Part of Agents Everyone Keeps Rebuilding"
description: "Nvidia Switchyard points to the boring part of production agents: model routing, per-step cost, escalation rules, and evals."
pubDate: 2026-08-11T16:27:13Z
tags:
  - ai
  - agents
  - nvidia
  - programming
---

Nvidia released Nemotron 3.5 Lightning yesterday, a 30B open mixture-of-experts model with 3B active parameters. It also released NeMo Switchyard, an open-source router that decides which model should handle each step of an agent workflow.

The model is useful. The router is the more interesting part.

Most agent stacks eventually hit the same ugly fork. You can send everything to the best model and pay for it, or you can write a little routing layer that sends easy steps to cheaper models. That little routing layer then starts growing teeth. It needs policies. It needs fallback logic. It needs evals. It needs to know when a cheap model is being confidently wrong. It needs enough logging that you can explain why a run cost $2.40 instead of $0.18.

At some point the agent is no longer one model. It is a small dispatch system with a model attached.

That is what Nvidia is trying to productize with Switchyard.

The headline claim is easy to remember. Nvidia says Switchyard can keep frontier-level task completion while cutting task-completion cost to nearly one-third of using Claude Opus 4.8 alone. In LangChain's internal deep-agents benchmark, routing between Nemotron 3.5 Lightning and Opus 4.8 cut cost by 74% across 145 multi-turn tasks, with only 7% of calls going to the frontier model and a 6% accuracy tradeoff. Ramp says it matched a frontier model on its internal SWE-Bench while cutting costs by 58% and runtime by 33%.

Those are vendor and partner numbers, so they should be treated like early benchmark claims, not physics. Still, the shape is right.

Agents are full of uneven work.

A single run might contain planning, tool selection, schema cleanup, retrieval, code editing, file inspection, summarization, validation, and a final answer. Some of those steps need the expensive model. A lot of them do not. If you route the whole run to the frontier model, you are buying fine judgment for jobs that mostly need decent parsing and patience.

This is why the boring execution layer matters. The useful split is not "big model versus small model". It is plan with the model that can think, execute with the model that is cheap enough to call all day, and escalate when the cheap path starts to smell wrong.

That sounds obvious when written down. It is less obvious when you have to maintain it.

A routing layer has to make decisions under uncertainty. If it is too aggressive, it saves money by quietly degrading the work. If it is too conservative, it becomes a decorative proxy in front of the same expensive model. The hard part is not calling model A or model B. The hard part is deciding when the current step is still safe for model B.

Switchyard is interesting because it treats that decision as infrastructure instead of application glue.

Nvidia describes it as a provider-agnostic SDK with both tuning-free and tunable routing algorithms. Developers define a pool of models, then tune routing for quality, latency, and cost. In other words, the model roster becomes a runtime surface. You stop hard-coding "use Claude here" and start expressing the tradeoff you want the system to make.

That is a healthy direction, with one catch. Routers need evals or they become vibes with invoices.

Cost reduction is easy to measure. Latency is easy to measure. Quality is the trap. A router can look great on average while failing exactly where the workflow needed the expensive model. The failures will not always be dramatic. They may be a slightly worse tool choice, a missed constraint in a policy document, a summary that drops one ugly edge case, or a code edit that passes the shallow test and breaks the thing a human would have noticed.

This is where most agent demos cheat without meaning to. They show a successful path through a task and leave out the accounting system that would catch the router making a bad bet. Production agents need the unglamorous parts. Per-step traces. Replayable eval cases. Confidence checks that are not just the model saying it is confident. Budgets. Escalation rules. Kill switches.

The router is not a magic cost cutter. It is a place to put your judgment.

I like that Nvidia is pushing this into the open-source stack because every serious agent harness has been growing its own version anyway. LiteLLM routes. LangChain routes. Internal platforms route. People write bash scripts that route. Then they add one exception, then another, then a spreadsheet of which model is "good at JSON this week". This is funny until it is the reason your agent bill doubled on a Tuesday.

A shared router will not remove that mess, but it can move the mess into a component that has names, tests, and knobs.

There is also an obvious business reason Nvidia cares. A fast 30B model is easier to sell when it has a defined job. Nemotron 3.5 Lightning does not have to beat the frontier model at everything. It has to be cheap and good enough for the repeated execution steps that make agents expensive. Switchyard gives it a lane.

That may be the more honest future for open models. Not "this local model replaces the best closed model". More like "this model handles 70% of the run, this one handles validation, this one handles long-context planning, and the expensive model only gets the parts that justify the spend."

For developers, the practical takeaway is simple. If your agent workflow is starting to matter, model choice should not live in scattered if-statements.

Write down the steps. Decide which steps are allowed to use cheap models. Add a way to replay failures. Track cost per step, not just cost per run. Put escalation behind rules you can inspect. And assume every routing decision is a product decision, because it is. It changes quality, latency, reliability, and the monthly bill.

Nvidia's release is not important because one router will solve all of that. It is important because it says the quiet part out loud.

The agent stack is becoming a scheduler.

Sources: Nvidia's Nemotron 3.5 Lightning and Switchyard posts, Nvidia's Switchyard routing technical blog, VentureBeat, The New Stack.
