// Find Mortgage Deals JavaScript - MSE Style

// Mortgage deals data (November 2025 rates)
const MORTGAGE_DEALS = [
    // 2 Year Fixed
    { lender: "Nationwide", rate: 3.64, term: 2, type: "Fixed", ltv: 60, fee: 999, aprc: 4.7, features: "Free valuation, £250 cashback" },
    { lender: "Santander", rate: 3.81, term: 2, type: "Fixed", ltv: 75, fee: 999, aprc: 4.8, features: "Free valuation" },
    { lender: "HSBC", rate: 3.89, term: 2, type: "Fixed", ltv: 60, fee: 999, aprc: 4.9, features: "Free valuation, £500 cashback" },
    { lender: "Barclays", rate: 3.94, term: 2, type: "Fixed", ltv: 75, fee: 999, aprc: 5.0, features: "Free valuation" },
    { lender: "NatWest", rate: 4.14, term: 2, type: "Fixed", ltv: 75, fee: 995, aprc: 5.1, features: "Free valuation" },
    { lender: "Halifax", rate: 4.29, term: 2, type: "Fixed", ltv: 80, fee: 999, aprc: 5.2, features: "Free valuation" },
    { lender: "TSB", rate: 4.49, term: 2, type: "Fixed", ltv: 85, fee: 995, aprc: 5.4, features: "Free valuation" },
    { lender: "Lloyds", rate: 4.69, term: 2, type: "Fixed", ltv: 90, fee: 999, aprc: 5.6, features: "Free valuation" },
    
    // 5 Year Fixed
    { lender: "HSBC", rate: 4.09, term: 5, type: "Fixed", ltv: 60, fee: 999, aprc: 5.0, features: "Free valuation, £500 cashback" },
    { lender: "Santander", rate: 4.14, term: 5, type: "Fixed", ltv: 60, fee: 999, aprc: 5.1, features: "Free valuation, £250 cashback" },
    { lender: "Barclays", rate: 4.19, term: 5, type: "Fixed", ltv: 60, fee: 999, aprc: 5.1, features: "Free valuation" },
    { lender: "Nationwide", rate: 4.24, term: 5, type: "Fixed", ltv: 75, fee: 999, aprc: 5.2, features: "Free legal fees for remortgage" },
    { lender: "NatWest", rate: 4.34, term: 5, type: "Fixed", ltv: 75, fee: 995, aprc: 5.3, features: "Free valuation" },
    { lender: "Halifax", rate: 4.49, term: 5, type: "Fixed", ltv: 80, fee: 999, aprc: 5.4, features: "Free valuation" },
    { lender: "TSB", rate: 4.69, term: 5, type: "Fixed", ltv: 85, fee: 995, aprc: 5.6, features: "Free valuation" },
    { lender: "Lloyds", rate: 4.89, term: 5, type: "Fixed", ltv: 90, fee: 999, aprc: 5.8, features: "Free valuation" },
    { lender: "Nationwide", rate: 5.19, term: 5, type: "Fixed", ltv: 95, fee: 999, aprc: 6.1, features: "First-time buyer, free valuation" },
];

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mortgageSearchForm');
    const propertyValueInput = document.getElementById('propertyValue');
    const depositInput = document.getElementById('depositAmount');
    const mortgageAmountInput = document.getElementById('mortgageAmount');
    const ltvDisplay = document.getElementById('ltvDisplay');
    const termInput = document.getElementById('term');
    const repaymentMethodInput = document.getElementById('repaymentMethod');

    // Auto-calculate mortgage amount and LTV
    function updateMortgageCalculations() {
        const propertyValue = parseFloat(propertyValueInput.value) || 0;
        const deposit = parseFloat(depositInput.value) || 0;
        const mortgageAmount = propertyValue - deposit;
        
        mortgageAmountInput.value = mortgageAmount;
        
        if (propertyValue > 0) {
            const ltv = ((mortgageAmount / propertyValue) * 100).toFixed(0);
            ltvDisplay.textContent = ltv + '%';
        }
    }

    propertyValueInput.addEventListener('input', updateMortgageCalculations);
    depositInput.addEventListener('input', updateMortgageCalculations);

    // Calculate monthly payment
    function calculateMonthlyPayment(loanAmount, annualRate, termYears, isInterestOnly = false) {
        if (isInterestOnly) {
            // Interest only: just pay the interest each month
            return (loanAmount * (annualRate / 100)) / 12;
        }
        
        // Repayment mortgage
        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = termYears * 12;
        
        if (monthlyRate === 0) {
            return loanAmount / numberOfPayments;
        }
        
        return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    // Filter deals based on user's LTV
    function getEligibleDeals(userLTV) {
        return MORTGAGE_DEALS.filter(deal => deal.ltv >= userLTV);
    }

    // Display deals
    function displayDeals(deals, mortgageAmount, mortgageTerm, isInterestOnly) {
        const container = document.getElementById('dealsContainer');
        
        if (deals.length === 0) {
            container.innerHTML = `
                <div class="info-box" style="background: #fff3cd; border-color: #ffc107;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>No deals found</strong> for your criteria. Try increasing your deposit to lower your LTV ratio.</p>
                </div>
            `;
            return;
        }

        // Calculate monthly payments for each deal and sort
        const dealsWithPayments = deals.map(deal => {
            const monthlyPayment = calculateMonthlyPayment(mortgageAmount, deal.rate, mortgageTerm, isInterestOnly);
            return { ...deal, monthlyPayment };
        });

        // Sort by monthly payment (lowest first)
        dealsWithPayments.sort((a, b) => a.monthlyPayment - b.monthlyPayment);

        // Generate HTML for each deal
        container.innerHTML = dealsWithPayments.map(deal => `
            <div class="deal-card">
                <div class="deal-header">
                    <div class="deal-lender">
                        <i class="fas fa-university"></i>
                        ${deal.lender}
                    </div>
                    <div class="deal-rate">${deal.rate}%</div>
                </div>
                
                <div class="deal-details">
                    <div class="detail-row">
                        <label>Type</label>
                        <div class="value">${deal.term} Year ${deal.type}</div>
                    </div>
                    <div class="detail-row">
                        <label>Initial Rate</label>
                        <div class="value">${deal.rate}%</div>
                    </div>
                    <div class="detail-row">
                        <label>Monthly Payment</label>
                        <div class="value monthly-payment">£${deal.monthlyPayment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="detail-row">
                        <label>Product Fee</label>
                        <div class="value">£${deal.fee.toLocaleString('en-GB')}</div>
                    </div>
                    <div class="detail-row">
                        <label>Max LTV</label>
                        <div class="value">${deal.ltv}%</div>
                    </div>
                    <div class="detail-row">
                        <label>APRC</label>
                        <div class="value">${deal.aprc}%</div>
                    </div>
                </div>
                
                <div class="deal-footer">
                    <div class="deal-features">
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                        ${deal.features}
                    </div>
                    <button class="view-deal-btn" onclick="alert('This would link to the lender\\'s website or a broker service')">
                        <i class="fas fa-external-link-alt"></i> View Deal
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const propertyValue = parseFloat(propertyValueInput.value);
        const deposit = parseFloat(depositInput.value);
        const mortgageAmount = parseFloat(mortgageAmountInput.value);
        const mortgageTerm = parseInt(termInput.value);
        const isInterestOnly = repaymentMethodInput.value === 'interest-only';
        
        // Calculate user's LTV
        const userLTV = ((mortgageAmount / propertyValue) * 100);
        
        // Get eligible deals
        const eligibleDeals = getEligibleDeals(userLTV);
        
        // Display deals
        displayDeals(eligibleDeals, mortgageAmount, mortgageTerm, isInterestOnly);
        
        // Scroll to results
        document.querySelector('.results-main').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    });

    // Initialize with default values
    updateMortgageCalculations();
    form.dispatchEvent(new Event('submit'));
});
