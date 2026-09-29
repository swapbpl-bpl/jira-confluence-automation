# Python Validation Rules

Use these checks when reviewing or validating Python files before accepting them as complete.

## 1. Syntax and Import Safety
- The file must run without Python syntax errors.
- All imported modules must exist in the active environment or project dependencies.
- No unresolved names or missing imports should remain in the file.

## 2. Function and Script Behavior
- Public functions and scripts should do exactly what their name and docstring describe.
- Entry-point code (for example `if __name__ == "__main__":`) should only run when the file is executed directly.
- Functions should return values or perform actions consistently with their intended purpose.

## 3. Input and Output Handling
- User inputs, CLI arguments, and file paths should be validated before use.
- Output paths and generated files should be created in the correct directory and with the expected format.
- Error messages should be clear and actionable when something fails.

## 4. Data and Type Correctness
- Variables and function arguments should hold values that match the expected types.
- String formatting, list operations, and dictionary access should be safe and deliberate.
- Avoid assumptions that a value is always present when it may be empty or `None`.

## 5. Code Quality and Maintainability
- Keep functions focused on one task; avoid large, hard-to-follow blocks.
- Use descriptive names for variables, functions, and constants.
- Remove dead code, duplicate logic, and unused imports.
- Include docstrings or comments only when they help clarify intent.

## 6. Repository and Reporting Standards
- The script should generate output in the expected project location such as `status-reports/` or `stakeholder-reports/` when appropriate.
- File writes should use UTF-8 encoding when text output is expected.
- The script should follow project conventions for CLI usage, naming, and documentation.

## 7. Final Review Check
- Run the script or a focused validation command to confirm it works in practice.
- Confirm the output is correct, readable, and consistent with the requested task.
- Verify that no warnings, errors, or runtime failures appear during normal execution.
