---
title: "Stop Dumping Agent Memory Into the Prompt"
description: "AgenticSTS treats long-horizon agent memory as a typed, bounded contract. That is more useful than another bigger-context benchmark."
pubDate: 2026-07-03T13:32:24Z
tags:
  - ai
  - agents
  - programming
  - llm
---

# Stop Dumping Agent Memory Into the Prompt

Long-horizon agents keep getting evaluated like the main problem is intelligence. I think that hides the boring part that actually breaks: what the next decision is allowed to remember.

A new paper, **AgenticSTS: A Bounded-Memory Testbed for Long-Horizon LLM Agents**, is interesting because it does not treat memory as a bigger context window contest. It treats memory as an interface.

That sounds small. It is not.

Most agent loops still default to the same pattern: append prior observations, tool calls, reasoning traces, reflections, and whatever else seems useful into the next prompt. It is easy to build. It is also how you end up with a prompt that becomes a junk drawer. The model can see more, but you no longer know which piece of memory caused the decision.

AgenticSTS makes a sharper bet: do not append the raw transcript. For each decision, compose a fresh prompt from typed slots.

The paper uses Slay the Spire 2 as the testbed, which is a good choice. It is not a toy chat benchmark where remembering one user preference counts as memory. A run has hundreds of tactical and strategic decisions: fights, cards, relics, paths, shops, events, health tradeoffs, and delayed consequences. The rules are closed and text-readable, but the run is still stochastic enough that simple replay does not solve it.

That is exactly the kind of environment where agent memory starts to matter.

## The useful idea: memory as a contract

The paper's cleanest line is this: memory is a contract about what each future decision is allowed to see.

I like that framing because it forces an uncomfortable question. When an agent improves, did the memory layer help, or did you just stuff more context into the model until something worked?

AgenticSTS splits each decision prompt into five layers:

1. fixed protocol instructions
2. current state and legal action schemas
3. retrieved game rules
4. episodic summaries from prior runs
5. triggered strategic skills

The important part is not the exact five-layer design. The important part is that each layer can be inspected, frozen, disabled, or compared. Raw cross-decision transcripts are not appended.

That turns memory from “whatever still fits in the context window” into “which typed evidence was selected for this decision.”

For developers building agents, that is the part worth stealing.

A lot of production agent failures are not mysterious model failures. They are context failures. The agent remembered the wrong thing, forgot the right thing, mixed stale state with fresh state, or carried a reflection forward after the world changed. If your only memory policy is “append more,” debugging becomes archaeology.

A typed memory interface gives you something to diff.

## The result is modest, which makes it more useful

The paper does not claim a clean victory lap, and that is a point in its favor.

In the fixed lowest-difficulty setting, the no-scaffold baseline wins 3 out of 10 games. Adding triggered strategic skills reaches 6 out of 10 in the scaffolded cells. The authors are careful about the sample size: Fisher's exact test for 3/10 vs 6/10 is around p = 0.37, so this is directional, not statistically decisive.

That caveat matters. A weaker paper would have turned “3 wins became 6 wins” into a sweeping claim about agent memory. This one mostly says: here is a reusable testbed where the memory layers are separable enough to study.

That is the better contribution.

The release includes 298 completed trajectories, condition tags, frozen memory and skill snapshots, prompt records, and analysis scripts. That matters more than the headline win rate. It means someone else can add an accumulating-context row, keep the game and scoring aligned, and test whether bounded memory actually beats transcript growth under matched conditions.

That is the experiment I want to see next.

## Why “just use a bigger context window” is not enough

Bigger windows help. They are also a seductive way to avoid designing memory.

If the agent is doing a short task, appending history is often fine. For a long-running agent, the prompt turns into a mix of facts, outdated facts, partial plans, tool output, failed attempts, and model-written summaries of its own confusion. The bigger the window, the easier it becomes to pretend this is still memory instead of sediment.

The AgenticSTS contract pushes the opposite direction. Keep the online prompt bounded. Store the past in typed artifacts. Retrieve what the current decision needs. Make each memory path auditable.

That maps better to how I want agent systems to behave in real work.

If an agent is editing code, I do not want “everything that happened so far” in the next prompt. I want the current task, the relevant files, the latest failing test, the known constraints, and maybe a small set of hard-won notes from previous attempts. If an agent is processing documents, I want the current document state, the schema, retrieved source passages, and prior extraction mistakes that actually match the case at hand.

Memory should be selected. Not poured.

## The practical pattern

The paper is about a game, but the pattern transfers to boring developer automation pretty well:

- separate stable instructions from current state
- keep rules and references in a retrieval layer
- store prior experience as explicit records, not chat residue
- promote repeated fixes into triggered skills
- make every memory layer removable for testing

The last point is the one teams skip. If you cannot turn a memory layer off, you cannot know whether it helps. You can only know that the whole pile sometimes works.

A useful agent harness should let you ask boring questions:

Did episodic notes help, or did they add stale noise?

Did the skill library improve decisions, or did it only work for the model that generated it?

Did retrieval find the right rule, or did the model solve the problem from its base knowledge?

Did the agent fail because the model was weak, or because the memory contract fed it the wrong evidence?

Those questions are not flashy. They are how agent systems become maintainable.

## My take

Agent memory should stop being treated as a vibes layer.

The default should not be “append the transcript until the model gets confused, then summarize the transcript and hope.” The default should be a small contract: what goes into the next decision, where it came from, when it was written, and how to disable it.

AgenticSTS does not prove that bounded typed memory is always better than accumulating context. The paper is explicit about that. It does show a cleaner way to run the comparison.

For me, that is the important shift. The next useful agent benchmark is not the one with the longest task or the fanciest model. It is the one where you can change one memory layer and believe the result.

If your agent cannot explain what it was allowed to remember, it does not have memory yet. It has a prompt with a basement.

Where do you draw the line between useful memory and context hoarding?
