STUDY-RK-017 Q1 · tip `68cc064` · consumer repo-knowledge

Eight papers, all with arXiv. I did not invent that prebuilds eliminate all native build needs, nor STUDY-RK-021.

Context (read-only): README Requirements: C/C++ tools for `better-sqlite3`, or prebuild binaries on supported platforms. `package.json` depends `better-sqlite3` ^12.8.0; lock shows `prebuild-install` (deprecated note in registry metadata) + `napi-build-utils`.

1. RootJS: Node.js Bindings for ROOT 6 — Beffart et al. — 2017 — https://arxiv.org/abs/1704.07887 — Native C++ Node module must compile before use (C++ compiler + headers); platform-independence claimed only where both host stacks exist.
2. Fat API bindings of C++ objects into scripting languages — Standish — 2024 — https://arxiv.org/abs/2403.14940 — Node addon is a `.node` dynamic library; Windows link cost dwarfs Linux, so platform toolchain still gates distribution.
3. TensorFlow.js: Machine Learning for the Web and Beyond — Smilkov et al. — 2019 — https://arxiv.org/abs/1901.05350 — Server Node backend binds native C via N-API for ABI-stable Node native addons across JS engines.
4. SoK: Towards Reproducibility for Software Packages in Scripting Language Ecosystems — Pohl, Novák, Ohm, Meier — 2025 — https://arxiv.org/abs/2503.21705 — Scripting ecosystems ship native extensions as compiled binaries; Node’s native-extension toolchain is called out as reproducibility-minded, not build-free.
5. Gistable: Evaluating the Executability of Python Code Snippets on GitHub — Horton, Parnin — 2018 — https://arxiv.org/abs/1808.04919 — Missing C build tools break native-binding installs; authors explicitly generalize compile troubles to Node.js native addons.
6. Build Issue Resolution from the Perspective of Non-Contributors — Huang, Wang — 2024 — https://arxiv.org/abs/2410.16311 — Pre-built packages often missing or OS/env-incompatible, so users still fall back to local source builds.
7. Cross-Ecosystem Vulnerability Analysis for Python Applications — Alexopoulos et al. — 2026 — https://arxiv.org/abs/2603.18693 — Wheel/prebuilt native artifacts dominate installs when available; sdists still compile when no matching binary — same dual-path pattern as npm prebuild-then-compile.
8. DepOwl: Detecting Dependency Bugs to Prevent Compatibility Failures — Jia et al. — 2021 — https://arxiv.org/abs/2102.08543 — Binary-level ABI mismatch between libraries and dependents causes compatibility failures beyond package-version ranges.

Prebuilds-eliminate-all-native-needs invented: 0 · STUDY-RK-021 invented: 0

✅
