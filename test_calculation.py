#!/usr/bin/env python3
# Test the tax calculation logic

def calculate_net_pay(salary, tax_year='2025/26'):
    # Personal allowance
    personal_allowance = 12570

    # Calculate taxable income
    taxable_income = max(0, salary - personal_allowance)

    # Calculate income tax
    tax = 0
    if taxable_income > 0:
        # Basic rate: 20% on first £37,700 of taxable income
        basic_rate_amount = min(taxable_income, 37700)
        tax += basic_rate_amount * 0.20

        # Higher rate: 40% on remaining taxable income
        higher_rate_amount = max(0, taxable_income - 37700)
        tax += higher_rate_amount * 0.40

    # Calculate National Insurance (8% between £12,570 and £50,270)
    ni_threshold = 12570
    ni_upper_limit = 50270
    ni = 0

    if salary > ni_threshold:
        ni_earnings = min(salary, ni_upper_limit) - ni_threshold
        ni += ni_earnings * 0.08

    # Net pay
    net_pay = salary - tax - ni

    return {
        'gross': salary,
        'tax': round(tax, 2),
        'ni': round(ni, 2),
        'net': round(net_pay, 2),
        'monthly': round(net_pay / 12, 2)
    }

# Test £60,000
result = calculate_net_pay(60000)
print('£60,000 calculation:')
print(f'Gross: £{result["gross"]:,}')
print(f'Tax: £{result["tax"]:,}')
print(f'NI: £{result["ni"]:,}')
print(f'Net: £{result["net"]:,}')
print(f'Monthly: £{result["monthly"]:,}')

# Test £30,000
result2 = calculate_net_pay(30000)
print('\n£30,000 calculation:')
print(f'Gross: £{result2["gross"]:,}')
print(f'Tax: £{result2["tax"]:,}')
print(f'NI: £{result2["ni"]:,}')
print(f'Net: £{result2["net"]:,}')
print(f'Monthly: £{result2["monthly"]:,}')

