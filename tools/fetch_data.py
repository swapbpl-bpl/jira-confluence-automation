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
