---
title: "Your RAG Eval Is Checking the Receipt, Not the Patient"
description: "Clinical RAG can pass grounding checks while citing evidence about the wrong entity."
pubDate: 2026-07-13T13:33:41Z
tags:
  - ai
  - rag
  - llm
  - programming
---

# Your RAG Eval Is Checking the Receipt, Not the Patient

A new paper on clinical retrieval-augmented generation has a nasty little finding: a RAG answer can be fully grounded, cite real sources, pass faithfulness checks, and still be wrong in the way that matters.

The failure is entity attribution. The model is asked about drug X, retrieves evidence about drug Y, and then writes the answer as if Y's evidence applies to X. Nothing in the answer has to be fabricated. The citations can be real. The grounding score can look clean. The patient still gets the wrong inference.

That is worse than a normal hallucination because the usual alarms stay quiet.

The authors call it deceptive grounding. In their clinical setup, the system is not making things up from nowhere. It is doing something more boring and more dangerous: attaching a true statement to the wrong entity.

If you have shipped any RAG system, this should feel uncomfortably familiar. The bug is not limited to medicine. It is the same shape as a support bot citing the right changelog for the wrong product tier, a legal assistant mixing two similar clauses, or an internal docs bot applying the EU policy to the US workflow because both chunks sat next to each other in the context window.

The paper's headline numbers are ugly. Across 13 models under adversarial conditions, deceptive grounding rates ranged from 8% to 87%. Medical and biomedical fine-tuned models reached 86.7%, which is the part I would underline twice. Domain tuning did not automatically protect the system. In this setup, it made the wrong answer more fluent in the right vocabulary.

The production measurement is less dramatic and more useful: 7.8% deceptive grounding across 740 drug-disease pairs, rising to 13.6% for recently approved drugs. That makes sense. Newer entities have sparse evidence, so retrieval is more likely to pull adjacent evidence, and the generator is more tempted to smooth over the gap.

This is the core lesson: grounding is not attribution.

A faithfulness check asks, roughly, "Is this claim supported by a retrieved document?" Entity attribution asks the missing follow-up: "Is that document actually about the entity the answer claims it is about?"

Those are different tests.

A citation evaluator can pass the first and fail the second. A hallucination detector can miss the failure because the evidence exists. A human skimming the footnotes can miss it too, because the answer looks more responsible than an uncited answer.

That is why I dislike the way teams talk about RAG evals as if they are one checkbox. Retrieval quality, citation validity, answer faithfulness, entity attribution, and refusal behavior are separate failure surfaces. Collapsing them into a single "groundedness" score is convenient, but it hides exactly the class of bug this paper is pointing at.

The fix is not exotic. It is just less glamorous than adding another model call and calling it an evaluator.

For any high-stakes RAG system, the eval should force the answer through an entity check:

1. Extract each factual claim.
2. Identify the cited source for that claim.
3. Identify the primary entity in that source.
4. Compare it with the entity the answer is presenting the claim about.
5. Fail the answer if the source is real but attached to the wrong subject.

The authors report that entity-attribution verification caught deceptive grounding at 97.0% precision and 98.7% recall against their human gold standard. I would not treat those numbers as a universal guarantee. But the shape of the control is right. It tests the missing relation, not just the existence of evidence.

There is also a retrieval lesson here. If the retriever does not pull entity-specific evidence for drug X, the generator should not be asked to improvise from nearby evidence about drug Y. A good system should surface the gap, not polish it into an answer.

That is the annoying engineering part. Refusal paths, incomplete-evidence states, and "I found adjacent evidence but not evidence for the thing you asked" messages are not demo-friendly. They are what keep a RAG system honest.

The broader takeaway is simple: if your eval only checks whether the model cited something real, it is checking the receipt, not the purchase.

For ordinary docs search, that may be an acceptable bug. For clinical, legal, financial, or compliance workflows, it is not. The question is not just "did the model use the context?" It is "did it attach the right context to the right thing?"

That one extra question changes the whole eval.

Source: [Deceptive Grounding: Entity Attribution Failure in Clinical Retrieval-Augmented Generation](https://arxiv.org/abs/2607.09349)
