# Module 12 Completion Report

## Instruction File
- Filename: instructions/calculate-compound-interest.agent.md

```markdown
- Use this instruction when the user asks to calculate compound interest, final investment amount, or interest earned over time.
- The tool script lives at `./tools/compound_interest.py`.
- Before invoking, gather (or infer from context) four values: principal (starting amount), annual rate (as a decimal, e.g. `0.05` for 5%), compounds per year (e.g. `12` for monthly, `4` for quarterly, `1` for annually), and total years.
- If any value is missing or ambiguous, ask the user rather than guessing.
- Invoke via terminal:
  ```
  python tools/compound_interest.py <principal> <annual_rate> <compounds_per_year> <years>
  ```
- Example: `python tools/compound_interest.py 1000 0.05 12 10`
- The script prints two lines: `Final amount: <value>` and `Interest earned: <value>`, both formatted to 2 decimal places.
- When presenting results to the user, restate the inputs used (principal, rate, compounding frequency, years) alongside the final amount and interest earned for clarity.
- Do not fabricate or estimate results manually — always run the script and report its actual output.
```

## Script File
- Filename: tools/compound_interest.py
- Language: Python

```python
"""Calculate compound interest from command-line arguments."""
import argparse


def compound_interest(principal: float, annual_rate: float, compounds_per_year: int, years: float) -> float:
    return principal * (1 + annual_rate / compounds_per_year) ** (compounds_per_year * years)


def main() -> None:
    parser = argparse.ArgumentParser(description="Calculate compound interest.")
    parser.add_argument("principal", type=float, help="Initial principal amount")
    parser.add_argument("annual_rate", type=float, help="Annual interest rate as a decimal (e.g. 0.05 for 5%%)")
    parser.add_argument("compounds_per_year", type=int, help="Number of times interest compounds per year")
    parser.add_argument("years", type=float, help="Total number of years")
    args = parser.parse_args()

    final_amount = compound_interest(args.principal, args.annual_rate, args.compounds_per_year, args.years)
    interest_earned = final_amount - args.principal

    print(f"Final amount: {final_amount:.2f}")
    print(f"Interest earned: {interest_earned:.2f}")


if __name__ == "__main__":
    main()
```

## Script Execution Output

```
$ python tools/compound_interest.py --help
usage: compound_interest.py [-h]
                            principal annual_rate compounds_per_year years

Calculate compound interest.

positional arguments:
  principal           Initial principal amount
  annual_rate         Annual interest rate as a decimal (e.g. 0.05 for 5%)
  compounds_per_year  Number of times interest compounds per year
  years               Total number of years

options:
  -h, --help          show this help message and exit
```

---

## Instruction File (2)
- Filename: instructions/fetch.data.agent.md

```markdown
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
```

## Script File (2)
- Filename: tools/fetch_data.py
- Language: Python

```python
#!/usr/bin/env python3
"""Fetch sprint metadata and issues from Jira via the Agile REST API.

Reads Jira connection details from environment variables (see .env.example):
    JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN

Usage:
    python tools/fetch_data.py <sprint_number>
"""
from __future__ import annotations

import argparse
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

REQUEST_TIMEOUT_SECONDS = 30


def get_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: missing required environment variable '{name}'. See .env.example.", file=sys.stderr)
        sys.exit(1)
    return value


def fetch_sprint(base_url: str, auth: tuple[str, str], sprint_number: int) -> dict:
    url = f"{base_url.rstrip('/')}/rest/agile/1.0/sprint/{sprint_number}"
    response = requests.get(url, auth=auth, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def fetch_sprint_issues(base_url: str, auth: tuple[str, str], sprint_number: int) -> list[dict]:
    url = f"{base_url.rstrip('/')}/rest/agile/1.0/sprint/{sprint_number}/issue"
    issues: list[dict] = []
    start_at = 0
    while True:
        params = {"fields": "summary,issuetype,status,assignee", "startAt": start_at}
        response = requests.get(url, auth=auth, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()
        batch = data.get("issues", [])
        issues.extend(batch)
        start_at += len(batch)
        if not batch or start_at >= data.get("total", 0):
            break
    return issues


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch sprint metadata and issues from Jira.")
    parser.add_argument("sprint_number", type=int, help="Jira sprint ID to fetch data for")
    args = parser.parse_args()

    base_url = get_env("JIRA_BASE_URL")
    email = get_env("JIRA_EMAIL")
    api_token = get_env("JIRA_API_TOKEN")
    auth = (email, api_token)

    try:
        sprint = fetch_sprint(base_url, auth, args.sprint_number)
        issues = fetch_sprint_issues(base_url, auth, args.sprint_number)
    except requests.exceptions.RequestException as exc:
        print(f"Error: failed to fetch data from Jira: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Sprint: {sprint.get('name')} (id={sprint.get('id')}, state={sprint.get('state')})")
    print(f"Start: {sprint.get('startDate')}  End: {sprint.get('endDate')}")
    if sprint.get("goal"):
        print(f"Goal: {sprint['goal']}")

    print(f"\nIssues ({len(issues)}):")
    for issue in issues:
        fields = issue.get("fields", {})
        status = fields.get("status", {}).get("name", "Unknown")
        issue_type = fields.get("issuetype", {}).get("name", "Unknown")
        assignee = (fields.get("assignee") or {}).get("displayName", "Unassigned")
        summary = fields.get("summary", "")
        print(f"- [{issue.get('key')}] ({issue_type}/{status}) {summary} — {assignee}")


if __name__ == "__main__":
    main()
```

## Script Execution Output (2)

```
$ python tools/fetch_data.py --help
usage: fetch_data.py [-h] sprint_number

Fetch sprint metadata and issues from Jira.

positional arguments:
  sprint_number  Jira sprint ID to fetch data for

options:
  -h, --help     show this help message and exit
```
