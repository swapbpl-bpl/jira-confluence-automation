# Instructions Catalog

Each entry below is an instruction file with a one-line description. Optional sub-fields after `+`:
- Keywords — trigger words/phrases: if user's request matches, load this instruction.
- Target — file glob pattern: if current file or context matches, consider this instruction relevant.
- Exceptions — edge cases or clarifications that don't fit in the one-liner.

---

- [`./instructions/creating-instructions.agent.md`](./creating-instructions.agent.md) — how to create/update instructions, skills, and IDE wrappers in this project.
  + Keywords: create instruction, new instruction, update instruction, creating-instructions, instruction infrastructure
- [`./instructions/create-status-report.agent.md`](./create-status-report.agent.md) — weekly status report with fixed sections (Accomplishments, Blockers, Next Week) and format.
  + Keywords: status report, weekly report, accomplishments, blockers
  + Exceptions: this file is a native VS Code custom agent (frontmatter + tools), kept as-is rather than converted to plain-bullet style.
- [`./instructions/write-meeting-notes.agent.md`](./write-meeting-notes.agent.md) — meeting summary with decisions and action items (owners + due dates).
  + Keywords: meeting notes, meeting summary, action items, minutes
- [`./instructions/generate-jira-query.agent.md`](./generate-jira-query.agent.md) — JQL queries for common reporting scenarios (blockers, stale issues, workload).
  + Keywords: jql, jira query, sprint report, blocked issues, stale issues
- [`./instructions/generate-summary-content.agent.md`](./generate-summary-content.agent.md) — assemble the Markdown sprint/release summary content (exec summary, metrics, completed/carried-over tables, risks, appendix) from fetched Jira sprint data.
  + Keywords: summary content generation, sprint summary, executive summary, velocity metrics, completed work table, risks blockers, appendix
  + Target: `scripts/generate_sprint_summary.py`
