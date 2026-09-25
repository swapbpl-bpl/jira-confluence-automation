- Use this instruction when the user asks to fetch, pull, or inspect Jira sprint data (issues, status, assignees) for a specific sprint.
- The tool script lives at `./tools/fetch_data.py`.
- Requires `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` to be set (via a git-ignored `.env` file, see `.env.example`). If any are missing, the script exits with an error naming the missing variable — do not fabricate values.
- Before invoking, obtain the Jira sprint ID (numeric) from the user; this is the `sprint_number` argument, not a sprint name.
- Invoke via terminal:
  ```
  python tools/fetch_data.py <sprint_number>
  ```
- Example: `python tools/fetch_data.py 24`
- The script prints sprint metadata (name, id, state, start/end dates, goal if set) followed by a list of issues, each showing key, issue type, status, summary, and assignee.
- On API/network failure, the script prints an error to stderr and exits non-zero — report the error message to the user rather than retrying silently.
- When presenting results, summarize sprint metadata first, then the issue list (optionally grouped by status), and always run the script rather than guessing Jira contents.
