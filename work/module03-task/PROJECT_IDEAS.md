# Project Ideas: Jira/Confluence Automation

## 1. Stale Ticket Nudger
**Problem it solves:** Tickets sit in "In Progress" or "Blocked" for days without updates, making it hard for managers to spot risks to sprint/release timelines until standup.
**Data needed:** Jira issue status, last-updated timestamp, assignee, sprint/due date, and a configurable "stale" threshold (e.g., no update in 3+ business days).

## 2. Auto-Generated Sprint/Release Summary in Confluence
**Problem it solves:** Managers spend time manually compiling sprint or release notes from Jira for stakeholders, which is repetitive and error-prone.
**Data needed:** Jira issues completed in the sprint/release (status, type, summary, story points), sprint/release name and dates, and the target Confluence page/space to publish to.

## 3. Cross-Project Dependency Alert
**Problem it solves:** Work items blocked by tickets in other teams' projects are easy to miss, causing surprise delays that only surface late.
**Data needed:** Jira issue links (blocks/is blocked by), linked issue status and owning team/project, due dates, and notification target (Slack/email/channel) for the responsible manager.
