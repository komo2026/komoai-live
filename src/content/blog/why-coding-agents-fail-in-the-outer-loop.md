---
title: "Why Coding Agents Fail in the Outer Loop"
description: "Alibaba's LoopArena benchmarks models as runtime controllers for coding agents, decoupling supervisor routing from code generation."
pubDate: 2026-09-01T00:40:00+08:00
tags:
  - ai
  - agents
  - devtools
  - benchmarks
---

Alibaba's DreamX team and researchers from UNSW published LoopArena on arXiv yesterday (2608.28281). The benchmark evaluates how well language models act as runtime controllers for long-running coding agents.

Most multi-step agent frameworks have quietly moved away from single-prompt execution. When you run tools like Claude Code or Devin on an issue, you are running an outer loop. That loop parses the task, feeds instructions to a worker model, captures diffs and test logs, checks progress notes, and decides whether to continue, redirect, or terminate.

The problem with standard benchmarks like SWE-bench is that they treat the entire run as a single opaque attempt. If an agent fails to resolve an issue, the final error log does not tell you where the breakdown happened. The coding model might have written invalid syntax, or the loop supervisor might have accepted a hallucinated test pass, ignored a regression, or terminated three steps too early.

## Separating the controller from the worker

LoopArena isolates that failure surface by splitting the system into two distinct roles:

1. The Worker is a fixed coding agent that edits files, runs terminal commands, and runs test suites.
2. The Controller is the model being tested. After each execution step, it receives a structured run summary and chooses the next action: issue a new contract, run a specific verification check, roll back, or submit.

```
+-------------------------------------------------------------+
|                      Controller                             |
|  - Reads structured run summary                             |
|  - Validates exit criteria                                  |
|  - Issues next contract / verification / abort              |
+------------------------------+------------------------------+
                               |
                        Loop Contract
                               |
                               v
+-------------------------------------------------------------+
|                        Worker                               |
|  - Executes shell commands and test runners                 |
|  - Generates code diffs                                     |
|  - Emits execution output and error logs                    |
+-------------------------------------------------------------+
```

The benchmark tests controllers across three tiers of execution cost:

- Type I: Static questions that test whether a controller picks the correct next step on historical execution traces. This runs without spinning up a live environment.
- Type II: Interactive control over targeted slices of a development task, measuring multi-step recovery on specific sub-problems.
- Type III: Full long-horizon tasks executed from an initial repository state to completion.

## The numbers from the paper

The empirical results show how fragile current loop supervision remains when tasks run long:

- Low completion ceiling: On full Type III tasks, the highest Strict Success Rate across tested controllers was 24.69%. Even with a capable code generation model underneath, supervisor models struggle to guide multi-file changes to completion.
- Token savings from active pruning: Effective controllers reduced total inference cost by an average of 64.4%. Good loop routing cuts out redundant test cycles, prevents circular edits, and aborts doomed trajectories before burning token budget.
- Slice evaluation predicts full runs: Type II slice evaluation had a 0.9747 Spearman rank correlation with full Type III runs. Teams can benchmark supervisor prompts on short execution segments instead of spending hundreds of dollars per full-repository run.

## Why loop contracts matter for builders

When developers build agent harnesses, the instinctive move is to upgrade the base model or dump more documentation into the context window. LoopArena highlights that runtime control policy often causes the failure before context limits become an issue.

A common failure mode in production loops is accepting stale progress notes. A worker claims it fixed a bug in a docstring, and the supervisor terminates without running the test suite. Another failure mode is loop thrashing, where a worker alternates between two conflicting edits while the supervisor blindly reports that progress is being made.

Fixing these failure modes requires strict contract enforcement between the loop supervisor and the worker:

- Enforce verification gates: Require explicit, executable test passes before marking any sub-task complete. Never allow the supervisor to accept a worker's natural language assurance.
- Track diff budgets: If an agent changes the same five lines three times without changing test status, the supervisor should force a rollback rather than issuing another free-form retry.
- Separate observation from decision-making: Feed the supervisor a sanitized execution summary rather than the full raw terminal scrollback to keep control decisions grounded.

The repository and evaluation code are available on GitHub at AMAP-ML/LoopArena.
