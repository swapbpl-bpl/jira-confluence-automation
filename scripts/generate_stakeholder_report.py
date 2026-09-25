#!/usr/bin/env python3
"""Interactively build a stakeholder-friendly weekly status report.

Prompts for plain-language input (progress, upcoming work, risks/blockers,
metrics) and writes a structured Markdown report suitable for non-technical
stakeholders.

Usage:
    python scripts/generate_stakeholder_report.py
    python scripts/generate_stakeholder_report.py --project "Project Phoenix" --author "Swapnil Saxena"
"""
from __future__ import annotations

import argparse
import datetime as dt
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent


def prompt_bullets(label: str, empty_message: str) -> list[str]:
    print(f"\n{label} (enter one item per line, blank line to finish):")
    bullets = []
    while True:
        line = input("  - ").strip()
        if not line:
            break
        bullets.append(line)
    return bullets or [empty_message]


def prompt_metrics() -> list[tuple[str, str]]:
    print("\nKey metrics/KPIs (format: 'name = value', blank line to finish):")
    metrics = []
    while True:
        line = input("  ").strip()
        if not line:
            break
        if "=" in line:
            name, value = line.split("=", 1)
            metrics.append((name.strip(), value.strip()))
        else:
            metrics.append((line, ""))
    return metrics


def build_report(project: str, author: str, week_start: dt.date, week_end: dt.date,
                  summary: str, progress: list[str], upcoming: list[str],
                  risks: list[str], metrics: list[tuple[str, str]]) -> str:
    lines = [
        f"# Weekly Status Report — {project}",
        "",
        f"**Week of:** {week_start.isoformat()} to {week_end.isoformat()}",
        f"**Prepared by:** {author}",
        f"**Date:** {dt.date.today().isoformat()}",
        "",
    ]

    if summary:
        lines += ["## Executive Summary", "", summary, ""]

    lines += ["## Progress & Highlights", ""]
    lines += [f"- {item}" for item in progress]
    lines.append("")

    lines += ["## Upcoming / Next Steps", ""]
    lines += [f"- {item}" for item in upcoming]
    lines.append("")

    lines += ["## Risks & Blockers", ""]
    lines += [f"- {item}" for item in risks]
    lines.append("")

    if metrics:
        lines += ["## Key Metrics", "", "| Metric | Value |", "|--------|-------|"]
        lines += [f"| {name} | {value} |" for name, value in metrics]
        lines.append("")

    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a stakeholder-friendly weekly status report.")
    parser.add_argument("--project", default="Project", help="Project or team name")
    parser.add_argument("--author", default="", help="Report author name")
    parser.add_argument("--week-start", help="Week start date (YYYY-MM-DD), defaults to 7 days ago")
    parser.add_argument("--week-end", help="Week end date (YYYY-MM-DD), defaults to today")
    parser.add_argument("--output", help="Output file path (default: stakeholder-reports/status-report-<date>.md)")
    args = parser.parse_args()

    today = dt.date.today()
    week_end = dt.date.fromisoformat(args.week_end) if args.week_end else today
    week_start = dt.date.fromisoformat(args.week_start) if args.week_start else week_end - dt.timedelta(days=7)

    author = args.author or input("Prepared by: ").strip()

    print(f"\nWeekly Status Report for '{args.project}' ({week_start} to {week_end})")

    summary = input("\nOne-line executive summary (optional): ").strip()
    progress = prompt_bullets("Progress & Highlights", "No notable progress to report this week.")
    upcoming = prompt_bullets("Upcoming / Next Steps", "Nothing new planned.")
    risks = prompt_bullets("Risks & Blockers", "No blockers this week.")
    metrics = prompt_metrics()

    report = build_report(args.project, author, week_start, week_end, summary, progress, upcoming, risks, metrics)

    if args.output:
        output_path = Path(args.output)
    else:
        output_dir = WORKSPACE_ROOT / "stakeholder-reports"
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / f"status-report-{today.isoformat()}.md"

    output_path.write_text(report, encoding="utf-8")
    print(f"\nReport written to {output_path}")


if __name__ == "__main__":
    main()
