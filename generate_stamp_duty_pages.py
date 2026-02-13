#!/usr/bin/env python3
"""
Generate individual stamp duty calculator pages for property prices across different ranges.
Each page will be pre-filled with the property price and include comprehensive SEO optimization.
"""

import os
import math

def calculate_stamp_duty(property_price, is_first_time_buyer=False, is_additional_property=False):
    """Calculate stamp duty for a given property price in England"""
    price = property_price

    # UK Stamp Duty bands for England, Wales, Northern Ireland (2025/26)
    bands = [
        {'threshold': 125000, 'rate': 0.00, 'label': 'Up to £125,000'},
        {'threshold': 250000, 'rate': 0.02, 'label': '£125,001 to £250,000'},
        {'threshold': 925000, 'rate': 0.05, 'label': '£250,001 to £925,000'},
        {'threshold': 1500000, 'rate': 0.10, 'label': '£925,001 to £1,500,000'},
        {'threshold': float('inf'), 'rate': 0.12, 'label': 'Above £1,500,000'}
    ]

    # First-time buyer relief (up to £500,000)
    if is_first_time_buyer and not is_additional_property and price <= 500000:
        bands = [
            {'threshold': 300000, 'rate': 0.00, 'label': 'Up to £300,000'},
            {'threshold': 500000, 'rate': 0.05, 'label': '£300,001 to £500,000'},
            {'threshold': float('inf'), 'rate': 0.00, 'label': 'Above £500,000 (follows standard rates)'}
        ]
    # Additional property surcharge (+5% on all bands)
    elif is_additional_property:
        for band in bands:
            band['rate'] += 0.05

    total_tax = 0
    band_breakdown = []
    previous_threshold = 0

    for band in bands:
        band_max = band['threshold']
        band_min = previous_threshold

        # Only calculate if property price exceeds band minimum
        if price <= band_min:
            break

        # Calculate taxable amount in this band
        if price >= band_max:
            taxable_in_band = band_max - band_min
        else:
            taxable_in_band = price - band_min

        if taxable_in_band > 0:
            tax_in_band = taxable_in_band * band['rate']
            total_tax += tax_in_band

            band_breakdown.append({
                'label': band['label'],
                'taxable_amount': taxable_in_band,
                'rate': band['rate'],
                'tax': tax_in_band
            })

        previous_threshold = band_max

        if price <= band_max:
            break

    return {
        'property_price': property_price,
        'total_stamp_duty': round(total_tax, 2),
        'effective_rate': round((total_tax / property_price) * 100, 2) if property_price > 0 else 0,
        'bands': band_breakdown,
        'is_first_time_buyer': is_first_time_buyer,
        'is_additional_property': is_additional_property
    }

def format_currency(amount):
    """Format amount as currency"""
    return f"£{amount:,.0f}"

def get_seo_keywords(price):
    """Generate SEO keywords for a specific property price"""
    price_str = str(price)
    price_short = price_str[:-3] + 'k'  # e.g., 300000 -> 300k

    # Base keywords from user's example, adapted for the specific price
    keywords = [
        f"stamp duty on {price_str}",
        f"stamp duty on {price_short} house UK",
        f"how much stamp duty on a {price_short} property",
        f"stamp duty on house price {price_str}",
        f"how much stamp duty on a {price_str} house in England",
        f"do first time buyers pay stamp duty on {price_str}",
        f"what stamp duty will I pay on a second home",
        f"stamp duty calculator 2025",
        f"current stamp duty rates UK",
        f"stamp duty on {price_short} house 2025/26",
        f"stamp duty calculator {price_str} London",
        f"stamp duty on {price_short} flat England"
    ]

    return keywords

