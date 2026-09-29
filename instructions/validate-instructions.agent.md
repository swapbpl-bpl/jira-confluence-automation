- Use this instruction when validating project instruction files for scope, formatting, and action-item quality.
- Scope: process every Markdown file in `./instructions/` that defines instructions or a catalog, including `*.agent.md` and `main.agent.md` files.
- Task definition:
  + Check each file for Single Responsibility Principle (SRP): one workflow or one decision area per instruction file.
  + Check each file for Markdown formatting consistency: heading levels, code fences, list structure, and clear section ordering.
  + Extract action items from the file content when present (for example, checklist items or explicit follow-up steps).
  + Record results in a Markdown report written to `reports/instruction-validation-report.md`.
- Validation rules:
  + A file is a good SRP fit when it focuses on one workflow, one capability, or one operational decision.
  + A file is a warning when it mixes guidance for setup, IDE wrappers, cataloging, or cross-cutting infrastructure in the same document.
  + Catalog files such as `main.agent.md` and framework/bootstrap files may be treated as expected exceptions if clearly documented as catalog or infrastructure files.
  + Format checks should flag heading jumps, unbalanced code fences, inconsistent bullet styles, and missing section separators.
- Output format:
  ```markdown
  # Instruction Validation Report

  - Files processed: N
  - Files with warnings: X
  - Files with failures: Y

  ## instructions/example.agent.md
  - Status: Pass | Warning | Fail
  - SRP: Good / Warning / Fail
  - Markdown: Pass / Warning / Fail
  - Action items:
    - [ ] ...
  ```
- Use a script for repeatability when the same validation should be run again on many files.
- Prefer deterministic checks over subjective judgment; when a file is broad but intentionally acts as a catalog or bootstrap file, mark it as a documented exception instead of a failure.
- If a file fails validation, update the instruction or split it into smaller, single-purpose files before rerunning the report.
