#!/usr/bin/env python3
"""Generate a stakeholder status report from Git history and weekly notes.

By default, reports on the previous complete Monday-to-Sunday UTC week.
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


def previous_week_window(reference_date: dt.date | None = None) -> tuple[dt.date, dt.date]:
    """Return the previous complete Monday-to-Sunday week."""
    if reference_date is None:
        reference_date = dt.datetime.now(dt.timezone.utc).date()
    current_monday = reference_date - dt.timedelta(days=reference_date.weekday())
    end_date = current_monday - dt.timedelta(days=1)
    return end_date - dt.timedelta(days=6), end_date


def get_commits(
    repo: Path,
    start_date: dt.date,
    end_date: dt.date,
    author: str | None,
) -> list[dict[str, str]]:
    cmd = [
        "git", "-C", str(repo), "log",
        f"--since={start_date.isoformat()}T00:00:00Z",
        f"--before={(end_date + dt.timedelta(days=1)).isoformat()}T00:00:00Z",
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


def read_weekly_notes(notes_path: Path) -> dict[str, list[str]]:
    """Read blocker and next-week bullets from the dated Markdown input file."""
    notes = {"blockers": [], "next week": []}
    if not notes_path.is_file():
        return notes

    section = None
    for line in notes_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("## "):
            heading = stripped[3:].strip().casefold()
            section = heading if heading in notes else None
        elif section and stripped.startswith(("- ", "* ")):
            item = stripped[2:].strip()
            if item:
                notes[section].append(item)
    return notes


def _limited_bullets(items: list[str], empty_message: str) -> list[str]:
    if not items:
        return [f"- {empty_message}"]
    if len(items) <= 5:
        return [f"- {item}" for item in items]
    return [*(f"- {item}" for item in items[:4]), f"- {len(items) - 4} more item(s) omitted."]


def build_report(
    repos: list[Path],
    start_date: dt.date,
    end_date: dt.date,
    author: str | None,
    notes_path: Path,
) -> str:
    accomplishments = []
    for repo in repos:
        try:
            repo_name = repo.resolve().relative_to(WORKSPACE_ROOT.resolve()).as_posix()
        except ValueError:
            repo_name = repo.name
        for commit in get_commits(repo, start_date, end_date, author):
            accomplishments.append((commit["date"], f"{repo_name}: {commit['subject']}"))

    accomplishments.sort(key=lambda item: item[0], reverse=True)
    accomplishment_items = [item for _, item in accomplishments]
    notes = read_weekly_notes(notes_path)
    sections = [
        ("Accomplishments", _limited_bullets(accomplishment_items, "No repository activity recorded.")),
        ("Blockers", _limited_bullets(notes["blockers"], "No weekly notes supplied.")),
        ("Next Week", _limited_bullets(notes["next week"], "No weekly notes supplied.")),
    ]

    lines = []
    for index, (heading, bullets) in enumerate(sections):
        if index:
            lines.append("")
        lines.append(f"## {heading}")
        lines.extend(bullets)
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a weekly status report from git history.")
    parser.add_argument("--days", type=int, help="Number of calendar days including today, instead of the previous complete week")
    parser.add_argument("--start-date", help="Inclusive period start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", help="Inclusive period end date (YYYY-MM-DD)")
    parser.add_argument("--author", help="Filter commits by author name/email")
    parser.add_argument("--repo", help="Limit to a single repo path (relative to workspace root)")
    parser.add_argument("--notes", help="Weekly notes Markdown file (defaults to the dated weekly-inputs file)")
    parser.add_argument("--output", help="Output file path (defaults to a period-based file in status-reports/)")
    args = parser.parse_args()

    if bool(args.start_date) != bool(args.end_date):
        parser.error("--start-date and --end-date must be provided together")
    if args.start_date:
        if args.days is not None:
            parser.error("--days cannot be combined with --start-date or --end-date")
        try:
            start_date = dt.date.fromisoformat(args.start_date)
            end_date = dt.date.fromisoformat(args.end_date)
        except ValueError as error:
            parser.error(str(error))
        if start_date > end_date:
            parser.error("--start-date must be on or before --end-date")
    elif args.days is not None:
        if args.days < 1:
            parser.error("--days must be at least 1")
        end_date = dt.datetime.now(dt.timezone.utc).date()
        start_date = end_date - dt.timedelta(days=args.days - 1)
    else:
        start_date, end_date = previous_week_window()

    if args.repo:
        repos = [WORKSPACE_ROOT / args.repo]
    else:
        repos = find_git_repos(WORKSPACE_ROOT)

    if not repos:
        raise SystemExit("No git repositories found.")

    default_notes = WORKSPACE_ROOT / "status-reports" / "weekly-inputs" / f"weekly-input-{start_date.isoformat()}.md"
    notes_path = Path(args.notes) if args.notes else default_notes
    if not notes_path.is_absolute():
        notes_path = WORKSPACE_ROOT / notes_path

    report = build_report(repos, start_date, end_date, args.author, notes_path)

    if args.output:
        output_path = Path(args.output)
    else:
        output_dir = WORKSPACE_ROOT / "status-reports"
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / f"status-report-{start_date.isoformat()}-to-{end_date.isoformat()}.md"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    output_path.write_text(report, encoding="utf-8")
    print(f"Report written to {output_path}")


if __name__ == "__main__":
    main()
