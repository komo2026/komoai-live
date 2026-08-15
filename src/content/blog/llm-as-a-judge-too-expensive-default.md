---
title: "LLM-as-a-Judge Is Too Expensive to Be the Default"
description: "LLM judges are useful, but too expensive and opaque to be the default for every agent eval. Programmatic judges make the boring failures cheap to catch."
pubDate: 2026-07-28T16:39:55Z
tags:
  - ai
  - machinelearning
  - llm
  - agents
---

LLM-as-a-judge became the default because it is convenient. You write a rubric, hand the model two answers, and ask which one is better. For prototypes, that is hard to beat. For production evals, it quietly turns into another inference pipeline with all the usual problems.

It is slow. It costs money per sample. It is hard to inspect when the answer looks wrong. And when an agent run has twenty tool calls, five files, and three hidden failure modes, asking another model to squint at the transcript starts to feel less like engineering and more like outsourcing the confusion.

That is why a new paper, [Codifying the Judge](https://arxiv.org/abs/2607.22561), is worth paying attention to. The useful idea is not another bigger judge model. It is smaller and more annoying in the best way. Instead of calling an LLM at evaluation time, it distills parts of the judge into programs.

The paper calls the system PAJAMA. It synthesizes a committee of programmatic judges, aggregates their verdicts, and only falls back to an LLM when the programs are uncertain. In plain English, the expensive model helps write the grading machinery. The grading machinery then handles the boring cases directly.

That feels like the right direction for agent evaluation.

## Watch the breakdown

I also recorded a ~10-minute walkthrough of the paper and the cost/bias arguments:

{% youtube Oqj8XtQYmgk %}

Channel: [youtube.com/@komobuild](https://www.youtube.com/@komobuild)

## The problem with model judges

LLM judges are not useless. I use the pattern. Most people building agents use some version of it because there are many failures a simple unit test will not catch.

A coding agent can pass the test suite while quietly deleting the migration note. A research agent can cite the right source but answer the wrong question. A support agent can be polite, grounded, and still ignore the one constraint the user cared about.

Those are judgment problems, so we reach for a judge model.

The trouble is that model judges scale badly. If every candidate answer, retrieval result, tool trace, or agent trajectory needs another model call, evaluation becomes part of the product's cost structure. Worse, the judge is usually another black box. When it says a response is better, you still need to ask why, then decide whether you trust the explanation.

At some point the eval stack starts looking like the thing it is supposed to measure.

## Programs are a better default for boring judgments

PAJAMA's move is simple. Take the rubric and distill judge behavior into executable checks. Not one giant brittle rule, but a committee of programs that each captures part of the decision. The system then combines those program outputs into a verdict and routes low-confidence cases back to an LLM.

The numbers are the headline. The paper reports that standalone programmatic judges can match the accuracy of an OLMo-2-13B-Instruct judge while running 47.25 times faster. In hybrid mode, PAJAMA improves the accuracy-throughput tradeoff, including a reported 5.0 percent accuracy gain at 2.9 times throughput when paired with OLMo-2-7B-Instruct.

The more important part is operational. A program can be inspected. A program can be edited. A program can be versioned in the same repo as the agent it evaluates. If the judge says a run failed because the final answer missed a required field, I would rather see the check than read a paragraph of model confidence.

This is not glamorous. That is the point.

## The CI-shaped version of agent evals

The obvious objection is that programs cannot judge everything. True. They should not try.

A program can check whether the answer used the requested format. It can check whether a tool was called before a claim was made. It can check whether citations point to the retrieved documents. It can check whether a patch touched files outside the allowed directory. It can check whether the final response includes an unsupported promise.

A program is worse at judging taste, ambiguity, and genuinely open-ended reasoning. So do not make it judge those alone. Use it as the first pass. Let it catch the boring failures cheaply, then escalate the weird cases to a model or a human.

That is much closer to how normal CI works. Unit tests do not prove the software is good. They make the common failures cheap enough to catch every time.

Agent evaluation needs the same split. Deterministic checks for the parts you can name. Model judgment for the parts you cannot reduce yet. Human review for the parts where being wrong is expensive.

## What I would steal from this paper

If I were wiring this into an agent stack, I would not start by trying to reproduce PAJAMA end to end. I would steal the shape.

Start by splitting the rubric into small claims. "Good answer" is not a check. "Uses the retrieved source for every factual claim" is closer. "Does not modify files outside the requested package" is better.

Then write or synthesize tiny judges for those claims. Some will be plain Python. Some will be AST checks. Some will be schema checks. Some may still use a small model, but only where the boundary really needs language understanding.

Keep disagreement logs. If the program judge and the LLM judge disagree, that is not noise. That is training data for the eval system itself.

Make fallback explicit. The goal is not to ban LLM judges. The goal is to stop using them as the first tool for every sample. A good fallback threshold is boring infrastructure, which is exactly why it matters.

The practical win is not just lower cost. It is that the evaluation becomes an artifact you can debug.

## The boring future is probably right

There is a pattern in AI tooling that keeps repeating. We start with a giant model doing everything because it gets us moving. Then the useful parts get carved out into smaller, cheaper, more legible systems.

RAG did this. Routing is doing this. Agent orchestration is doing this. Evaluation is next.

LLM-as-a-judge will not disappear. It is too useful for messy cases. But making it the default for every eval is like running the full integration suite for every lint error. Sometimes the answer should be a Python function with a name, a test, and a failure message.

That is less magical. Good.

Where would you draw the boundary in your own agent stack — model judge first, or program judge first?
