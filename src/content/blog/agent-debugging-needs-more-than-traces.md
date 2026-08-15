---
title: "Agent Debugging Needs More Than Traces"
description: "AgentDebugX is an open-source toolkit for LLM agent debugging. The useful lesson is that traces are raw evidence, not root cause."
pubDate: 2026-07-23T00:57:48Z
tags:
  - ai
  - programming
  - agents
  - debugging
---

A useful paper dropped this week because it names the failure mode almost every agent builder eventually hits.

The step where an agent fails is often not the step that broke the run.

That sounds obvious until you debug one in anger. The final answer is wrong, the last tool call looks suspicious, the trace is 80 events long, and the actual mistake happened 30 steps earlier when the agent accepted a bad retrieval result, dropped a constraint, or handed a task to the wrong sub-agent. By the time the error surfaces, the evidence is smeared across the whole trajectory.

AgentDebugX, a new open-source toolkit from researchers at UIUC, Toronto, Google, Stanford, and others, tries to turn that mess into a closed debugging loop. It is not another dashboard that says “here are your spans, good luck.” The loop is detect, attribute, recover, rerun.

That shape matters more than the particular benchmark number.

Most agent observability stops at trace replay. Replay is necessary, but it is not diagnosis. A trace can tell you what happened. It does not automatically tell you which earlier decision made the rest of the run unrecoverable, or what should change before the rerun.

AgentDebugX is interesting because it treats the failed run as evidence, not just logs.

It normalizes execution into a portable trace format, finds visible failures, traces symptoms back to likely root causes, proposes a fix, and packages a rerun from a checkpoint. The paper calls the main diagnostic component DeepDebug. It reads the trajectory globally, investigates candidate causes, cross-examines competing explanations, and emits an auditable root-cause report with evidence and a concrete repair.

That is exactly the direction agent tooling needs to move.

## The trace is not the incident

A conventional web service usually gives you a cleaner failure surface. A request errors. A database call times out. A queue backs up. You still need judgment, but the system usually has crisp mechanical boundaries.

Agents are worse. They can fail while looking reasonable.

A bad run may include valid tool calls, plausible intermediate reasoning, clean JSON, and a final answer that is still wrong. The bug is not always a crash. Sometimes it is a quiet semantic drift. The agent forgot a constraint. It trusted stale memory. It searched the wrong thing and built on it. It made a planning choice that only became visibly wrong much later.

This is why “show me the trace” is not enough. Traces are raw material. They are not root cause.

The useful unit is closer to an incident bundle. It should include the trajectory, the suspected root-cause step, the evidence for that suspicion, the proposed correction, and the rerun result. Once you have that, the failure becomes reusable. It can become a regression case instead of a one-off debugging session that disappears into Slack.

That is the part I like about AgentDebugX’s Error Hub idea. A scrubbed failure bundle can be stored, compared, and replayed. In normal software terms, it is the difference between “someone remembers this broke once” and “we added a test.”

Agents need more of the second one.

## Attribution is the hard part

The paper reports two results worth paying attention to, with the usual caveat that benchmarks are not production.

On Who&When, DeepDebug reaches 28.8 percent strict agent-and-step attribution accuracy with qwen3.5-9b, compared with 21.7 percent for the strongest single-pass baseline. On GAIA, it repairs 13 of 73 failed tasks in a single rerun, compared with 4 to 6 repairs for three decoupled self-correction baselines, raising overall accuracy from 55.8 percent to 63.6 percent.

Those are not magic numbers. They are small enough to keep everyone honest. But they point at the right bottleneck.

Self-correction often treats the last answer as the object to fix. Agent debugging needs to treat the whole run as the object to inspect. The important question is not “can the model try again?” It is “does the system know where the previous run went off the rails?”

That distinction is easy to miss because both workflows can look similar from the outside. Both rerun. Both ask a model for help. Both may produce a better answer.

The difference is whether the rerun is grounded in a diagnosis.

Without attribution, reruns are expensive hope. With attribution, they become a testable intervention. You can ask whether changing step 18 actually fixed the outcome, or whether the system merely got lucky on the second pass.

That is the line between agent demos and agent operations.

## What I would steal from this

If you are building agents, you probably do not need the full AgentDebugX stack tomorrow. You do need the shape.

First, make every run exportable. Not “we can look at the vendor dashboard.” Exportable. You want stable event IDs, tool inputs and outputs, model choices, prompts or prompt hashes, retrieval results, handoffs, and enough state to reconstruct the path. If the trace only lives inside one platform, it will be painful the moment you need to compare frameworks or reproduce an incident outside the happy path.

Second, separate detection from attribution. Detection says the output failed, a tool call errored, the agent looped, or a constraint was violated. Attribution says which earlier decision probably caused it. Those are different jobs. Mixing them produces the familiar postmortem where everyone blames the last visible error because it is the easiest thing to point at.

Third, store failed runs as regression cases. The paper’s Error Hub framing is useful here, even if you implement it as a boring folder of JSON files. Keep the failure, the suspected root cause, the fix, and the rerun outcome together. Future agents should have to pass against yesterday’s weird failures, not just a synthetic benchmark.

Fourth, treat recovery as a controlled rerun, not a vibes retry. If the fix is “change the retrieval query at step 12,” rerun from that checkpoint and compare branches. If the system cannot checkpoint, it cannot really debug long-horizon behavior. It can only start over and hope the dice land better.

None of this is glamorous. It is mostly plumbing. That is usually where the leverage is.

## The uncomfortable limit

There is one thing I would not overclaim.

AgentDebugX still relies on diagnostic judgment. DeepDebug can cross-examine candidates and produce evidence, but silent semantic drift is a nasty target. Some failures do not have one clean root cause. A bad instruction, weak retrieval, over-broad tool permission, and missing verifier can combine into a run that fails slowly.

So I would not treat attribution as an oracle. I would treat it as a hypothesis generator with an audit trail.

That is still a big improvement over raw traces.

The industry keeps talking about agents as if the next step is more autonomy. Maybe. But the more practical next step is better evidence. If an agent can touch tickets, shells, repos, customer data, or budgets, the debugging surface cannot be a scrollback and a shrug.

The standard I want is boring and strict. Every important agent run should leave behind enough evidence that a different person, model, or future version can answer three questions.

What failed?

Where did it start failing?

What changed when you reran it?

Until you can answer those, you do not have an agent platform. You have a clever process that forgets its own incidents.

Source: [AgentDebugX paper](https://arxiv.org/abs/2607.18754) and [project site](https://www.agentdebugx.com).
