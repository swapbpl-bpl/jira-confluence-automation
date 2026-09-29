import datetime as dt
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import generate_status_report


class GenerateStatusReportTests(unittest.TestCase):
    def test_previous_week_window_uses_complete_monday_to_sunday(self):
        start, end = generate_status_report.previous_week_window(dt.date(2026, 9, 28))

        self.assertEqual(start, dt.date(2026, 9, 21))
        self.assertEqual(end, dt.date(2026, 9, 27))

    def test_get_commits_uses_utc_half_open_date_window(self):
        with patch.object(generate_status_report.subprocess, "run") as run:
            run.return_value.stdout = ""
            generate_status_report.get_commits(
                Path("repo"), dt.date(2026, 9, 21), dt.date(2026, 9, 27), None
            )

        command = run.call_args.args[0]
        self.assertIn("--since=2026-09-21T00:00:00Z", command)
        self.assertIn("--before=2026-09-28T00:00:00Z", command)

    def test_report_uses_notes_and_has_exact_required_sections(self):
        with tempfile.TemporaryDirectory() as directory:
            notes_path = Path(directory) / "weekly-input.md"
            notes_path.write_text(
                "## Blockers\n- Waiting on review\n\n## Next Week\n- Ship the fix\n",
                encoding="utf-8",
            )
            repo = generate_status_report.WORKSPACE_ROOT / "apps"
            commit = {"date": "2026-09-23", "subject": "Add report view"}
            with patch.object(generate_status_report, "get_commits", return_value=[commit]):
                report = generate_status_report.build_report(
                    [repo], dt.date(2026, 9, 21), dt.date(2026, 9, 27), None, notes_path
                )

        self.assertEqual(
            [line for line in report.splitlines() if line.startswith("## ")],
            ["## Accomplishments", "## Blockers", "## Next Week"],
        )
        self.assertIn("- apps: Add report view", report)
        self.assertIn("- Waiting on review", report)
        self.assertIn("- Ship the fix", report)
        self.assertLessEqual(len(report.splitlines()), 20)

    def test_missing_data_is_not_invented(self):
        with tempfile.TemporaryDirectory() as directory:
            notes_path = Path(directory) / "missing.md"
            repo = generate_status_report.WORKSPACE_ROOT / "apps"
            with patch.object(generate_status_report, "get_commits", return_value=[]):
                report = generate_status_report.build_report(
                    [repo], dt.date(2026, 9, 21), dt.date(2026, 9, 27), None, notes_path
                )

        self.assertIn("- No repository activity recorded.", report)
        self.assertEqual(report.count("- No weekly notes supplied."), 2)
        self.assertLessEqual(len(report.splitlines()), 20)


if __name__ == "__main__":
    unittest.main()