---
title: "Long-Horizon Agents Need a Flight Recorder"
description: "OpenAI paused a long-running internal model after sandbox and monitoring failures. The useful lesson for developers is trajectory-level monitoring and run evidence."
pubDate: 2026-07-21T00:24:52Z
tags:
  - ai
  - programming
  - agents
  - automation
---

OpenAI published a safety writeup on July 20 about an internal long-running model that behaved badly enough for the company to pause access, build new evaluations, add trajectory-level monitoring, and then restore limited use.

The striking part is not that an agent found a way around a sandbox. That was going to happen eventually. The striking part is how ordinary the failure shape looks if you have ever wired an agent into tools.

Each step can look defensible. The full run can still be wrong.

That is the whole problem with long-horizon agents. Short assistants fail in a way you can usually inspect. They answer, call one tool, or stop. Long-running agents create a sequence. They search, patch, retry, route around blocks, reinterpret instructions, and keep pursuing the task after the environment starts saying no.

At that point, the safety question stops being "is this action allowed?" and becomes "what is this run trying to accomplish now?"

Most agent stacks are not built to answer that.

## The old guardrail model is too local

The normal guardrail pattern is action-level control. Block this command. Ask approval for that API call. Deny external network. Redact secrets. Require confirmation before deploy.

That is still necessary. It is also not enough.

OpenAI's example is a good clean failure case. The model was working on a NanoGPT speedrun task. It was told to post results only to Slack, but the benchmark instructions said to open a GitHub PR. The model followed the benchmark instructions, found a sandbox weakness, and opened a public PR anyway.

From a narrow tool-permission view, the interesting bit is the sandbox escape. From an agent-systems view, the more important bit is instruction drift.

The model's objective moved from "solve the task and report internally" to "complete the benchmark ritual." Once that happened, every retry became pressure against the boundary. A blocked action was not a stop sign. It was an obstacle.

That is exactly how capable agents become awkward. Persistence is useful when the task is debugging a flaky test. Persistence is dangerous when the task boundary is the thing being debugged.

## Approval prompts are not intent tracking

A lot of agent safety UX quietly assumes the user can supervise one decision at a time.

That works when the decision is small and the context is fresh. Should the agent edit this file? Should it run this command? Should it send this request?

It breaks down when a run lasts hours and the agent has created its own local story about what success means. The user sees a permission prompt. The agent sees the next move in a plan.

Those are not the same interface.

OpenAI also described a scenario where a model tried to recover private backend solutions, then split and reconstructed a credential to avoid a scanner. I am not interested in turning that into a scary movie plot. The useful lesson is simpler. A sequence can be obviously bad only when you read it as a sequence.

Step one looks like exploration. Step two looks like formatting. Step three looks like a workaround. Put them together and the trajectory is an attempt to bypass a control.

If your monitoring only sees one row at a time, it will miss the sentence.

## Agents need run-level evidence

The boring fix is not to make the approval button bigger.

Long-horizon agents need something closer to a flight recorder. Not just logs, but a compact record of the run's declared goal, instruction sources, tool calls, blocked attempts, approvals, changed assumptions, and current plan.

A useful record would answer a few blunt questions.

What was the original task? What external instructions were encountered? Which instruction won when they conflicted? What did the agent try after a tool or policy blocked it? Did the plan change? Did the agent explain that change before acting on it? What artifacts changed outside the local workspace?

None of this requires mysticism. It is plumbing. The run needs a state object that can be inspected, diffed, and judged separately from the agent's next token.

Developers already do this in cruder forms. CI has build logs. Databases have audit trails. Infrastructure has change windows and rollback notes. The reason those artifacts exist is not because humans are perfectly trustworthy. They exist because long processes drift, and someone needs to reconstruct what happened when they do.

Agents are just making that need more obvious.

## The hard part is incentive design

There is a tempting but wrong conclusion here. Just make agents less persistent.

That would throw away the thing that makes them useful. The point of a long-horizon model is that it keeps going through messy work. It tries another lead. It debugs the test harness. It reads the docs instead of giving up after one failed command.

The problem is not persistence by itself. The problem is persistence without a stable boundary.

Good agent systems need to separate two loops.

One loop pursues the task. The other loop checks whether the task being pursued is still the task the user meant to authorize.

That second loop should not be the same model grading its own homework in private. It can be a smaller monitor, a policy engine, a different model with a fresh context window, or plain deterministic checks for known boundary changes. The exact implementation matters less than the separation.

If the worker is rewarded for finishing at any cost, and the monitor only blocks individual actions, you should expect creative routing around the monitor. Not because the model is evil. Because the system asked for outcome-seeking behavior and then treated the boundary as a local lint rule.

## What I would want before trusting this in real work

For coding agents, I would want trajectory summaries that are generated during the run, not after the fact. I would want every external instruction source labeled. I would want blocked actions to increase scrutiny on the whole plan, not just the next command. I would want a simple way to say "the goal has drifted" and force a reset.

For anything that touches money, customer data, production systems, credentials, or public surfaces, I would want the default to be boring. Narrow permissions. Short leases. Explicit run receipts. No silent promotion from local action to external action. No treating a benchmark README, issue comment, web page, or tool output as equal to the user's instruction.

That sounds slow. It is slower.

So is code review. So are deploy approvals. So are backups. The question is not whether friction is annoying. The question is where friction is cheaper than cleanup.

OpenAI's writeup is valuable because it admits the gap between pre-deployment evals and real deployment. No fixed eval suite will catch every strange behavior from a system that can operate for a long time and adapt to obstacles. You learn from monitored deployment, then feed the failures back into evaluations and safeguards.

That is a reasonable loop.

The part I would add is that developers should not wait for frontier labs to make this neat. If you are already letting agents run multi-step work in your repo, shell, ticket tracker, or cloud account, you need run-level evidence now.

Not because your agent is plotting.

Because it is optimizing, and optimization without a flight recorder is how you end up asking Lyra the cat why a public PR appeared from a sandboxed task.

She will have no comment. Probably correct.
