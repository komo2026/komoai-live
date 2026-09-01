---
title: "On-Policy Distillation Works Better Without the Teacher"
description: "A new Purdue paper analyzed teacher supervision in on-policy distillation. The teacher scores are mostly noise, and a fixed negative penalty beats a full teacher model on AIME24 by 16 points."
pubDate: 2026-09-02
tags: ["AI", "LLM", "Machine Learning", "Distillation", "Reasoning"]
---

On-policy distillation has become one of the standard recipes for training small reasoning models. If outcome-level reinforcement learning with verifiable rewards gives you sparse feedback only at the end of a long chain of thought, on-policy distillation offers dense token-level advantages. The student generates rollouts, and a larger teacher model scores every token along the path.

A new paper from Purdue researchers Yi Ding and Ruqi Zhang examined what that teacher actually does during training.

Their finding is that teacher supervision in on-policy distillation is largely noise, and larger teacher models produce more noise, not less. Even more surprising: when they stripped out the teacher entirely and replaced its advantage scores with a simple negative penalty on low-probability tokens, the student achieved identical or better performance.

### What the Teacher Actually Emits

In standard on-policy distillation, the student model samples a full reasoning trajectory. The teacher then evaluates the sequence and assigns an advantage score to each token to guide the policy gradient.

Because the student generated the text, the sequence is off-policy for the teacher. When Ding and Zhang measured the agreement between teacher token advantages and true ground-truth rollouts, they found high error rates across the entire generation path. Scaling up the teacher size did not clean up the signal. Larger teacher models exhibited higher token-level noise when scoring student-generated reasoning paths.

The researchers ran an ablation where they removed the noisy teacher advantages. The student policy converged to the same final benchmark scores whether noisy supervision was included or filtered out.

### The Mechanism Under the Hood

To understand why the student model ignores teacher noise, the authors analyzed which tokens drive gradient updates during training.

Learning concentrates almost entirely on low log-probability tokens. The policy gradient primarily suppresses unlikely tokens that appear in the student rollout. When the authors replaced the teacher advantage with a single static negative scalar for low-probability tokens, the student matched the accuracy of standard teacher-guided distillation.

The teacher was not teaching reasoning steps or subtle heuristics. The training loop was simply using the loss function to penalize tail tokens and push probability mass toward the top candidates.

### On-Policy Self-Adaptation (OPSA)

Once you recognize that distillation works by pruning tail tokens rather than transferring teacher knowledge, you can remove the teacher from the pipeline entirely.

The authors introduced On-Policy Self-Adaptation (OPSA). Instead of running a secondary model to score tokens, OPSA calculates entropy-adaptive negative advantages directly from the student distribution. At high-entropy token positions where the model faces branching paths, it applies a stronger penalty to tail tokens and redistributes probability mass across the remaining head tokens.

The empirical results on reasoning benchmarks show significant gains over traditional teacher distillation:

1. **AIME24 Performance**: On Qwen3-1.7B, OPSA improved Avg@32 by 35.41 points (a 263% relative gain from base), beating standard on-policy distillation with a teacher by 16.77 points.
2. **Pass@32 Gains**: Pass@32 more than doubled across all three evaluation benchmarks.
3. **Compute Efficiency**: The entire training loop runs without loading a teacher model into memory or running forward passes for teacher token scoring.

### Practical Implications for Builders

Running a teacher model in an on-policy training loop adds substantial operational overhead. You need enough GPU memory to host both the student and the teacher, and you spend compute on teacher forward passes for every generated token.

If token-level distillation is primarily an entropy regularizer that suppresses tail hallucinations, keeping a 70B teacher in the loop is unnecessary engineering overhead. Self-adaptation methods like OPSA demonstrate that small models can clean up their own reasoning distributions without paying the compute tax of teacher supervision.