def generate_page_content(property_price, calculations):
    """Generate the HTML content for a specific stamp duty calculator page"""

    price_str = str(property_price)
    price_short = price_str[:-3] + 'k'

    keywords = get_seo_keywords(property_price)

    # Meta description
    meta_description = f"How much stamp duty on a {format_currency(property_price)} property in England 2025/26? Calculate SDLT: Total stamp duty {format_currency(calculations['total_stamp_duty'])} ({calculations['effective_rate']:.1f}% effective rate)."

    # Title
    title = f"Stamp Duty on {format_currency(property_price)} House UK 2025/26 | SDLT Calculator"

    # Determine purchase type for content
    purchase_type = "standard main residence"
    if calculations['is_first_time_buyer']:
        purchase_type = "first-time buyer"
    elif calculations['is_additional_property']:
        purchase_type = "additional property/second home"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W8KXMNYDCS"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-W8KXMNYDCS');
    </script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{meta_description}">
    <meta name="keywords" content="{', '.join(keywords)}">
    <meta name="author" content="QuidWise">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.quidwise.co.uk/stamp-duty-calculator/{property_price}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.quidwise.co.uk/stamp-duty-calculator/{property_price}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{meta_description}">
    <meta property="og:image" content="https://www.quidwise.co.uk/logo.svg">
    <meta property="og:site_name" content="QuidWise">
    <meta property="og:locale" content="en_GB">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://www.quidwise.co.uk/stamp-duty-calculator/{property_price}">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{meta_description}">
    <meta name="twitter:image" content="https://www.quidwise.co.uk/logo.svg">

    <title>{title}</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Structured Data - Calculator -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "{format_currency(property_price)} Stamp Duty Calculator",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Any",
      "description": "{meta_description}",
      "offers": {{
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "GBP"
      }},
      "author": {{
        "@type": "Organization",
        "name": "QuidWise",
        "url": "https://www.quidwise.co.uk"
      }}
    }}
    </script>
</head>
<body>
    <!-- Navigation -->
    <nav class="main-nav">
        <div class="nav-container">
            <a href="../index.html" class="logo-link">
                <div class="quidwise-logo">
                    <img src="../logo.svg" alt="QuidWise Logo" class="logo-image">
                    <div class="logo-text-container">
                        <span class="logo-text">QuidWise</span>
                        <span class="logo-tagline">Make your pay go further</span>
                    </div>
                </div>
            </a>

            <ul class="nav-menu">
                <li class="nav-item dropdown">
                    <a href="#" class="nav-link">
                        Tax & Budgeting <i class="fas fa-chevron-down"></i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="../income-tax-calculator.html">Income Tax Calculator</a></li>
                        <li><a href="../budget-planner.html">Budget Planner</a></li>
                    </ul>
                </li>

                <li class="nav-item dropdown">
                    <a href="#" class="nav-link">
                        Mortgages & Property <i class="fas fa-chevron-down"></i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="../mortgage-calculator.html">Mortgage Calculator</a></li>
                        <li><a href="../mortgage-affordability.html">Mortgage Affordability</a></li>
                        <li><a href="../stamp-duty-calculator.html">Stamp Duty Calculator</a></li>
                        <li><a href="../find-mortgage-deals.html">Mortgage Rate Comparison</a></li>
                        <li><a href="../mortgage-overpayment.html">Mortgage Overpayment Calculator</a></li>
                        <li><a href="../buy-or-rent.html">Buy vs Rent Estimate</a></li>
                    </ul>
                </li>

                <li class="nav-item">
                    <a href="../blogs.html" class="nav-link">Blog</a>
                </li>
            </ul>

            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <div class="container">
        <div class="calculator-header">
            <h1><i class="fas fa-calculator"></i> {format_currency(property_price)} Stamp Duty Calculator</h1>
            <p class="subtitle">Calculate SDLT for a {format_currency(property_price)} property in England 2025/26</p>
        </div>

        <div class="calculator-results">
            <div class="result-card">
                <div class="result-header">
                    <h2>{format_currency(property_price)} Property Stamp Duty Breakdown</h2>
                </div>

                <div class="stamp-duty-summary">
                    <div class="summary-item">
                        <span class="label">Property Price:</span>
                        <span class="value price">{format_currency(calculations['property_price'])}</span>
                    </div>

                    <div class="summary-item">
                        <span class="label">Stamp Duty (SDLT):</span>
                        <span class="value tax">{format_currency(calculations['total_stamp_duty'])}</span>
                    </div>

                    <div class="summary-item">
                        <span class="label">Effective Rate:</span>
                        <span class="value rate">{calculations['effective_rate']:.1f}%</span>
                    </div>

                    <div class="summary-item total">
                        <span class="label">Total Cost:</span>
                        <span class="value total-cost">{format_currency(calculations['property_price'] + calculations['total_stamp_duty'])}</span>
                    </div>
                </div>

                <div class="band-breakdown">
                    <h3>Stamp Duty Band Breakdown</h3>
                    <div class="bands-table">
"""

    # Add band breakdown
    for band in calculations['bands']:
        if band['tax'] > 0:
            html_content += f"""                        <div class="band-row">
                            <div class="band-label">{band['label']}</div>
                            <div class="band-amount">{format_currency(band['taxable_amount'])}</div>
                            <div class="band-rate">{band['rate']*100:.0f}%</div>
                            <div class="band-tax">{format_currency(band['tax'])}</div>
                        </div>
