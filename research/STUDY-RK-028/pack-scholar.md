STUDY-RK-028 Q1 (Scholar) — tip `3cd5312`. stop: documenting native Node addons / prebuild install paths (operator docs for compile vs prebuild; ABI/platform caveats). Eight papers, all arXiv. Invented universal-prebuild-no-compile: 0. Invented STUDY-RK-051: 0. Do not publish. Word count ~580.

1. RootJS: Node.js Bindings for ROOT 6 — Beffart, Früh, Haas, Rajgopal, Schwabe, et al., 2017 — https://arxiv.org/abs/1704.07887 — Native C++ Node modules must be compiled before use; operator docs must state a working C++ compiler and required headers, not imply a pure-JS install.

2. fugashi, a Tool for Tokenizing Japanese in Python — McCann, 2020 — https://arxiv.org/abs/2010.06858 — Shipping platform binary wheels lets users install without a local compiler; documenting the prebuilt path is what removes the compile barrier on supported OS/arch.

3. Gistable: Evaluating the Executability of Python Code Snippets on GitHub — Horton, Parnin, 2018 — https://arxiv.org/abs/1808.04919 — Missing C build tools break native-binding installs; authors explicitly generalize that compile/toolchain gaps also hit Node.js packages that compile native addons.

4. Build Issue Resolution from the Perspective of Non-Contributors — Huang, Wang, 2024 — https://arxiv.org/abs/2410.16311 — Pre-built packages are often absent or OS/env-incompatible, so operators still fall back to local source builds — docs must cover both prebuild and compile paths.

5. Chromo: A High-Performance Python Interface to Hadronic Event Generators… — Fedynitch, Dembinski, Prosekin, 2025 — https://arxiv.org/abs/2507.21856 — Operator-facing install docs emphasize precompiled wheels so regular users need no manual Fortran/C++ compile — the documented dual story is wheels-first, compile when missing.

6. Beyond pip install: Evaluating LLM Agents for the Automated Installation of Python Projects — Milliken, Kang, Yoo, 2024 — https://arxiv.org/abs/2412.06294 — Install success depends on finding instructions in project documentation; undocumented or incomplete install steps are a primary failure mode for operators/agents.

7. Binary-level Software Compatibility Tool Agreement — Sochat, Haines, 2022 — https://arxiv.org/abs/2212.03364 — ABI compatibility checks matter for C/C++ library updates; operator docs should surface ABI/platform caveats rather than assuming binary drop-ins always work.

8. SoK: Towards Reproducibility for Software Packages in Scripting Language Ecosystems — Pohl, Novák, Ohm, Meier, 2025 — https://arxiv.org/abs/2503.21705 — Scripting ecosystems (incl. Node) ship native extensions as compiled binaries; documenting the native-extension build path is part of honest packaging, not optional folklore.

Read-only context: README requires C/C++ tools for `better-sqlite3` or auto-prebuild on supported platforms; STUDY-RK-017 grounding (prebuilds ≠ every platform). No git. No execute. Do not publish.

✅

**Verifier flag (do not land as verified):** Scholar #4, #5, #8 unverified. Invented gates: 0. Soft folklore: 0. Do not invent platform coverage table / universal-prebuild claim.
