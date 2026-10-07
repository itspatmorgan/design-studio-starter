---
title: Share and hand off
description: Gather feedback and make your design intent clear to the next person.
section: Share your work
order: 30
toc: true
---

Share a prototype when someone needs to try the experience or understand a decision. You can share a viewing site, share the working files, or prepare an engineering handoff.

## Prepare for review

Give reviewers a clear place to start and a question to consider. For Checkout exploration, that might be: “Can you understand the total cost before payment?”

Ask your agent:

> Prepare Checkout exploration for review. Make the main flow and error states easy to find. Summarize what I want feedback on, which behavior is simulated, and the open questions.

If Documents is enabled, save that explanation with the prototype. If Canvases is enabled, use a review canvas to connect screens and annotations. Choose the format that helps your reviewers.

A polished screen does not establish that every behavior works. Check the relevant paths and states before sharing, and label sample data and simulated actions.

## Publish for review

A published site lets people try your prototypes without running Studio. It is a viewing experience: interactive screens still work, but source editing and canvas editing stay local. It does not provide live co-editing or an agent service.

Ask your agent to help publish, specifying the audience and destination:

> Help me publish a viewing site for these reviewers. Check what the build includes and explain how access will work before publishing.

The build can include active prototypes, system pages, product context, and the Guide. Review the included content before sharing it. Studio does not provide built-in sign-in; restricted access depends on the hosting service. Archiving a prototype keeps it locally and excludes it from the published build.

Local edits appear on the viewing site only after another publication. Copy a link from the published site when sending it to remote reviewers; a localhost link works only on your computer.

Your agent can consult [Publishing](/documentation/context/platform.core/context/publishing) for the technical steps. Available publishing integrations depend on your coding environment.

## Share the working files

Saving updates your local files. A **commit** records a version in local Git history. **Push** sends those versions to a shared repository; **pull** receives other people's changes. Your agent can handle these steps.

Tell it when you want to share, and follow your team's review process:

> Review and save this work as a commit, then prepare it for our team's usual code review. Explain any unresolved issues before sharing it.

Sharing repository files and publishing a viewing site are separate actions. Neither creates a live shared editing session.

## Prepare an engineering handoff

Help the engineer and their agent understand the intended experience without reconstructing your conversation. Ask:

> Prepare Checkout exploration for engineering review. Summarize the intended flow and states, the system components it uses, what is simulated, and the decisions still open. Link to the relevant artifacts and explain how to try them.

Include why the design takes this approach, any constraints from research, and the behavior still needing a production decision. Provide access to the working files when the engineer needs to inspect the code; a viewing link supports experience review.

The prototype informs implementation. Production data, services, reliability, and other application requirements still need engineering assessment. Agree with the recipient on what they need rather than treating a particular document format as mandatory.
