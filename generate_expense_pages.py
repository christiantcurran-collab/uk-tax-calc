#!/usr/bin/env python3
"""
Generate individual expense category deep-dive pages for SEO.
Each page is ~1000-1500 words of genuinely helpful content about that expense category.
"""

import os

# Category data with full SEO content
CATEGORIES = [
    {
        "id": "office-supplies",
        "name": "Office, Stationery & Software",
        "hmrc_category": "Office costs",
        "icon": "fa-desktop",
        "meta_title": "Self-Employed Office Expenses UK | What Can You Claim? | QuidWise",
        "meta_description": "Complete guide to claiming office expenses as self-employed in the UK. Software, phone bills, computer equipment, stationery and more. Updated for 2025/26.",
        "keywords": "self employed office expenses, office costs HMRC, software subscriptions tax deductible UK, can I claim phone bill self employed, freelancer office equipment",
        "intro": "If you're self-employed in the UK, your office costs are one of the biggest and most straightforward categories of expenses you can claim against your tax bill. From the pen on your desk to the software on your laptop, HMRC allows you to deduct the cost of running your workspace.",
        "content_sections": [
            {
                "heading": "What Counts as Office Expenses?",
                "text": """<p>HMRC's "Office costs" category on the SA103 Self Assessment form covers a wide range of everyday business spending. The key test is that the expense must be <strong>wholly and exclusively</strong> for business purposes — or, if shared with personal use, only the business proportion can be claimed.</p>
<p>Here are the main items you can claim:</p>
<ul>
    <li><strong>Stationery and printing:</strong> Paper, pens, ink cartridges, notebooks, folders, sticky notes — all fully claimable if used for business.</li>
    <li><strong>Postage and packaging:</strong> Stamps, courier fees (Royal Mail, DPD, etc.), padded envelopes, and packaging materials for sending goods or documents.</li>
    <li><strong>Software subscriptions:</strong> Adobe Creative Cloud, Microsoft 365, Slack, Trello, Xero, accounting software — any tool you pay for monthly or annually for business use.</li>
    <li><strong>Phone bills:</strong> The business proportion of your mobile or landline. If you estimate 60% of calls are for business, claim 60% of the bill.</li>
    <li><strong>Internet:</strong> The business proportion of your broadband. If you work from home, a common split is 25-50% depending on usage.</li>
    <li><strong>Computer equipment:</strong> Laptops, monitors, keyboards, mice, printers, external drives. Items under roughly &pound;1,000 that will last less than 2 years are usually treated as expenses; bigger items may need to go through capital allowances.</li>
    <li><strong>Domain names and hosting:</strong> Website hosting fees, domain registration, SSL certificates, and email hosting.</li>
</ul>"""
            },
            {
                "heading": "What You CANNOT Claim",
                "text": """<p>It's just as important to know what's <em>not</em> allowable:</p>
<ul>
    <li><strong>Personal phone calls:</strong> Only the business proportion of a shared phone bill is claimable. If you have a separate business phone, the entire bill can be claimed.</li>
    <li><strong>Full broadband bill:</strong> Unless your broadband is used 100% for business (rare if you live in the property), you can only claim the business proportion.</li>
    <li><strong>Personal software:</strong> Netflix, Spotify, gaming subscriptions, personal cloud storage — these are personal and not claimable even if you occasionally use them during work hours.</li>
    <li><strong>Capital items (over threshold):</strong> High-value items like an expensive camera or a &pound;3,000 MacBook Pro may need to be claimed as capital allowances rather than expenses, depending on your accounting method.</li>
</ul>"""
            },
            {
                "heading": "How to Calculate Your Phone and Broadband Split",
                "text": """<p>HMRC doesn't prescribe an exact method for splitting shared bills, but they expect your estimate to be reasonable and evidenced. Here are two approaches:</p>
<h4>Method 1: Usage-based estimate</h4>
<p>Review your phone bill for a typical month. Count the business calls versus personal calls. If 70% of your calls and data usage is business-related, claim 70% of the monthly bill. Keep a record of how you calculated this.</p>
<h4>Method 2: Time-based estimate</h4>
<p>If your broadband is shared between work and personal use, estimate how many hours per week you use it for business versus personal. For example, if you work 40 hours a week from home and use the internet for personal use for 20 hours, your business proportion is roughly 67%.</p>
<p><strong>Tip:</strong> Whichever method you choose, stick with it consistently and keep a note of your reasoning. HMRC is unlikely to challenge a reasonable estimate, but they will challenge one that looks inflated.</p>"""
            },
            {
                "heading": "Computer Equipment: Expenses vs Capital Allowances",
                "text": """<p>There's a common question about whether computer equipment should be claimed as an expense or a capital allowance. The answer depends on two things: the cost and your accounting method.</p>
<p>If you use <strong>cash basis accounting</strong> (the default for most sole traders earning under &pound;150,000), you can claim most equipment as an expense in the year you buy it, regardless of the price. The main exception is cars.</p>
<p>If you use <strong>accruals accounting</strong>, items expected to last more than 2 years and costing more than roughly &pound;1,000 are usually claimed through capital allowances (Annual Investment Allowance) which still gives you 100% relief in year one.</p>
<p>If a computer is used partly for personal and partly for business, you can only claim the business proportion. For example, a &pound;1,000 laptop used 80% for business = &pound;800 claimable.</p>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Office Expenses for a Freelance Designer",
            "lines": [
                ("Adobe Creative Cloud (12 months)", 600),
                ("Microsoft 365 subscription", 80),
                ("New monitor", 350),
                ("Stationery and printing", 60),
                ("Phone bill (70% business)", 420),
                ("Broadband (50% business)", 180),
                ("Domain names and hosting", 120),
            ],
            "total_label": "Total claimable office expenses",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax, plus National Insurance savings."
        }
    },
    {
        "id": "travel",
        "name": "Travel & Mileage",
        "hmrc_category": "Travel costs",
        "icon": "fa-car",
        "meta_title": "Self-Employed Travel Expenses & Mileage UK | Claim Guide | QuidWise",
        "meta_description": "How to claim travel expenses and mileage as self-employed in the UK. 45p/mile rate, public transport, hotels. Complete HMRC guide for 2025/26.",
        "keywords": "self employed travel expenses, mileage claim self employed, 45p per mile HMRC, freelancer travel costs, business mileage UK",
        "intro": "Travel expenses are one of the most commonly claimed — and most commonly misunderstood — categories for self-employed people. Get it right and you could save hundreds of pounds a year. Get it wrong and you risk an HMRC enquiry.",
        "content_sections": [
            {
                "heading": "What Travel Costs Can You Claim?",
                "text": """<p>You can claim the cost of business journeys — getting to clients, attending meetings, visiting suppliers, or travelling for business purposes away from your usual workplace. Here's what qualifies:</p>
<ul>
    <li><strong>Mileage (simplified rate):</strong> 45p per mile for the first 10,000 miles, then 25p per mile. This is the most popular method and covers fuel, insurance, wear and tear, MOT, and servicing all in one rate.</li>
    <li><strong>Public transport:</strong> Train, bus, tube, and tram fares for business journeys.</li>
    <li><strong>Parking:</strong> Business-related parking charges (but NOT parking fines).</li>
    <li><strong>Congestion charges and tolls:</strong> For business journeys only.</li>
    <li><strong>Hotels and overnight stays:</strong> When you need to stay away from home for business.</li>
    <li><strong>Flights:</strong> For business trips. Economy class is the safest — HMRC may query business class for a sole trader.</li>
    <li><strong>Taxis and ride-sharing:</strong> Uber, taxis for business purposes.</li>
</ul>"""
            },
            {
                "heading": "The Commuting Rule: The Biggest Trap",
                "text": """<p>Here's the rule that catches people out: <strong>travel between your home and your regular workplace is commuting, and commuting is NOT claimable.</strong></p>
<p>However, there are important nuances:</p>
<ul>
    <li>If you <strong>work from home</strong> and travel to a client's office or a meeting, that IS a business journey because your home is your regular workplace.</li>
    <li>If you have a rented office and drive there every day, that commute is NOT claimable.</li>
    <li>If you travel from your office to visit a client, that IS claimable.</li>
    <li>If you go to a <strong>temporary workplace</strong> (a site or location where you'll work for less than 24 months), those journeys ARE claimable.</li>
</ul>
<p><strong>The key distinction:</strong> Regular commute = not claimable. Travel to temporary/client sites = claimable.</p>"""
            },
            {
                "heading": "Mileage Rate vs Actual Costs: Which to Choose?",
                "text": """<p>You have two options for claiming vehicle costs, but you must choose one method per vehicle and stick with it:</p>
<h4>Option 1: Simplified Mileage Rate (Recommended for most)</h4>
<p>Claim 45p per mile for the first 10,000 miles, then 25p per mile. This single rate covers everything — fuel, insurance, repairs, servicing, MOT, and depreciation. You <em>cannot</em> claim any of these separately.</p>
<p>You CAN still claim parking and tolls on top of the mileage rate.</p>
<h4>Option 2: Actual Vehicle Costs</h4>
<p>Claim the actual cost of fuel, insurance, repairs, road tax, MOT, breakdown cover, and depreciation — but only the business proportion. You'll need to track all costs and calculate the percentage of miles driven for business.</p>
<p><strong>Our recommendation:</strong> The mileage rate is simpler, requires less record-keeping, and is often more generous for small-to-medium mileage. Use actual costs only if you drive a very fuel-efficient car and have high mileage.</p>"""
            },
            {
                "heading": "Record-Keeping for Mileage",
                "text": """<p>HMRC expects you to keep a mileage log. For each business journey, record:</p>
<ul>
    <li>Date of the journey</li>
    <li>From and to locations</li>
    <li>Miles driven</li>
    <li>Purpose of the journey (e.g. "Client meeting with ABC Ltd")</li>
</ul>
<p>You can use a simple spreadsheet, a notes app, or a dedicated mileage tracking app. The key is to record journeys as they happen — HMRC is sceptical of mileage logs created months later from memory.</p>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Travel Costs for a Self-Employed Consultant",
            "lines": [
                ("Business mileage: 8,000 miles at 45p", 3600),
                ("Train fares to London meetings", 480),
                ("Parking (business)", 120),
                ("Hotels (3 overnight trips)", 450),
                ("Congestion charge (12 trips)", 180),
            ],
            "total_label": "Total claimable travel expenses",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax, plus National Insurance savings."
        }
    },
    {
        "id": "working-from-home",
        "name": "Working from Home",
        "hmrc_category": "Premises costs",
        "icon": "fa-house-laptop",
        "meta_title": "Working from Home Expenses Self-Employed UK | HMRC Guide | QuidWise",
        "meta_description": "How much can you claim for working from home as self-employed? Flat rate vs actual costs, what's included, and how to calculate. HMRC guide 2025/26.",
        "keywords": "working from home expenses HMRC, self employed work from home claim, flat rate working from home, home office expenses UK, use of home as office",
        "intro": "If you work from home — whether full-time or part of the week — you can claim a proportion of your household costs as a business expense. This is one of the most valuable and underused expense categories for freelancers.",
        "content_sections": [
            {
                "heading": "Two Ways to Claim: Flat Rate vs Actual Costs",
                "text": """<p>HMRC gives you two methods. You can choose whichever saves you more.</p>
<h4>Method 1: Simplified Flat Rate (easiest)</h4>
<p>If you work from home for at least 25 hours a month, you can claim a fixed amount with no receipts needed:</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<tr style="background:#f0faf4;"><th style="text-align:left;padding:0.5rem 1rem;border-bottom:1px solid #ddd;">Hours worked from home per month</th><th style="text-align:right;padding:0.5rem 1rem;border-bottom:1px solid #ddd;">Flat rate</th></tr>
<tr><td style="padding:0.5rem 1rem;border-bottom:1px solid #eee;">25-50 hours</td><td style="text-align:right;padding:0.5rem 1rem;border-bottom:1px solid #eee;">&pound;10/month</td></tr>
<tr><td style="padding:0.5rem 1rem;border-bottom:1px solid #eee;">51-100 hours</td><td style="text-align:right;padding:0.5rem 1rem;border-bottom:1px solid #eee;">&pound;18/month</td></tr>
<tr><td style="padding:0.5rem 1rem;">101+ hours</td><td style="text-align:right;padding:0.5rem 1rem;">&pound;26/month</td></tr>
</table>
<p>At the maximum rate, this gives you &pound;312 per year. Simple, but often less than actual costs.</p>
<h4>Method 2: Actual Costs (usually saves more)</h4>
<p>Calculate the business proportion of your actual household bills. This takes more effort but can be worth significantly more — especially if you have a dedicated office room.</p>"""
            },
            {
                "heading": "How to Calculate Your Actual Costs",
                "text": """<p>To work out the business proportion of your household bills, use this formula:</p>
<p style="background:#f5f5f5;padding:1rem;border-radius:8px;text-align:center;font-weight:600;">(Area of office &divide; Total area of home) &times; (Hours used for work &divide; Total hours in the period)</p>
<p>For example, if your office is 1 room out of 5 equal-sized rooms, and you use it for work 40 hours out of a 168-hour week:</p>
<p style="background:#f5f5f5;padding:1rem;border-radius:8px;">1/5 &times; 40/168 = 4.8% of your total household bills</p>
<p>The costs you can apply this percentage to include:</p>
<ul>
    <li>Electricity</li>
    <li>Gas/heating</li>
    <li>Council tax</li>
    <li>Mortgage interest (not the capital repayment)</li>
    <li>Rent</li>
    <li>Home insurance</li>
    <li>Repairs to shared areas (proportional)</li>
</ul>
<p><strong>Important:</strong> You can claim the flat rate for utilities AND still claim phone/broadband separately. The flat rate only covers gas, electric, and similar utilities.</p>"""
            },
            {
                "heading": "Capital Gains Tax Warning",
                "text": """<p>One thing to be careful about: if you claim that a room in your home is used <strong>exclusively</strong> for business, it could affect your Capital Gains Tax (CGT) Principal Private Residence relief when you sell your home.</p>
<p>To avoid this, make sure your office is also used for personal purposes (even occasionally). Don't claim a room is 100% business. A room that's 80% business and 20% personal is perfectly fine and won't trigger CGT issues.</p>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Working from Home for a Freelance Writer",
            "lines": [
                ("Electricity (business proportion 15%)", 180),
                ("Gas/heating (business proportion 15%)", 150),
                ("Council tax (business proportion 10%)", 200),
                ("Rent or mortgage interest (10%)", 960),
                ("Home insurance (10%)", 40),
                ("Broadband (50% business)", 180),
            ],
            "total_label": "Total claimable WFH expenses",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax. Compare this to the flat rate of just &pound;312/year."
        }
    },
    {
        "id": "professional-services",
        "name": "Professional Fees & Insurance",
        "hmrc_category": "Legal and financial costs",
        "icon": "fa-scale-balanced",
        "meta_title": "Professional Fees & Insurance Expenses Self-Employed UK | QuidWise",
        "meta_description": "Claiming accountant fees, legal costs, professional insurance, and memberships as self-employed. HMRC allowable expenses guide for 2025/26.",
        "keywords": "accountant fees tax deductible UK, professional indemnity insurance self employed, professional memberships HMRC, legal fees self employed, bank charges business expense",
        "intro": "Professional fees cover a range of business costs from your accountant's bill to professional insurance. These are some of the most straightforward expenses to claim — if you need them for your business, they're almost always allowable.",
        "content_sections": [
            {
                "heading": "What Professional Fees Can You Claim?",
                "text": """<ul>
    <li><strong>Accountant fees:</strong> The cost of having your accounts prepared and your Self Assessment filed is always allowable.</li>
    <li><strong>Legal fees:</strong> Business contract reviews, debt collection, trademark registration, and other business-related legal work.</li>
    <li><strong>Professional indemnity insurance:</strong> Essential for consultants, designers, developers, and many other professions.</li>
    <li><strong>Public liability insurance:</strong> Required if you work on client premises or interact with the public.</li>
    <li><strong>Professional body memberships:</strong> ACCA, RICS, ICE, CIPD, etc. — provided they're relevant to your trade and on HMRC's approved list.</li>
    <li><strong>Business bank account fees:</strong> Monthly fees, transaction charges, and card fees.</li>
    <li><strong>Business credit card charges:</strong> Interest and fees on business transactions.</li>
    <li><strong>Debt recovery costs:</strong> Solicitor or agency fees for chasing unpaid invoices.</li>
</ul>"""
            },
            {
                "heading": "What You CANNOT Claim",
                "text": """<ul>
    <li><strong>Personal legal fees:</strong> Divorce, personal injury claims, or non-business disputes.</li>
    <li><strong>HMRC fines and penalties:</strong> Late filing penalties, tax surcharges — these are never allowable.</li>
    <li><strong>Personal bank charges:</strong> Overdraft fees on personal accounts, even if you use the account for some business transactions.</li>
    <li><strong>Life insurance:</strong> This is a personal expense regardless of your business structure.</li>
    <li><strong>Speeding fines or parking penalties:</strong> Even if incurred during a business trip.</li>
</ul>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Professional Fees for a Freelance IT Consultant",
            "lines": [
                ("Accountant fees (annual)", 600),
                ("Professional indemnity insurance", 350),
                ("ICE membership", 180),
                ("Business bank account fees", 72),
                ("Legal review of contract", 300),
            ],
            "total_label": "Total claimable professional fees",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax."
        }
    },
    {
        "id": "marketing",
        "name": "Advertising & Marketing",
        "hmrc_category": "Advertising costs",
        "icon": "fa-bullhorn",
        "meta_title": "Advertising & Marketing Expenses Self-Employed UK | QuidWise",
        "meta_description": "Can you claim marketing costs as self-employed? Guide to advertising, website costs, business cards, networking events. HMRC allowable expenses 2025/26.",
        "keywords": "self employed advertising expenses, marketing costs tax deductible UK, website costs self employed, business cards expense, client entertaining HMRC",
        "intro": "Every pound you spend promoting your freelance business can be claimed as an allowable expense. But there's one major trap that catches people out every year: client entertaining. Here's the complete picture.",
        "content_sections": [
            {
                "heading": "Claimable Marketing Expenses",
                "text": """<ul>
    <li><strong>Online advertising:</strong> Google Ads, Facebook/Instagram ads, LinkedIn promoted posts — all fully claimable.</li>
    <li><strong>Business cards and print materials:</strong> Design and printing costs for business cards, flyers, brochures.</li>
    <li><strong>Website costs:</strong> Design, development, hosting, domain, content creation, SEO tools — everything related to your business website.</li>
    <li><strong>Portfolio platforms:</strong> Behance Pro, Dribbble Pro, Squarespace, or any platform fee for showcasing your work.</li>
    <li><strong>Email marketing tools:</strong> Mailchimp, ConvertKit, or similar subscription costs.</li>
    <li><strong>Networking events:</strong> Ticket prices for business networking events, conferences, and trade shows.</li>
    <li><strong>Trade show costs:</strong> Stand rental, display materials, banner printing.</li>
    <li><strong>Social media management tools:</strong> Buffer, Hootsuite, or similar if used for business promotion.</li>
</ul>"""
            },
            {
                "heading": "The Client Entertaining Trap",
                "text": """<p><strong>This is the biggest misconception in self-employed expenses.</strong> Taking a client to lunch, buying them a drink, or treating them to an event is <strong>NOT an allowable expense</strong> for sole traders.</p>
<p>HMRC's rules on this are very strict. It doesn't matter that it's clearly for business purposes — the tax rules specifically exclude client entertaining.</p>
<p>However, there are some narrow exceptions:</p>
<ul>
    <li><strong>Staff entertaining:</strong> If you have employees (not subcontractors), you can spend up to &pound;150 per head per year on staff events like a Christmas party.</li>
    <li><strong>Small branded gifts:</strong> Items under &pound;50 per person per year that carry a conspicuous advert for your business (e.g. branded mugs, pens) may be allowable.</li>
</ul>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Marketing Costs for a Freelance Photographer",
            "lines": [
                ("Instagram/Facebook ads", 600),
                ("Website hosting and domain", 150),
                ("Squarespace portfolio", 144),
                ("Business cards (2 batches)", 60),
                ("Networking event tickets", 200),
                ("Mailchimp subscription", 156),
            ],
            "total_label": "Total claimable marketing expenses",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax."
        }
    },
    {
        "id": "clothing",
        "name": "Clothing & Uniform",
        "hmrc_category": "Clothing costs",
        "icon": "fa-shirt",
        "meta_title": "Can I Claim Clothing as Self-Employed UK? | HMRC Guide | QuidWise",
        "meta_description": "Can you claim clothing as a business expense when self-employed? Uniforms, protective clothing, branded workwear. HMRC rules explained for 2025/26.",
        "keywords": "self employed clothing expenses, can I claim work clothes self employed, uniform expenses HMRC, protective clothing tax deductible, branded workwear",
        "intro": "Clothing is one of the most misunderstood expense categories. Many freelancers assume they can claim smart clothes for meetings or everyday work outfits. Unfortunately, HMRC takes a very strict line. Here's exactly what qualifies.",
        "content_sections": [
            {
                "heading": "The HMRC Test for Clothing",
                "text": """<p>HMRC applies a simple but strict test: <strong>could you wear it as everyday clothing?</strong> If the answer is yes, it's not claimable — regardless of whether you actually do.</p>
<p>This means a suit bought specifically for client meetings is NOT claimable because you could wear it on the street. But a branded polo shirt with your company logo IS claimable because it's work-specific.</p>"""
            },
            {
                "heading": "What You CAN Claim",
                "text": """<ul>
    <li><strong>Protective clothing:</strong> Hi-vis jackets, steel-toe boots, hard hats, safety goggles, gloves — anything required for health and safety.</li>
    <li><strong>Uniforms with your logo:</strong> T-shirts, polo shirts, or jackets embroidered or printed with your business branding.</li>
    <li><strong>Costumes:</strong> If you're a performer, entertainer, or actor — stage outfits, period costumes, clown suits.</li>
    <li><strong>Specialist clothing:</strong> Chef whites, nurse scrubs, overalls — items that are clearly for a specific profession.</li>
    <li><strong>Laundry of work clothing:</strong> Washing, dry cleaning, or repair of the above items.</li>
</ul>"""
            },
            {
                "heading": "What You CANNOT Claim",
                "text": """<ul>
    <li><strong>Smart clothes for meetings:</strong> Suits, dresses, shirts, shoes — even if bought specifically for work.</li>
    <li><strong>Everyday workwear:</strong> Jeans, trainers, casual shirts — even if you only wear them when working.</li>
    <li><strong>Glasses:</strong> Even if you need them for screen work, these are personal medical items.</li>
    <li><strong>Warm clothing:</strong> A coat for site visits is personal clothing unless it's specialist protective gear.</li>
</ul>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Clothing Costs for a Self-Employed Tradesperson",
            "lines": [
                ("Steel-toe boots (2 pairs)", 120),
                ("Hi-vis jackets and vests", 45),
                ("Branded polo shirts (10x)", 180),
                ("Protective gloves (bulk)", 30),
                ("Laundry of work clothing", 60),
            ],
            "total_label": "Total claimable clothing expenses",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax."
        }
    },
    {
        "id": "training",
        "name": "Training & Development",
        "hmrc_category": "Other allowable expenses",
        "icon": "fa-graduation-cap",
        "meta_title": "Self-Employed Training Expenses UK | What Can You Claim? | QuidWise",
        "meta_description": "Can you claim training and courses as self-employed in the UK? Online learning, conferences, books. HMRC rules on updating vs new skills for 2025/26.",
        "keywords": "self employed training expenses, courses tax deductible self employed, conference expenses HMRC, professional development expenses UK, can I claim Udemy self employed",
        "intro": "Investing in your skills is essential as a freelancer — and most of the time, it's tax-deductible too. But HMRC draws a crucial line between updating existing skills (claimable) and learning entirely new ones (not claimable).",
        "content_sections": [
            {
                "heading": "The Key Rule: Updating vs New Skills",
                "text": """<p>This is the most important distinction:</p>
<ul>
    <li><strong>Updating or maintaining existing skills = CLAIMABLE.</strong> A web developer learning React (a new framework in their existing field) can claim the course cost.</li>
    <li><strong>Acquiring new skills for a different trade = NOT CLAIMABLE.</strong> A web developer training to become a plumber cannot claim the plumbing course.</li>
</ul>
<p>The logic is that training which keeps you effective in your current trade is a business expense, while training for a completely new career is a personal investment.</p>"""
            },
            {
                "heading": "What Training Costs Can You Claim?",
                "text": """<ul>
    <li><strong>Courses to update skills:</strong> Online courses on platforms like Udemy, Coursera, LinkedIn Learning, Skillshare — provided they're relevant to your current work.</li>
    <li><strong>Industry conferences:</strong> Ticket price, travel to/from the conference, accommodation if overnight.</li>
    <li><strong>Professional books and journals:</strong> Technical manuals, industry publications, trade magazines.</li>
    <li><strong>Workshops and seminars:</strong> Both online and in-person, relating to your field.</li>
    <li><strong>Professional certification renewal:</strong> Maintaining certifications needed for your trade.</li>
</ul>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Training Costs for a Freelance Developer",
            "lines": [
                ("Online courses (Udemy, Pluralsight)", 200),
                ("Industry conference ticket", 300),
                ("Conference travel and hotel", 350),
                ("Technical books", 80),
                ("Professional certification renewal", 150),
            ],
            "total_label": "Total claimable training expenses",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax."
        }
    },
    {
        "id": "staff",
        "name": "Staff & Subcontractor Costs",
        "hmrc_category": "Wages, salaries and other staff costs",
        "icon": "fa-users",
        "meta_title": "Staff & Subcontractor Expenses Self-Employed UK | QuidWise",
        "meta_description": "Claiming staff wages, subcontractor payments, and virtual assistant costs as self-employed. HMRC rules on paying family, CIS, and employer NI for 2025/26.",
        "keywords": "self employed subcontractor expenses, can I pay my spouse self employed, virtual assistant business expense, CIS self employed, staff costs sole trader",
        "intro": "If you hire help for your business — whether it's a subcontractor for a project, a virtual assistant, or a part-time employee — these costs are fully allowable. But there are important rules around paying family members and the Construction Industry Scheme.",
        "content_sections": [
            {
                "heading": "What Staff Costs Can You Claim?",
                "text": """<ul>
    <li><strong>Subcontractor payments:</strong> Paying other freelancers or agencies to help deliver client work.</li>
    <li><strong>Virtual assistant costs:</strong> Whether a regular VA or occasional admin support.</li>
    <li><strong>Employee salaries:</strong> If you employ staff, their gross salary plus employer National Insurance (13.8%) and pension contributions.</li>
    <li><strong>Employer pension contributions:</strong> Workplace pension contributions you make as an employer.</li>
    <li><strong>Agency/recruitment fees:</strong> Costs of hiring through an agency.</li>
    <li><strong>Training for staff:</strong> Courses and development for your employees.</li>
</ul>"""
            },
            {
                "heading": "Paying Family Members",
                "text": """<p>Yes, you can pay your spouse, partner, or family member — but it must meet two conditions:</p>
<ol>
    <li><strong>They must genuinely do the work.</strong> Keep records of what they do, when they do it, and the output.</li>
    <li><strong>The pay must be at a reasonable market rate.</strong> You can't pay your partner &pound;50,000 for 5 hours of admin a week.</li>
</ol>
<p>This can be a useful tax planning tool because it shifts income from a higher-rate taxpayer to a basic-rate or non-taxpayer, but it must be genuine or HMRC will disallow it.</p>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Staff Costs for a Freelance Agency Owner",
            "lines": [
                ("Subcontractor (project-based)", 6000),
                ("Virtual assistant (monthly)", 2400),
                ("Occasional design help", 800),
            ],
            "total_label": "Total claimable staff costs",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax, plus NI savings."
        }
    },
    {
        "id": "stock-materials",
        "name": "Stock & Materials",
        "hmrc_category": "Cost of goods bought for resale or goods used",
        "icon": "fa-box-open",
        "meta_title": "Stock & Materials Expenses Self-Employed UK | QuidWise",
        "meta_description": "Claiming raw materials, stock for resale, and project costs as self-employed in the UK. HMRC rules on cost of goods for 2025/26.",
        "keywords": "self employed stock expenses, materials cost tax deductible, cost of goods sole trader, raw materials business expense UK",
        "intro": "If you buy materials to create products, purchase stock for resale, or incur direct costs delivering your service, these are claimable as 'cost of goods.' This is especially important for makers, craftspeople, retailers, and anyone who sells physical products.",
        "content_sections": [
            {
                "heading": "What Counts as Stock & Materials?",
                "text": """<ul>
    <li><strong>Raw materials:</strong> Wood, fabric, metal, ingredients, paint, chemicals — whatever you use to make your products.</li>
    <li><strong>Stock for resale:</strong> Products you purchase from wholesalers or manufacturers to sell to customers.</li>
    <li><strong>Direct project costs:</strong> Stock photography, fonts, design assets, printing for client projects — anything bought specifically for a job.</li>
    <li><strong>Packaging materials:</strong> Boxes, tissue paper, branded packaging for your products.</li>
    <li><strong>Samples:</strong> Product samples sent to potential clients or for testing.</li>
</ul>"""
            },
            {
                "heading": "Stock Valuation and Accounting",
                "text": """<p>If you use <strong>cash basis accounting</strong> (the default for most small businesses), you claim the cost of stock when you pay for it, regardless of when you sell it. This is simpler and means no year-end stocktake.</p>
<p>If you use <strong>accruals accounting</strong>, you need to do a stocktake at the end of your financial year. Only the cost of stock that was actually sold during the year is claimed as an expense; unsold stock is carried forward.</p>
<p><strong>Important:</strong> If you take stock for personal use, you must account for it at market value as income. You can't take products from your business for free without tax consequences.</p>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Stock & Materials for a Handmade Jewellery Business",
            "lines": [
                ("Silver and gemstones", 2400),
                ("Packaging and gift boxes", 300),
                ("Stock photography for website", 80),
                ("Tools and small equipment", 200),
            ],
            "total_label": "Total claimable stock & materials",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax."
        }
    },
    {
        "id": "financial",
        "name": "Interest & Bank Charges",
        "hmrc_category": "Interest on bank and other business loans",
        "icon": "fa-landmark",
        "meta_title": "Business Interest & Bank Charges Self-Employed UK | QuidWise",
        "meta_description": "Claiming business loan interest, bank charges, and overdraft fees as self-employed. What's allowable and what's not. HMRC guide 2025/26.",
        "keywords": "business loan interest tax deductible UK, bank charges self employed, overdraft fees business expense, credit card interest self employed",
        "intro": "If you've borrowed money for your business or incur fees on your business accounts, the interest and charges are generally allowable expenses. Here's what counts — and the crucial distinction between interest and capital repayments.",
        "content_sections": [
            {
                "heading": "What Financial Costs Can You Claim?",
                "text": """<ul>
    <li><strong>Business loan interest:</strong> The interest portion (not the capital repayment) of any business loan.</li>
    <li><strong>Business bank account fees:</strong> Monthly charges, transaction fees, card machine costs.</li>
    <li><strong>Business credit card interest:</strong> On purchases made for business purposes.</li>
    <li><strong>Hire purchase interest:</strong> On business equipment or vehicles acquired through HP.</li>
    <li><strong>Overdraft charges:</strong> Interest and fees on a business overdraft.</li>
    <li><strong>Payment processing fees:</strong> Stripe, PayPal, Square — the fees they charge on transactions.</li>
</ul>"""
            },
            {
                "heading": "The Key Rule: Interest vs Capital",
                "text": """<p>This is the most important distinction in this category. When you repay a business loan, only the <strong>interest</strong> is an allowable expense. The <strong>capital repayment</strong> (the amount you actually borrowed) is not.</p>
<p>For example, if your monthly loan payment is &pound;500 and &pound;100 of that is interest and &pound;400 is capital repayment, only the &pound;100 interest is claimable.</p>
<p>Your loan provider will be able to tell you the interest/capital split, and it's usually shown on your annual statement.</p>"""
            }
        ],
        "calculation_example": {
            "title": "Example: Financial Costs for a Self-Employed Tradesperson",
            "lines": [
                ("Business loan interest (annual)", 480),
                ("Business bank account fees", 96),
                ("Payment processing fees (Stripe)", 360),
                ("Overdraft charges", 45),
            ],
            "total_label": "Total claimable financial costs",
            "tax_note": "At the 20% basic rate, this saves {saving} in income tax."
        }
    }
]


def generate_category_page(cat):
    """Generate a deep-dive HTML page for a single expense category."""
    
    # Build content sections HTML
    sections_html = ""
    for section in cat["content_sections"]:
        sections_html += f"""
                <div class="content-block">
                    <h2>{section['heading']}</h2>
                    {section['text']}
                </div>
"""

    # Build calculation example
    calc = cat["calculation_example"]
    total = sum(line[1] for line in calc["lines"])
    saving = round(total * 0.20)
    tax_note = calc["tax_note"].replace("{saving}", f"&pound;{saving:,}")
    
    calc_rows = ""
    for label, amount in calc["lines"]:
        calc_rows += f'<tr><td style="padding:0.5rem 1rem;border-bottom:1px solid #eee;">{label}</td><td style="text-align:right;padding:0.5rem 1rem;border-bottom:1px solid #eee;">&pound;{amount:,}</td></tr>\n'

    calc_html = f"""
                <div class="calculation-example">
                    <h2><i class="fas fa-calculator"></i> {calc['title']}</h2>
                    <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
                        <tr style="background:#f0faf4;"><th style="text-align:left;padding:0.5rem 1rem;border-bottom:2px solid #ddd;">Expense</th><th style="text-align:right;padding:0.5rem 1rem;border-bottom:2px solid #ddd;">Amount</th></tr>
                        {calc_rows}
                        <tr style="background:#1B4332;color:white;font-weight:700;"><td style="padding:0.75rem 1rem;">{calc['total_label']}</td><td style="text-align:right;padding:0.75rem 1rem;">&pound;{total:,}</td></tr>
                    </table>
                    <p style="font-size:0.9rem;color:#666;margin-top:0.5rem;">{tax_note}</p>
                </div>
"""

    # Build related categories links
    related = [c for c in CATEGORIES if c["id"] != cat["id"]][:4]
    related_html = ""
    for r in related:
        related_html += f'<a href="{r["id"]}.html" class="related-link"><i class="fas {r["icon"]}"></i> {r["name"]}</a>\n'

    html = f"""<!DOCTYPE html>
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
    <meta name="description" content="{cat['meta_description']}">
    <meta name="keywords" content="{cat['keywords']}">
    <meta name="author" content="QuidWise">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.quidwise.co.uk/expenses/{cat['id']}.html">

    <meta property="og:type" content="article">
    <meta property="og:url" content="https://www.quidwise.co.uk/expenses/{cat['id']}.html">
    <meta property="og:title" content="{cat['meta_title']}">
    <meta property="og:description" content="{cat['meta_description']}">
    <meta property="og:image" content="https://www.quidwise.co.uk/logo.svg">
    <meta property="og:site_name" content="QuidWise">
    <meta property="og:locale" content="en_GB">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{cat['meta_title']}">
    <meta name="twitter:description" content="{cat['meta_description']}">

    <title>{cat['meta_title']}</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.quidwise.co.uk/"
      }},{{
        "@type": "ListItem",
        "position": 2,
        "name": "Allowable Expenses Guide",
        "item": "https://www.quidwise.co.uk/expenses.html"
      }},{{
        "@type": "ListItem",
        "position": 3,
        "name": "{cat['name']}",
        "item": "https://www.quidwise.co.uk/expenses/{cat['id']}.html"
      }}]
    }}
    </script>

    <style>
        .expense-page-hero {{
            background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
            color: white;
            padding: 2.5rem 2rem;
            border-radius: 0 0 16px 16px;
            margin-bottom: 2rem;
        }}
        .expense-page-hero .breadcrumb {{
            font-size: 0.85rem;
            opacity: 0.8;
            margin-bottom: 0.75rem;
        }}
        .expense-page-hero .breadcrumb a {{
            color: white;
            text-decoration: none;
        }}
        .expense-page-hero .breadcrumb a:hover {{
            text-decoration: underline;
        }}
        .expense-page-hero h1 {{
            font-size: 1.9rem;
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }}
        .expense-page-hero .hmrc-ref {{
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.82rem;
            margin-top: 0.5rem;
        }}
        .expense-page-content {{
            padding: 0 2rem 2rem;
        }}
        .expense-page-content .intro {{
            font-size: 1.1rem;
            color: #444;
            line-height: 1.7;
            margin-bottom: 2rem;
            border-left: 4px solid #95D5B2;
            padding-left: 1.25rem;
        }}
        .content-block {{
            margin-bottom: 2rem;
        }}
        .content-block h2 {{
            font-size: 1.35rem;
            color: #1B4332;
            margin-bottom: 0.75rem;
        }}
        .content-block p {{
            color: #444;
            line-height: 1.7;
            margin-bottom: 0.75rem;
        }}
        .content-block ul, .content-block ol {{
            color: #444;
            line-height: 1.7;
            padding-left: 1.5rem;
            margin-bottom: 0.75rem;
        }}
        .content-block li {{
            margin-bottom: 0.5rem;
        }}
        .content-block h4 {{
            color: #333;
            margin: 1rem 0 0.5rem;
        }}
        .calculation-example {{
            background: #FAFAF8;
            border: 2px solid #95D5B2;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
        }}
        .calculation-example h2 {{
            font-size: 1.2rem;
            color: #1B4332;
            margin-bottom: 0.5rem;
        }}
        .related-categories {{
            margin: 2rem 0;
        }}
        .related-categories h3 {{
            font-size: 1.15rem;
            color: #333;
            margin-bottom: 0.75rem;
        }}
        .related-links {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }}
        .related-link {{
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            font-weight: 500;
            font-size: 0.93rem;
            border-left: 4px solid var(--primary-color);
            transition: all 0.2s;
        }}
        .related-link:hover {{
            background: var(--primary-light);
            color: white;
            transform: translateX(4px);
        }}
        .related-link i {{
            color: var(--primary-color);
        }}
        .related-link:hover i {{
            color: white;
        }}
        .back-to-guide {{
            display: inline-block;
            margin: 1.5rem 0;
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
        }}
        .back-to-guide:hover {{
            text-decoration: underline;
        }}
        @media (max-width: 768px) {{
            .expense-page-hero {{
                padding: 1.5rem 1rem;
            }}
            .expense-page-hero h1 {{
                font-size: 1.5rem;
            }}
            .expense-page-content {{
                padding: 0 1rem 1.5rem;
            }}
            .related-links {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
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
            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
            <ul class="nav-menu">
                <li class="nav-item dropdown">
                    <a href="#" class="nav-link">Tax & Budgeting <i class="fas fa-chevron-down"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="../income-tax-calculator.html">Income Tax Calculator</a></li>
                        <li><a href="../budget-planner.html">Budget Planner</a></li>
                        <li><a href="../expenses.html">Allowable Expenses Guide</a></li>
                    </ul>
                </li>
                <li class="nav-item dropdown">
                    <a href="#" class="nav-link">Mortgages & Property <i class="fas fa-chevron-down"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="../mortgage-calculator.html">Mortgage Calculator</a></li>
                        <li><a href="../mortgage-affordability.html">Mortgage Affordability</a></li>
                        <li><a href="../stamp-duty-calculator.html">Stamp Duty Calculator</a></li>
                        <li><a href="../find-mortgage-deals.html">Mortgage Rate Comparison</a></li>
                        <li><a href="../mortgage-overpayment.html">Mortgage Overpayment Calculator</a></li>
                        <li><a href="../buy-or-rent.html">Buy vs Rent Estimate</a></li>
                    </ul>
                </li>
                <li class="nav-item"><a href="../blogs.html" class="nav-link">Blog</a></li>
            </ul>
        </div>
    </nav>

    <div class="container" style="max-width: 900px;">
        <div class="expense-page-hero">
            <div class="breadcrumb">
                <a href="../index.html">Home</a> &rsaquo; <a href="../expenses.html">Expenses Guide</a> &rsaquo; {cat['name']}
            </div>
            <h1><i class="fas {cat['icon']}"></i> {cat['name']}</h1>
            <span class="hmrc-ref">SA103: {cat['hmrc_category']} &bull; 2025/26 tax year</span>
        </div>

        <div class="expense-page-content">
            <p class="intro">{cat['intro']}</p>

{sections_html}

{calc_html}

            <div class="related-categories">
                <h3>Explore Other Expense Categories</h3>
                <div class="related-links">
                    {related_html}
                </div>
            </div>

            <a href="../expenses.html" class="back-to-guide"><i class="fas fa-arrow-left"></i> Back to full Allowable Expenses Guide</a>
        </div>

        <footer>
            <div class="footer-content">
                <p class="disclaimer">
                    <i class="fas fa-info-circle"></i>
                    <strong>Disclaimer:</strong> This guide is based on HMRC rules for the 2025/26 tax year. Tax rules can change. Always check GOV.UK or consult a qualified accountant for advice specific to your situation.
                </p>
                <div class="footer-badges">
                    <span class="badge"><i class="fas fa-shield-alt"></i> Privacy-First</span>
                    <span class="badge"><i class="fas fa-lock"></i> Secure</span>
                    <span class="badge"><i class="fas fa-map-marker-alt"></i> Made for UK</span>
                </div>
                <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">
                    &copy; 2025 QuidWise. All rights reserved..
                </p>
            </div>
        </footer>
    </div>

    <script src="../navigation.js"></script>
</body>
</html>"""

    return html


def main():
    output_dir = "expenses"
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating {len(CATEGORIES)} expense category pages...")

    for cat in CATEGORIES:
        content = generate_category_page(cat)
        filepath = os.path.join(output_dir, f"{cat['id']}.html")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Generated: {cat['id']}.html - {cat['name']}")

    print(f"\nDone! {len(CATEGORIES)} pages saved in {output_dir}/")


if __name__ == "__main__":
    main()

