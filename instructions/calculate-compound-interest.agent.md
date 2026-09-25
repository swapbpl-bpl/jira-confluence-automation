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
