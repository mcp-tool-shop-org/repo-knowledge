STUDY-RK-014 Q1 — Scholar pack (papers/arXiv/DOI only). Tip `96662ef`. Consumer: repo-knowledge SECURITY.md + README (local SQLite; MCP stdio; `gh` auth inherited; no credentials stored; no telemetry/phone-home). stop: security model no telemetry / tokens never in DB (peer lit). Phone-home invented: 0. Token-in-knowledge.db invented: 0. Do not invent STUDY-RK-021.

Eight papers, all with DOI or arXiv. I did not invent What.

1. Kleppmann, Wiggins, van Hardenberg, McGranaghan (2019). Local-First Software: You Own Your Data, in spite of the Cloud. DOI:10.1145/3359591.3359737 / https://doi.org/10.1145/3359591.3359737 — Local-first ideal: data ownership and agency stay on-device rather than depending on centralized cloud services that take control of user data.

2. Haas, Mogk, Yanakieva, Bieniusa, Mezini (2023). LoRe: A Programming Model for Verifiably Safe Local-First Software. arXiv:2304.07133 / https://arxiv.org/abs/2304.07133 — Local-first systems manage private data locally with offline availability; safety reasoning targets peer/local replicas rather than mandatory phone-home servers.

3. Malo, Qiu (2026). PROJECTMEM: A Local-First, Event-Sourced Memory and Judgment Layer for AI Coding Agents. arXiv:2606.12329 / https://arxiv.org/abs/2606.12329 — Fully offline core path with no telemetry; secret redaction on by default so tokens/keys are scrubbed before any local log write.

4. Ardebili (2026). YazSes: An Offline, Privacy-First, Cross-Platform Hold-to-Talk Voice-Dictation System. arXiv:2607.28878 / https://arxiv.org/abs/2607.28878 — Privacy as invariant: zero telemetry/analytics; default path transmits nothing off-device (CI-tested under network isolation).

5. Jin, Guo, Cheung (2026). CapSeal: Capability-Sealed Secret Mediation for Secure Agent Execution. arXiv:2604.16762 / https://arxiv.org/abs/2604.16762 — Agent never obtains secret plaintext; a local broker mediates credential-bearing actions so reusable tokens are not handed into the application runtime.

6. Yu, Geng, Zeng, Knottenbelt (2026). SUDP: Secret-Use Delegation Protocol for Agentic Systems. arXiv:2604.24920 / https://arxiv.org/abs/2604.24920 — Critiques storing secrets in env/DBs then handing them to agent runtimes; custodian holds sealed authority and redeems operation-bound use without exposing reusable credentials to the requester.

7. Basak, Neil, Reaves, Williams (2022). What are the Practices for Secret Management in Software Artifacts? arXiv:2208.11280 / https://arxiv.org/abs/2208.11280 — Practitioner guidance: keep secrets out of artifacts via local env vars and external secret managers—not embedded in application stores or VCS.

8. Basak, Cox, Reaves, Williams (2023). A Comparative Study of Software Secrets Reporting by Secret Detection Tools. arXiv:2307.00714 / https://arxiv.org/abs/2307.00714 — Secret-detection tooling and remediation workflows as product/org policy controls (scan, alert, revoke/rotate) rather than relying on secrets living inside app databases.

Gates: Phone-home invented: 0. Token-in-knowledge.db invented: 0. STUDY-RK-021 invented: 0. Findings: 8. Tip `96662ef`.

URLs:
https://doi.org/10.1145/3359591.3359737
https://arxiv.org/abs/2304.07133
https://arxiv.org/abs/2606.12329
https://arxiv.org/abs/2607.28878
https://arxiv.org/abs/2604.16762
https://arxiv.org/abs/2604.24920
https://arxiv.org/abs/2208.11280
https://arxiv.org/abs/2307.00714

✅
