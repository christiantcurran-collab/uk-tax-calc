#!/usr/bin/env python3
"""
Test the income tax calculation regeneration script with just a few salaries.
"""

import os
import math

def calculate_net_pay(salary, tax_year='2025/26', has_pension=False, pension_percentage=0):
    """Calculate net pay using the same logic as the JavaScript calculator (NO pension by default)"""

    # Personal allowance
    personal_allowance = 12570

    # Calculate pension contribution (NONE by default to match the calculator)
    annual_pension_contribution = 0
    if has_pension:
        annual_pension_contribution = (salary * pension_percentage) / 100

    # Adjusted gross salary (after pension deduction if any)
    adjusted_gross = salary - annual_pension_contribution

    # Calculate taxable income
    taxable_income = max(0, adjusted_gross - personal_allowance)

    # Calculate income tax
    tax = 0
    if taxable_income > 0:
        # Basic rate: 20% on first £37,700 of taxable income
        basic_rate_amount = min(taxable_income, 37700)
        tax += basic_rate_amount * 0.20

        # Higher rate: 40% on remaining taxable income
        higher_rate_amount = max(0, taxable_income - 37700)
        tax += higher_rate_amount * 0.40

    # Calculate National Insurance (8% between £12,570 and £50,270, then 2% above)
    ni_threshold = 12570
    ni_upper_limit = 50270
    ni = 0

    if adjusted_gross > ni_threshold:
        # 8% on earnings between threshold and upper limit
        ni_earnings_basic = min(adjusted_gross, ni_upper_limit) - ni_threshold
        ni += ni_earnings_basic * 0.08

        # 2% on earnings above upper limit
        if adjusted_gross > ni_upper_limit:
            ni_earnings_upper = adjusted_gross - ni_upper_limit
            ni += ni_earnings_upper * 0.02

    # Calculate net pay
    net_pay = adjusted_gross - tax - ni

    return {
        'gross': salary,
        'pension': round(annual_pension_contribution, 2),
        'adjusted_gross': round(adjusted_gross, 2),
        'tax': round(tax, 2),
        'ni': round(ni, 2),
        'net': round(net_pay, 2),
        'monthly': round(net_pay / 12, 2),
        'weekly': round(net_pay / 52, 2)
    }

def format_currency(amount):
    """Format amount as currency"""
    return f"£{amount:,.0f}" if amount >= 100 else f"£{amount:,.2f}"

def main():
    """Test with just a few salaries"""

    test_salaries = [20000, 30000, 40000, 50000, 60000]

    print("Testing income tax calculations:")
    print("=" * 50)

    for salary in test_salaries:
        # Calculate with NO pension (to match calculator default state)
        calculations = calculate_net_pay(salary, has_pension=False, pension_percentage=0)

        print(f"£{salary:,} Salary:")
        print(f"  Gross: £{calculations['gross']:,}")
        print(f"  Tax: £{calculations['tax']:,}")
        print(f"  NI: £{calculations['ni']:,}")
        print(f"  Net: £{calculations['net']:,} (Monthly: £{calculations['monthly']:,})")
        print()

if __name__ == "__main__":
    main()

