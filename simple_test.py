#!/usr/bin/env python3

def calculate_net_pay(salary):
    personal_allowance = 12570
    taxable_income = max(0, salary - personal_allowance)

    tax = 0
    if taxable_income > 0:
        basic_rate_amount = min(taxable_income, 37700)
        tax += basic_rate_amount * 0.20
        higher_rate_amount = max(0, taxable_income - 37700)
        tax += higher_rate_amount * 0.40

    ni_threshold = 12570
    ni_upper_limit = 50270
    ni = 0

    if salary > ni_threshold:
        ni_earnings_basic = min(salary, ni_upper_limit) - ni_threshold
        ni += ni_earnings_basic * 0.08
        if salary > ni_upper_limit:
            ni_earnings_upper = salary - ni_upper_limit
            ni += ni_earnings_upper * 0.02

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
print(f"£60,000 calculation:")
print(f"Gross: £{result['gross']:,}")
print(f"Tax: £{result['tax']:,}")
print(f"NI: £{result['ni']:,}")
print(f"Net: £{result['net']:,}")
print(f"Monthly: £{result['monthly']:,}")

