---
title: "Robots Don't Need an LLM in the Fast Loop"
description: "TurboVLA runs a VLA robot policy at 32 Hz under 1 GB VRAM. The bigger lesson is where not to put the LLM."
pubDate: 2026-07-30T16:40:17Z
tags:
  - ai
  - robotics
  - agents
  - devtools
---

# Robots Don't Need an LLM in the Fast Loop

A new robotics paper landed yesterday with the kind of claim that usually makes me reach for the footnotes. TurboVLA runs a vision-language-action policy at 32 Hz on an RTX 4090, uses 0.9 GB of inference VRAM, and reports 97.7% average success on LIBERO.

That is not a small optimization if it holds up. It is a different answer to a question the robotics stack has been quietly dragging around.

Should a robot use a large language model as the central interface between seeing, understanding an instruction, and moving?

TurboVLA's answer is basically no. Keep language. Keep vision. Keep instruction conditioning. Just do not put a multi-billion-parameter language model in the inner control loop unless the task actually needs open-ended language reasoning every 31 milliseconds.

That sounds obvious when phrased that way. A lot of good systems work is like that.

## The usual VLA path is expensive in the wrong place

Vision-language-action models are the family of policies that connect camera observations, natural-language instructions, and robot actions. The common shape has been V to L to A. Vision gets projected into a language-model representation, the instruction joins it, the LLM processes the combined state, and some action head turns the result into robot commands.

That buys semantic generalization. It also puts the most expensive part of the model right where latency hurts most.

If a robot is already executing an instruction like "stack the three bowls," the inner loop is not writing a plan from scratch. It mostly needs to bind the instruction to the current scene and produce the next action chunk. The paper's useful bet is that this execution-level job does not require an LLM-shaped bottleneck.

TurboVLA changes the pathway to direct V plus L to A. It encodes the image and the instruction separately, lets them interact through lightweight bidirectional cross-attention, and decodes continuous action chunks with a compact ACT-style decoder. In the reported LIBERO setup, that whole online policy is about 0.2B parameters.

The plain translation is better than the fancy one. The robot still understands the task, but the control loop is not paying for a general-purpose text generator every time it moves.

## The numbers are the point, not decoration

On LIBERO, TurboVLA reports 97.7% average success across the Object, Spatial, Goal, and Long suites. The paper compares that with much larger VLA policies on the same RTX 4090 measurement setup. π0.5 is listed at 96.9% average success, 3.4B parameters, 12.8 GB VRAM, and 93.6 ms latency. TurboVLA is 0.2B parameters, 0.9 GB VRAM, and 31.2 ms latency.

That is the part worth caring about. Not because 97.7 is a magic number. Benchmarks are benchmarks. The efficiency gain does not appear to come from simply making a weaker tiny policy. The model is competitive while removing the LLM core from execution.

The paper also reports 60.2% average success on RoboTwin 2.0 across 50 bimanual tasks, compared with 57.0% for π0.5 under the reported setup. In real-world AgileX Piper tests, TurboVLA was fine-tuned from the LIBERO checkpoint on four tasks with 65 demonstrations per task, then evaluated over 40 trials per task. The reported success rates were 92.5%, 80%, 90%, and 87.5%.

I would not read those real-world numbers as "robotics is solved." Four tasks on one platform is not a warehouse, a kitchen, or a messy lab bench. But it is enough to make the architecture hard to wave away as a simulator trick.

## The ablations make the argument cleaner

The easy misunderstanding is to read TurboVLA as "language does not matter." The paper says the opposite.

Removing language drops average LIBERO success from 97.7% to 70.8%, with the Goal suite falling from 97.4% to 11.6%. A learned task-ID embedding recovers much of the performance, but still lands below semantic instructions. So the model is not just memorizing task labels and coasting on vision priors.

The narrower claim is better. Language matters. A giant generative language model may not be the right execution substrate.

The interaction module matters too. Simple concatenation gets 95.2% average success. One-way cross-attention improves that. Bidirectional vision-language interaction reaches 97.7%. That is a useful systems lesson inside a robotics paper. You can remove the expensive general core only if you replace it with the right smaller interface, not if you delete cross-modal reasoning and hope the decoder figures it out.

## This is the agent lesson again

The same pattern keeps showing up in agent systems. People put the largest model in the hottest loop because it is the easiest architecture to explain. The model becomes planner, parser, state machine, critic, memory layer, retry policy, and sometimes the world's most expensive `if` statement.

It works. Until latency, cost, and blast radius become the actual product constraints.

TurboVLA is a robotics version of the same correction. Use the big semantic machinery where broad reasoning is needed. Do not make every execution step route through it by default. Once the task is specified, the loop wants a small policy with the right inputs and the right feedback cadence.

That distinction is going to matter more as "agent" systems leave chat boxes and start touching browsers, terminals, tickets, budgets, and robots. The expensive model can decide what needs doing. The fast path should often be something narrower, more inspectable, and easier to run close to the machine.

A 32 Hz robot policy makes the point more dramatically than a cron job does.

## The part I would watch next

The obvious next questions are not whether TurboVLA beats every model on every table. They are more practical.

Does the direct V plus L to A design keep working when the instruction space gets messier? How far can it stretch beyond execution-level manipulation into tasks that require replanning, tool choice, or recovery from ambiguous failures? Where is the clean handoff between a slow planner and a fast controller?

That last boundary is where the useful work probably sits. Not "LLMs for robots" versus "no LLMs for robots." That framing is too blunt.

A better design question is where the LLM should sit.

If the answer is "not inside the 31 ms loop," TurboVLA is a pretty good argument.

Source: [TurboVLA: Real-Time Vision-Language-Action Model at 32 Hz on an RTX 4090 with <1 GB VRAM](https://arxiv.org/abs/2607.27205). Code: [H-EmbodVis/TurboVLA](https://github.com/H-EmbodVis/TurboVLA).
