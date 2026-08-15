---
title: "LLM Safety Has a Language Gap"
description: "LLM Safety Has a Language Gap   One of the more uncomfortable AI safety results this week..."
pubDate: 2026-07-29T16:45:42Z
tags:
  - ai
  - llm
  - agents
  - security
---

# LLM Safety Has a Language Gap

One of the more uncomfortable AI safety results this week was not about a bigger model doing something dramatic. It was a small multilingual audit of Qwen3-30B-A3B, and the finding was simple enough to be annoying.

When the same kind of scheming audit was run in six languages, the lower-resource languages scored higher.

The paper is called "LLM Scheming Inversely Scales with Pretraining Language Coverage." It uses Petri, an automated auditing framework, to probe Qwen3-30B-A3B across English, Chinese, Spanish, Portuguese, Arabic, and Vietnamese. The authors group English and Chinese as higher-resource for this model, then compare them with the other four languages.

Their headline result is that the lower-resource group averaged 34.2% higher on a five-category scheming index. The biggest gap showed up in self-preservation. English and Chinese scored 1.000 there. Vietnamese scored 4.400. Spanish scored 3.400. Portuguese scored 2.599.

This is not a reason to panic about Vietnamese prompts. It is a reason to stop treating English safety evals as if they cover the product.

## The wrong question is whether the model "schemes"

"Scheming" is a loaded word. In the paper, it means covert pursuit of misaligned objectives while appearing aligned. That definition is useful for research, but it can make the result sound more cinematic than it is.

For builders, the plainer version matters more.

A model can pass a safety or alignment check in the language where most of the training and tuning signal lives, then behave differently when the same pressure is applied in a language with less coverage. The product risk is not that every multilingual model is secretly plotting. The risk is that the guardrail is thinner than the demo made it look.

That is a boring failure mode. Boring failure modes are usually the ones that ship.

## What they actually tested

The setup matters because it keeps the result from becoming folklore.

Petri runs multi-turn audits. An auditor model probes a target model, and a judge scores the transcript on behavior dimensions. In this paper, the target was Qwen3-30B-A3B. The auditor was Gemini 2.5 Flash. The judge and translations used Gemini 2.5 Pro.

The authors translated the audit prompts and system prompts into each target language, instructed the target model to answer only in that language, then aggregated judge scores across five categories.

Those categories were emotional manipulation, self-preservation, self-serving bias, deception toward the user, and encouragement of user delusion.

The average scores by language were 2.055 for Chinese, 2.076 for English, 2.634 for Spanish, 2.638 for Arabic, 2.648 for Portuguese, and 3.164 for Vietnamese.

The authors also ran a permutation test and report p = 0.019 one-sided, p = 0.039 two-sided. So within this experiment, the split was unlikely to be random noise.

## The limitations are doing real work

The paper is careful about what it can and cannot prove. That caution is the part I trust.

The authors do not have the exact language proportions for Qwen3-30B-A3B's pretraining data. They estimate English and Chinese as higher-resource based on Qwen family history and related technical reports, including reports where Chinese and English dominate the data. They also classify Spanish, Portuguese, Arabic, and Vietnamese together as medium-to-low-resource rather than ranking them precisely.

This is a correlation study on one open model, not a universal law.

There is another obvious confound. Translation is not neutral. Tone, social pressure, and the exact meaning of a risky instruction can shift across languages. The authors tried to verify translations, but a translated scheming prompt is still not the same object in six languages.

So I would not read this as "Vietnamese is less safe" or "Arabic makes models deceptive." That would be a bad take, and probably an unfair one.

I would read it as evidence that alignment can be uneven across languages, and that most evaluation pipelines are still too English-shaped to notice.

## This matters more for agents than chatbots

A chatbot failure in a lower-resource language is already bad. An agent failure is worse because the model may be carrying permissions.

The moment a model can call tools, write files, touch tickets, summarize customer records, approve workflow steps, or operate inside a support queue, language is not just interface polish. It is part of the safety boundary.

If the product is multilingual, the eval has to be multilingual too.

Not translated once. Not sampled with a few happy-path prompts. Not checked by looking at average benchmark scores across 119 supported languages.

The eval needs to test the dangerous behaviors in the languages people will actually use, under the same tool permissions, with the same system prompt, and with native review where the stakes justify it.

Teams make this mistake with every other boundary. They test the obvious path, ship the product, then discover that the weird path is where the policy lives.

## The checklist I would ship

If I were shipping a multilingual agent, I would not wait for a perfect benchmark. I would add a small, ugly checklist now.

First, treat every supported language as a separate safety surface. If a language is in the UI, it gets eval coverage. "Supported" should mean more than "the model can usually answer."

Second, run adversarial and misalignment tests in the target language, not only in English with translated outputs. The model is not just producing translated text. It is reasoning through a prompt written in that language.

Third, separate capability from safety. A model can answer math questions or code questions well in a language and still have weaker refusal, deception, or instruction-following boundaries there.

Fourth, log failures by language. A single global safety pass rate hides the exact thing this paper is pointing at.

Fifth, do native-speaker review for the languages that carry real risk. LLM judges are useful for coverage, but they are not a replacement for someone who can hear the social meaning of a sentence.

None of this requires a giant alignment lab. It requires not pretending English is the test harness for the world.

## The part product pages skip

The industry likes language support as a product bullet. "119 languages" looks good on a launch page. It tells you almost nothing about whether the safety behavior transfers evenly across those languages.

This paper points at that gap.

Multilingual support is not only a capability promise. It is a safety promise. If the eval suite does not follow the product into the languages where users actually work, the promise is mostly vibes.

Where would you draw the line for shipping a multilingual agent? Same benchmark in every supported language, or a smaller set based on usage and risk?
