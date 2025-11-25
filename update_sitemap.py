#!/usr/bin/env python3
"""
Generate updated sitemap.xml with all new pre-filled calculator pages and blog posts.
"""

import os
from datetime import datetime

def generate_sitemap_entries():
    """Generate sitemap entries for all new pages"""

    entries = []

    # Income Tax Calculator Pages (priority 0.6, changefreq monthly)
    for amount in range(20000, 70001, 500):
        entries.append({
            'url': f'https://www.quidwise.co.uk/income-tax-calculator/{amount}.html',
            'lastmod': '2025-11-24',
            'changefreq': 'monthly',
            'priority': '0.6'
        })

    # Stamp Duty Calculator Pages (priority 0.6, changefreq monthly)
    # 200k to 400k in 5k intervals
    for amount in range(200000, 400001, 5000):
        entries.append({
            'url': f'https://www.quidwise.co.uk/stamp-duty-calculator/{amount}.html',
            'lastmod': '2025-11-24',
            'changefreq': 'monthly',
            'priority': '0.6'
        })

    # 400k to 700k in 10k intervals
    for amount in range(400000, 700001, 10000):
        entries.append({
            'url': f'https://www.quidwise.co.uk/stamp-duty-calculator/{amount}.html',
            'lastmod': '2025-11-24',
            'changefreq': 'monthly',
            'priority': '0.6'
        })

    # 700k to 1m in 25k intervals
    for amount in range(700000, 1000001, 25000):
        entries.append({
            'url': f'https://www.quidwise.co.uk/stamp-duty-calculator/{amount}.html',
            'lastmod': '2025-11-24',
            'changefreq': 'monthly',
            'priority': '0.6'
        })

    # New Salary Blog Posts (priority 0.7, changefreq monthly)
    salary_blogs = [
        ('blog-25k-salary-take-home.html', '2025-11-24'),
        ('blog-42k-salary-take-home.html', '2025-11-23'),
        ('blog-60k-salary-take-home.html', '2025-11-22')
    ]

    for blog_file, date in salary_blogs:
        entries.append({
            'url': f'https://www.quidwise.co.uk/{blog_file}',
            'lastmod': date,
            'changefreq': 'monthly',
            'priority': '0.7'
        })

    return entries

def generate_sitemap_xml():
    """Generate the complete sitemap.xml content"""

    entries = generate_sitemap_entries()

    xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>https://www.quidwise.co.uk/</loc>
    <lastmod>2025-11-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Calculators - High Priority -->
  <url>
    <loc>https://www.quidwise.co.uk/income-tax-calculator.html</loc>
    <lastmod>2025-11-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/mortgage-calculator.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/stamp-duty-calculator.html</loc>
    <lastmod>2025-11-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/mortgage-affordability.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/budget-planner.html</loc>
    <lastmod>2025-11-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/mortgage-overpayment.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/buy-or-rent.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Comparison Pages -->
  <url>
    <loc>https://www.quidwise.co.uk/find-mortgage-deals.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/broadband-tv.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/energy.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/mobile.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Blog Hub -->
  <url>
    <loc>https://www.quidwise.co.uk/blogs.html</loc>
    <lastmod>2025-11-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Pre-filled Income Tax Calculator Pages -->
'''

    # Add income tax calculator entries
    for entry in entries:
        if 'income-tax-calculator/' in entry['url']:
            xml_content += f'''  <url>
    <loc>{entry['url']}</loc>
    <lastmod>{entry['lastmod']}</lastmod>
    <changefreq>{entry['changefreq']}</changefreq>
    <priority>{entry['priority']}</priority>
  </url>
'''

    xml_content += '''
  <!-- Pre-filled Stamp Duty Calculator Pages -->
'''

    # Add stamp duty calculator entries
    for entry in entries:
        if 'stamp-duty-calculator/' in entry['url']:
            xml_content += f'''  <url>
    <loc>{entry['url']}</loc>
    <lastmod>{entry['lastmod']}</lastmod>
    <changefreq>{entry['changefreq']}</changefreq>
    <priority>{entry['priority']}</priority>
  </url>
'''

    xml_content += '''
  <!-- Blog Posts - Latest First -->
  <url>
    <loc>https://www.quidwise.co.uk/blog-25k-salary-take-home.html</loc>
    <lastmod>2025-11-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-42k-salary-take-home.html</loc>
    <lastmod>2025-11-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-60k-salary-take-home.html</loc>
    <lastmod>2025-11-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-200k-mortgage-repayments.html</loc>
    <lastmod>2025-11-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-sdlt-budget-changes.html</loc>
    <lastmod>2025-11-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-350k-stamp-duty-ftb.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-40k-vs-45k-salary.html</loc>
    <lastmod>2025-11-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-60k-salary-student-loan.html</loc>
    <lastmod>2025-11-17</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-35k-salary-take-home.html</loc>
    <lastmod>2025-11-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-draft-excluder.html</loc>
    <lastmod>2025-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-mortgage-costs-2025.html</loc>
    <lastmod>2025-11-17</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-fscs-limit-increase.html</loc>
    <lastmod>2025-11-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-budget-2025-autumn.html</loc>
    <lastmod>2025-11-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-broadband-speed-guide.html</loc>
    <lastmod>2025-11-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-budget-2025.html</loc>
    <lastmod>2025-10-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-mortgage-rates-2024.html</loc>
    <lastmod>2025-10-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-mortgage-overpayment.html</loc>
    <lastmod>2025-10-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-isa-guide.html</loc>
    <lastmod>2025-10-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-income-tax-guide.html</loc>
    <lastmod>2025-09-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.quidwise.co.uk/blog-stamp-duty-guide.html</loc>
    <lastmod>2025-09-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>'''

    return xml_content

def main():
    """Generate and save the updated sitemap.xml"""

    print("Generating updated sitemap.xml with all new pages...")

    # Generate the sitemap content
    sitemap_content = generate_sitemap_xml()

    # Write to file
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)

    print("✅ Updated sitemap.xml generated!")
    print(f"📊 Total pages in sitemap: {sitemap_content.count('<url>')}")
    print("📁 Includes all new calculator and blog pages")

if __name__ == "__main__":
    main()