"""

    html_content += f"""                    </div>
                </div>
            </div>

            <div class="calculator-info">
                <h3>Understanding Stamp Duty on {format_currency(property_price)}</h3>
                <p>For a {format_currency(property_price)} property in England, you'll pay {format_currency(calculations['total_stamp_duty'])} in Stamp Duty Land Tax (SDLT) for a {purchase_type} purchase.</p>

                <div class="key-points">
                    <h4>Key Information:</h4>
                    <ul>
                        <li><strong>Tax Year:</strong> 2025/26</li>
                        <li><strong>Location:</strong> England</li>
                        <li><strong>Purchase Type:</strong> {purchase_type.title()}</li>
                        <li><strong>Effective Rate:</strong> {calculations['effective_rate']:.1f}%</li>
                    </ul>
                </div>

                <div class="stamp-duty-options">
                    <h4>Other Purchase Types:</h4>
                    <div class="option-links">
                        <a href="../stamp-duty-calculator.html?price={property_price}&ftb=yes" class="option-link">
                            <i class="fas fa-home"></i> First-Time Buyer Relief
                        </a>
                        <a href="../stamp-duty-calculator.html?price={property_price}&additional=yes" class="option-link">
                            <i class="fas fa-building"></i> Additional Property
                        </a>
                    </div>
                </div>

                <div class="cta-section">
                    <p>Want to calculate stamp duty for a different property price?</p>
                    <a href="../stamp-duty-calculator.html" class="cta-button">
                        <i class="fas fa-calculator"></i> Use Full Calculator
                    </a>
                </div>
            </div>
        </div>

        <footer>
            <div class="footer-content">
                <p class="disclaimer">
                    <i class="fas fa-info-circle"></i>
                    <strong>Disclaimer:</strong> Stamp Duty rates for 2025/26. This calculator is for estimation purposes only. Actual SDLT may vary based on specific circumstances.
                </p>
                <div class="footer-badges">
                    <span class="badge"><i class="fas fa-shield-alt"></i> Privacy-First</span>
                    <span class="badge"><i class="fas fa-lock"></i> Secure</span>
                    <span class="badge"><i class="fas fa-map-marker-alt"></i> Made for UK</span>
                </div>
                <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">
                    © 2025 QuidWise. All rights reserved..
                </p>
                <p style="font-size: 0.75rem; opacity: 0.6; line-height: 1.5; margin-top: 0.5rem;">
                    We aim to provide calculators and guides, but can't guarantee perfection. Use this information at your own risk. This is not financial advice—always research for your specific circumstances. While we link to other sites, we're not responsible for their content. Product prices and terms can change after publication, so always verify directly with providers. We can't investigate every company's financial stability, and there's always a risk of business failure.
                </p>
            </div>
        </footer>
    </div>

    <script src="../stamp-duty-calculator.js"></script>
    <script src="../navigation.js"></script>
</body>
</html>"""

    return html_content

def generate_property_prices():
    """Generate all property prices according to the specified ranges"""
    prices = []

    # 200k to 400k in £5k intervals
    for price in range(200000, 400001, 5000):
        prices.append(price)

    # 400k to 700k in £10k intervals
    for price in range(400000, 700001, 10000):
        prices.append(price)

    # 700k to 1m in £25k intervals
    for price in range(700000, 1000001, 25000):
        prices.append(price)

    return sorted(list(set(prices)))  # Remove duplicates and sort

def main():
    """Generate all stamp duty calculator pages"""
    prices = generate_property_prices()

    print(f"Generating {len(prices)} stamp duty calculator pages...")

    # Create output directory if it doesn't exist
    output_dir = "stamp-duty-calculator"
    os.makedirs(output_dir, exist_ok=True)

    # Generate each page
    for price in prices:
        # Assume standard main residence purchase (not FTB, not additional)
        # Could be enhanced to generate different types, but for now using standard
        calculations = calculate_stamp_duty(price, is_first_time_buyer=False, is_additional_property=False)

        # Generate page content
        content = generate_page_content(price, calculations)

        # Write to file
        filename = f"{price}.html"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Generated: {filename} - Stamp Duty: £{calculations['total_stamp_duty']:,.0f}")

    print(f"\nSuccessfully generated {len(prices)} stamp duty calculator pages!")
    print(f"Pages saved in: {output_dir}/")
    print(f"URL format: quidwise.co.uk/stamp-duty-calculator/[price]")

if __name__ == "__main__":
    main()

