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
