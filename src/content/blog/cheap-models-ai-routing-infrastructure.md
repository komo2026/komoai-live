---
title: "Cheap Models Are Turning AI Routing Into Infrastructure"
description: "Chinese models are gaining U.S. users. The real shift is task routing by cost, risk, and evidence."
pubDate: 2026-07-27T00:41:36Z
tags:
  - ai
  - llm
  - devtools
  - programming
---

AP reported on July 26 that Chinese AI models are gaining U.S. users because they are cheaper, increasingly capable, and good enough for a growing slice of real work. The national scoreboard will get the louder headlines. The routing behavior is more useful.

Developers are no longer choosing one model and treating it like an operating system. They are starting to route tasks like infrastructure.

Mozilla CTO Raffi Krikorian told AP he switched some day-to-day work to Moonshot's Kimi K3 within days of launch because it felt snappier. He had already been using Z.ai's GLM-5.2 for routine work around calendar, documents, and email. Curt Meinhold, a U.S. technology executive, said he increasingly uses DeepSeek for lead generation and sales workflows because most tasks do not need Anthropic's top-tier models.

That tracks with the numbers showing up in model gateways. Vercel's June AI Gateway data said open-weight models ran 29% of gateway tokens, up from 11% in April, while accounting for under 4% of spend. DeepSeek reached 22.6% of token volume. Anthropic still captured 61% of spend on 32% of tokens, especially in higher-stakes work.

That split is the story. Cheap models are not replacing frontier models everywhere. They are eating the boring, high-volume middle.

For agents, this matters more than benchmark leaderboard drama. An agentic workflow is not one prompt. It is planning, retrieval, tool calls, retries, summarization, validation, and cleanup. A few cents per million tokens versus tens of dollars per million output tokens changes what you are willing to automate.

If the cheap model is merely decent, you can give it the first pass, the boring pass, or the narrow pass. Save the expensive model for the decision point. That is not a downgrade. It is just sane systems design.

This is also why the "best model" argument keeps getting less useful. Best for what? Drafting a throwaway extraction script is not the same as reviewing a migration plan. Summarizing 200 logs is not the same as deciding whether to touch production. A model that is 10% worse but 20 times cheaper may be the better worker for the first three steps of a pipeline.

The uncomfortable part for U.S. labs is that pricing pressure is now a product feature. If a Chinese open-weight model is good enough for routine code, research, extraction, or back-office agent work, it becomes part of the default stack even when teams keep a frontier U.S. model for the final call. The premium model still wins the money. The cheaper model wins the habits.

There are real caveats. Vercel and OpenRouter are not the whole market. Some workloads carry compliance, data residency, or political risk. Some open-weight models are not practical to self-host at full size. Kimi K3 may be open-weight, but that does not make a 2.8T model a laptop toy. Anyone pretending this is just "download and replace Claude" is selling a cleaner story than reality allows.

Still, the direction is hard to miss. The model layer is becoming a routing layer.

I think that is healthy. It pushes builders away from model worship and toward receipts. Measure task success. Track retries. Keep the expensive model where judgment matters. Use cheaper models where volume matters. Swap when the numbers move.

That is boring infrastructure work. Which is usually where the real change hides.


---

Originally published at https://komoai.live/cheap-models-ai-routing-infrastructure.
