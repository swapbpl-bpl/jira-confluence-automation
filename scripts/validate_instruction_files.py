#!/usr/bin/env python3
"""Validate instruction files for SRP, formatting consistency, and action-item extraction.

This script scans all Markdown files under the project instructions directory, checks
whether each file follows a single-responsibility pattern, validates simple Markdown
formatting rules, extracts action items/checklist entries, and writes a report.

Usage:
    python scripts/validate_instruction_files.py
    python scripts/validate_instruction_files.py --instructions-dir instructions --output reports/instruction-validation-report.md
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path


def find_markdown_files(base_dir: Path) -> list[Path]:
    return sorted(p for p in base_dir.rglob("*.md") if p.is_file())


def extract_action_items(text: str) -> list[str]:
    items: list[str] = []
    for line in text.splitlines():
        match = re.match(r"^\s*[-*]\s+\[\s*\]\s*(.+)$", line)
        if match:
            items.append(match.group(1).strip())
            continue
        match = re.match(r"^\s*[-*]\s+(?:\*\*|_)?(.+?)(?:\*\*|_)?\s*$", line)
        if match and any(word in match.group(1).lower() for word in ["use this", "if", "when", "do not", "always", "read", "generate", "validate"]):
            items.append(match.group(1).strip())
    return items


def check_markdown_consistency(text: str) -> tuple[str, list[str]]:
    warnings: list[str] = []

    fence_count = text.count("```")
    if fence_count % 2 != 0:
        warnings.append("Unbalanced fenced code block count.")

    headings = []
    for line in text.splitlines():
        match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if match:
            level = len(match.group(1))
            headings.append((level, match.group(2).strip()))

    for index in range(1, len(headings)):
        prev_level, _ = headings[index - 1]
        curr_level, _ = headings[index]
        if curr_level > prev_level + 1:
            warnings.append(
                f"Heading level jumps from H{prev_level} to H{curr_level}."
            )
            break

    bullet_markers = {"-", "*"}
    seen_markers = set()
    for line in text.splitlines():
        if line.lstrip().startswith(("- ", "* ")):
            marker = line.lstrip()[:1]
            seen_markers.add(marker)
    if len(seen_markers) > 1:
        warnings.append("Mixed bullet styles found.")

    if warnings:
        return "Warning", warnings
    return "Pass", warnings


def check_single_responsibility(path: Path, text: str) -> tuple[str, list[str]]:
    lower_path = str(path).lower()
    file_name = path.name.lower()
    warnings: list[str] = []

    broad_markers = [
        "motivation and use cases",
        "general concepts",
        "bootstrap installation",
        "vscode + github copilot",
        "cursor",
        "claude code",
        "skills",
        "instructions",
        "architecture",
    ]

    section_count = 0
    for line in text.splitlines():
        if re.match(r"^##\s+", line):
            section_count += 1

    if file_name == "main.agent.md":
        return "Pass (catalog exception)", ["Main catalog file is intentionally broad by design."]

    if "single responsibility principle" in text.lower() and "one workflow" in text.lower():
        return "Pass", []

    if any(marker in text.lower() for marker in broad_markers):
        if section_count >= 5:
            return "Warning", ["This file covers multiple workflow areas and may be too broad for a single SRP responsibility."]

    if section_count >= 6:
        return "Warning", ["Multiple major sections suggest scope creep or mixed responsibilities."]

    return "Pass", []


def build_report(markdown_files: list[Path]) -> str:
    lines = [
        "# Instruction Validation Report",
        "",
        f"- Files processed: {len(markdown_files)}",
        "",
    ]

    total_warnings = 0
    total_failures = 0

    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        srp_status, srp_warnings = check_single_responsibility(path, text)
        markdown_status, markdown_warnings = check_markdown_consistency(text)
        action_items = extract_action_items(text)

        if srp_status.startswith("Warning") or markdown_status == "Warning":
            total_warnings += 1
        if srp_status.startswith("Fail") or markdown_status == "Fail":
            total_failures += 1

        lines.append(f"## {path.as_posix()}")
        lines.append(f"- SRP: {srp_status}")
        if srp_warnings:
            for warning in srp_warnings:
                lines.append(f"  - {warning}")
        lines.append(f"- Markdown: {markdown_status}")
        if markdown_warnings:
            for warning in markdown_warnings:
                lines.append(f"  - {warning}")
        lines.append("- Action items:")
        if action_items:
            for item in action_items:
                lines.append(f"  - [ ] {item}")
        else:
            lines.append("  - None extracted")
        lines.append("")

    lines.append(f"- Files with warnings: {total_warnings}")
    lines.append(f"- Files with failures: {total_failures}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate instruction files for SRP, formatting, and action items.")
    parser.add_argument("--instructions-dir", type=Path, default=Path(__file__).resolve().parent.parent / "instructions")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent.parent / "reports" / "instruction-validation-report.md")
    args = parser.parse_args()

    markdown_files = find_markdown_files(args.instructions_dir)
    if not markdown_files:
        raise SystemExit(f"No Markdown files found in {args.instructions_dir}")

    report_text = build_report(markdown_files)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report_text, encoding="utf-8")
    print(f"Validation report written to {args.output}")
    print(f"Processed files: {len(markdown_files)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
