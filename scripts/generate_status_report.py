#!/usr/bin/env python3
"""Generate a weekly status report from git commit history.

Scans the workspace for git repositories, collects commits from the last N
days (default 7), and writes a Markdown summary to status-reports/.

Usage:
    python scripts/generate_status_report.py
    python scripts/generate_status_report.py --days 14
    python scripts/generate_status_report.py --author "Swapnil Saxena"
    python scripts/generate_status_report.py --repo work/module03-task
"""
from __future__ import annotations

import argparse
import datetime as dt
import subprocess
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
COMMIT_SEP = "\x1f"  # unit separator, unlikely to appear in commit data
FIELD_FORMAT = COMMIT_SEP.join(["%h", "%an", "%ad", "%s"])


def find_git_repos(root: Path) -> list[Path]:
    """Recursively find directories containing a .git folder."""
    repos = []
    for git_dir in root.rglob(".git"):
        if git_dir.is_dir():
            repos.append(git_dir.parent)
    return sorted(repos)


def get_commits(repo: Path, since: str, author: str | None) -> list[dict]:
    cmd = [
        "git", "-C", str(repo), "log",
        f"--since={since}",
        f"--pretty=format:{FIELD_FORMAT}",
        "--date=short",
    ]
    if author:
        cmd.append(f"--author={author}")
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    commits = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        commit_hash, author_name, date, subject = line.split(COMMIT_SEP, 3)
        commits.append({
            "hash": commit_hash,
            "author": author_name,
            "date": date,
            "subject": subject,
        })
    return commits


def get_diff_stat(repo: Path, since: str, author: str | None) -> str:
    cmd = ["git", "-C", str(repo), "log", f"--since={since}", "--shortstat", "--pretty=format:"]
    if author:
        cmd.append(f"--author={author}")
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)

    files_changed = insertions = deletions = 0
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line or "changed" not in line:
            continue
        parts = line.split(", ")
        for part in parts:
            if "file" in part:
                files_changed += int(part.split()[0])
            elif "insertion" in part:
                insertions += int(part.split()[0])
            elif "deletion" in part:
                deletions += int(part.split()[0])
    return files_changed, insertions, deletions


def build_report(repos: list[Path], since: str, author: str | None, days: int) -> str:
    today = dt.date.today().isoformat()

    # Collect per-repo data first so the total commit count can be shown in the header.
    repo_data = []
    total_commits = 0
    for repo in repos:
        rel_repo = repo.relative_to(WORKSPACE_ROOT) if repo != WORKSPACE_ROOT else Path(".")
        commits = get_commits(repo, since, author)
        files_changed, insertions, deletions = get_diff_stat(repo, since, author)
        total_commits += len(commits)
        repo_data.append((rel_repo, commits, files_changed, insertions, deletions))

    lines = [
        "# Weekly Status Report",
        "",
        f"**Period:** last {days} day(s) (since {since})",
        f"**Generated:** {today}",
        f"**Total commits:** {total_commits}",
    ]
    if author:
        lines.append(f"**Author filter:** {author}")
    lines.append("")

    for rel_repo, commits, files_changed, insertions, deletions in repo_data:
        rel_repo = repo.relative_to(WORKSPACE_ROOT) if repo != WORKSPACE_ROOT else Path(".")
        commits = get_commits(repo, since, author)
        files_changed, insertions, deletions = get_diff_stat(repo, since, author)
        total_commits += len(commits)

        lines.append(f"## {rel_repo}")
        lines.append("")
        if not commits:
            lines.append("_No commits this period._")
            lines.append("")
            continue

        lines.append(f"- Commits: {len(commits)}")
        lines.append(f"- Files changed: {files_changed}, insertions: +{insertions}, deletions: -{deletions}")
        lines.append("")
        lines.append("| Date | Commit | Author | Summary |")
        lines.append("|------|--------|--------|---------|")
        for c in commits:
            lines.append(f"| {c['date']} | {c['hash']} | {c['author']} | {c['subject']} |")
        lines.append("")

    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a weekly status report from git history.")
    parser.add_argument("--days", type=int, default=7, help="Number of days to look back (default: 7)")
    parser.add_argument("--author", help="Filter commits by author name/email")
    parser.add_argument("--repo", help="Limit to a single repo path (relative to workspace root)")
    parser.add_argument("--output", help="Output file path (default: status-reports/status-report-<date>.md)")
    args = parser.parse_args()

    since = f"{args.days}.days"

    if args.repo:
        repos = [WORKSPACE_ROOT / args.repo]
    else:
        repos = find_git_repos(WORKSPACE_ROOT)

    if not repos:
        raise SystemExit("No git repositories found.")

    report = build_report(repos, since, args.author, args.days)

    if args.output:
        output_path = Path(args.output)
    else:
        output_dir = WORKSPACE_ROOT / "status-reports"
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / f"status-report-{dt.date.today().isoformat()}.md"

    output_path.write_text(report, encoding="utf-8")
    print(f"Report written to {output_path}")


if __name__ == "__main__":
    main()
