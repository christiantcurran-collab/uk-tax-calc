# Income Tax Calculator

A comprehensive, beautiful UK Income Tax Calculator for calculating take-home pay after tax, National Insurance, pension contributions, and student loan repayments.

🔗 **Live Demo**: [Your Render URL here]

## Features

- 💷 Calculate net pay from annual or monthly salary
- 📅 Tax year selection (2024/25 and 2025/26)
- 👤 Age-based calculations (National Insurance exemptions for 66+)
- 📊 Accurate UK HMRC tax calculations
- 🏦 National Insurance contributions
- 💰 Salary sacrifice pension calculations
- 🎓 Student loan repayments (all UK plans)
- 📱 Fully responsive design
- 🎨 Modern blue & white UI

## Tax Year 2024/25 & 2025/26 Features

### Income Tax
- Personal Allowance: £12,570 (tapers for £100k+ earners)
- Basic Rate (20%): £12,571 - £50,270
- Higher Rate (40%): £50,271 - £125,140
- Additional Rate (45%): Over £125,140

### National Insurance
- Under 66: 8% (£12,570-£50,270), 2% (£50,270+)
- 66+: No National Insurance

### Student Loan Plans
- Plan 1, 2, 4, 5, and Postgraduate Loan
- Accurate thresholds and repayment rates

### Pension
- Salary sacrifice calculations
- Annual allowance: £60,000

## Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/income-tax-calculator.git

# Navigate to the project
cd income-tax-calculator

# Open in browser (no build step required!)
# Option 1: Open index.html directly
open index.html

# Option 2: Use Python's built-in server
python -m http.server 8000
# Then visit http://localhost:8000
```

## Deploy to Render

### Method 1: Deploy with Render Static Site

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/income-tax-calculator.git
git push -u origin main
```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: income-tax-calculator
     - **Branch**: main
     - **Build Command**: (leave empty)
     - **Publish Directory**: `.` (current directory)
   - Click "Create Static Site"

3. **Your site will be live at**: `https://income-tax-calculator.onrender.com`

### Method 2: Custom Domain (Optional)

1. In Render Dashboard → Settings → Custom Domain
2. Add your domain and follow DNS instructions

## Monetization Setup (Google AdSense)

### Step 1: Apply for Google AdSense

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Submit your website URL
4. Wait for approval (usually 1-2 weeks)

### Step 2: Get Your Publisher ID

Once approved:
1. Copy your Publisher ID (looks like: `ca-pub-1234567890123456`)
2. Update in `index.html`:
   - Replace all instances of `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID

### Step 3: Create Ad Units

1. In AdSense dashboard, go to "Ads" → "By ad unit"
2. Create 3 ad units:
   - **Top Banner**: Responsive (728x90 or auto)
   - **Sidebar**: Rectangle (300x250)
   - **Bottom Banner**: Responsive (728x90 or auto)
3. Copy each ad slot ID
4. Replace `XXXXXXXXXX` in `index.html` with your actual slot IDs

### Step 4: Verify Ads

- After deployment, ads may take 24-48 hours to appear
- AdSense will crawl your site to verify content
- Once approved, ads will start showing automatically

## Expected Revenue

Based on typical calculator sites:
- **Traffic**: 1,000-10,000 visitors/month initially
- **RPM** (Revenue per 1000 views): £5-£20
- **Monthly earnings**: £5-£200 (scales with traffic)

### Tips to Increase Revenue

1. **SEO Optimization**:
   - Add meta descriptions (already included)
   - Submit sitemap to Google Search Console
   - Create content around UK tax queries

2. **Traffic Growth**:
   - Share on social media
   - Post on UK finance forums
   - Write blog posts about UK tax
   - Target keywords: "UK tax calculator", "take home pay calculator"

3. **User Engagement**:
   - Add more features (overtime, bonuses, etc.)
   - Create comparison tools
   - Add tax-saving tips

## Project Structure

```
income-tax-calculator/
├── index.html          # Main HTML with AdSense integration
├── styles.css          # Styling (blue & white theme)
├── script.js           # Tax calculations
├── README.md           # Documentation
└── .gitignore         # Git ignore file
```

## Tech Stack

- **Frontend**: Pure HTML, CSS, JavaScript
- **Icons**: Font Awesome 6
- **Hosting**: Render (Static Site)
- **Monetization**: Google AdSense
- **Version Control**: GitHub

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own projects

## Disclaimer

This calculator is for estimation purposes only. Actual tax deductions may vary based on individual circumstances. Always consult HMRC or a qualified accountant for accurate tax advice.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

**Made with ❤️ for UK taxpayers** | **Tax Years 2024/25 & 2025/26**
