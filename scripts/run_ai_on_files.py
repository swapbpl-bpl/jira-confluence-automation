#!/usr/bin/env python3
"""Send target files to an AI model and save the response.

This script:
  1. Finds target files matching one or more file globs.
  2. Builds a prompt using the provided instruction and file contents.
  3. Sends that prompt to either an OpenAI-compatible HTTP API or a CLI command.
  4. Saves the AI response to an output file.

Example usage:
    python scripts/run_ai_on_files.py \
      --targets "scripts/*.py" "tools/*.py" \
      --instruction "Review this file for errors and provide improvements." \
      --output out/ai-review.txt

    python scripts/run_ai_on_files.py \
      --targets "**/*.py" \
      --instruction "Summarize this code." \
      --provider cli \
      --cli-command "python -c \"import sys; print(sys.argv[1])\" {prompt}"
"""

from __future__ import annotations

import argparse
import glob
import os
import shlex
import subprocess
import sys
from pathlib import Path

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None


def list_target_files(patterns: list[str]) -> list[Path]:
    files: set[Path] = set()
    for pattern in patterns:
        matches = glob.glob(pattern, recursive=True)
        for match in matches:
            path = Path(match)
            if path.is_file():
                files.add(path.resolve())

    return sorted(files)


def read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def build_prompt(instruction: str, file_path: Path, file_contents: str) -> str:
    return (
        "You are reviewing a file for the user.\n\n"
        f"Instruction:\n{instruction}\n\n"
        f"File path: {file_path}\n\n"
        "File contents:\n"
        "```text\n"
        f"{file_contents}\n"
        "```\n"
    )


def call_ai_via_api(prompt: str, api_key: str, model: str, base_url: str, timeout: int) -> str:
    if requests is None:
        raise RuntimeError("The 'requests' package is required for API mode. Install it with: pip install requests")

    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=payload, timeout=timeout)
    response.raise_for_status()
    data = response.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Unexpected API response format: {data}")


def call_ai_via_cli(prompt: str, cli_command: str, file_path: Path) -> str:
    if not cli_command.strip():
        raise ValueError("--cli-command is required when using --provider cli")

    command = cli_command
    command = command.replace("{prompt}", shlex.quote(prompt))
    command = command.replace("{file_path}", shlex.quote(str(file_path)))
    command = command.replace("{instruction}", shlex.quote(prompt))

    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        stderr = result.stderr.strip() or "Unknown CLI error"
        raise RuntimeError(f"AI CLI command failed: {stderr}")

    return result.stdout.strip()


def main() -> int:
    parser = argparse.ArgumentParser(description="Review target files with an AI and save the output.")
    parser.add_argument("--targets", nargs="+", required=True, help="One or more glob patterns for files to process.")
    parser.add_argument("--instruction", required=True, help="Instruction to send to the AI for every file.")
    parser.add_argument("--output", required=True, help="Path to the output file that will contain the results.")
    parser.add_argument("--provider", choices=["api", "cli"], default="api", help="AI provider to use.")
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), help="Model name for the API provider.")
    parser.add_argument("--base-url", default=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"), help="API base URL for OpenAI-compatible endpoints.")
    parser.add_argument("--api-key", default=os.getenv("OPENAI_API_KEY", ""), help="API key for the OpenAI-compatible endpoint.")
    parser.add_argument("--cli-command", default=os.getenv("AI_CLI_COMMAND", ""), help="Shell command template used when --provider cli is selected. Use {prompt} or {file_path} placeholders.")
    parser.add_argument("--timeout", type=int, default=60, help="HTTP timeout in seconds for API mode.")
    args = parser.parse_args()

    files = list_target_files(args.targets)
    if not files:
        raise SystemExit(f"No files found for target patterns: {args.targets}")

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    results: list[str] = []

    for file_path in files:
        try:
            text = read_text_file(file_path)
            prompt = build_prompt(args.instruction, file_path, text)

            if args.provider == "api":
                if not args.api_key:
                    raise ValueError("OPENAI_API_KEY or --api-key is required when using --provider api")
                answer = call_ai_via_api(prompt, args.api_key, args.model, args.base_url, args.timeout)
            else:
                answer = call_ai_via_cli(prompt, args.cli_command, file_path)

            results.append(f"===== File: {file_path} =====\n{answer}\n")
            print(f"Processed: {file_path}")
        except Exception as exc:  # pragma: no cover
            results.append(f"===== File: {file_path} =====\nERROR: {exc}\n")
            print(f"Failed: {file_path}: {exc}", file=sys.stderr)

    output_path.write_text("\n".join(results), encoding="utf-8")
    print(f"\nSaved results to: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
