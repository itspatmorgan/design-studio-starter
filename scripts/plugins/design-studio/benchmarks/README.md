# Benchmark the user's wait

The primary result is the full time the person waits, from sending the installation request until the final response provides a usable local studio, the verified public link when requested, and required workspace handoff. A short shell runtime does not make an eight-minute conversation fast. Report all three wall-clock benchmarks:

| Benchmark | Start | Finish |
| --- | --- | --- |
| Setup from scratch | Before obtaining the repository or installing the plugin | Plugin installed, dependencies prepared, identity resolved, preview inspected, and workspace handoff ready |
| Deploy a prepared studio | Publishing request with an installed, prepared studio | Production checks, source save, deployment, public verification, and publishing response complete |
| End to end | Initial installation request | Final completion response and required activation/handoff complete |

Include instruction discovery, agent work, permission/tool latency, recoveries, browser checks, and required restarts/new chats. Keep an end-to-end run open across a required restart until activation and continuation are verified. If activation remains unverified, label it an incomplete end-to-end test and report the elapsed conversation separately. Do not subtract human/permission wait silently: report it separately when measurable. Do not claim a clean-computer test from a warm tool or dependency cache.

## Recording boundaries

Capture request-start and setup-start with the host clock before repository retrieval. After the helper is available, record those captured ISO times using:

`node <source-checkout>/scripts/plugins/design-studio/benchmarks/benchmark.mjs mark <absolute-log.jsonl> request-start <captured-ISO-time>`

Record setup-start the same way. Use one event log per run, outside the source being published. The helper rejects duplicate events; omitted events remain unknown rather than zero. Invoke the helper with these events at actual boundaries:

- **studio-ready**: the setup finish boundary above. Package preparation alone is not studio readiness.
- **publish-start**: start of requested publishing on the ready studio.
- **public-ready**: successful deployment and public/browser verification complete.
- **handoff-ready**: all required workspace and activation handoff complete.
- **publish-end**: publishing completion response delivery, including its verification and handoff. In a combined journey this may be the same final boundary as end.
- **end**: final response delivery. Record immediately before sending, then correct the reported elapsed time from the host transcript timestamp if available; don't claim that the pre-send mark measures response delivery exactly.

`node <source-checkout>/scripts/plugins/design-studio/benchmarks/benchmark.mjs report <absolute-log.jsonl>` returns setup, deployment through its completion response, deployment-to-public, end-to-end, request-to-public, and time after public readiness. The same log supports a standalone publishing run: request-start/publish-start, public-ready, publish-end, and end; setup stays unknown. Record publish-end and end only when their required completion conditions are met. An earlier handoff-ready event is valid when workspace handoff precedes publishing.

During a combined run, register Sites while dependencies prepare when the host permits it. Label setup/publishing phase times as overlapping when work overlaps; don't add them to infer the end-to-end result. A publish phase from a combined run with prior registration is different from a standalone publication request and must be labeled accordingly. Run the prepared-studio publication benchmark separately when comparing that path.

Keep a context record beside the timing log: host/agent/model when known, package SHA/version and starter pin, whether plugin/marketplace were removed, installed tool versions, dependency cache state, reused Site registration/build, restarts, permission prompts, and verified completion conditions. Subprocess timings written by bootstrap are diagnostics inside these user-visible intervals. Record build, save, upload, deployment, verification, and final handoff separately when investigating delays.

## Keep the completion path short

Verify Git and Node during preparation, before preview or publication. Use bootstrap setup to combine creation/preparation and bootstrap exec for identity, build, and Sites workflow commands. Read required procedures once, batch independent reads, and reuse confirmed state. Use Node for JSON edits. Do not perform unnecessary post-publication tool repairs, repeat documentation discovery, repeat unchanged builds, or make a second cosmetic publication. Meet the verification gates, provide the links and handoff, and finish.

The chosen mise ordering follows its [environment documentation](https://mise.jdx.dev/environments/#resolve-values-after-tools): the local path contains only Git, so placing it after tool resolution cannot select a different Node. Local Git configuration is excluded from source commits; custom local mise settings are preserved.
