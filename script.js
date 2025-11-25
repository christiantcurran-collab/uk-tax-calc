// UK Tax Configuration for 2024/25 and 2025/26
const TAX_CONFIG = {
    '2024/25': {
        personalAllowance: 12570,
        personalAllowanceLimit: 100000,
        taxBands: [
            { threshold: 12570, rate: 0.20, limit: 50270, name: 'Basic Rate' },
            { threshold: 50270, rate: 0.40, limit: 125140, name: 'Higher Rate' },
            { threshold: 125140, rate: 0.45, limit: Infinity, name: 'Additional Rate' }
        ],
        ni: {
            primaryThreshold: 12570,
            upperEarningsLimit: 50270,
            class1Rate: 0.08,      // 8% between thresholds
            class1UpperRate: 0.02  // 2% above upper limit
        },
        pensionAnnualAllowance: 60000
    },
    '2025/26': {
        personalAllowance: 12570,
        personalAllowanceLimit: 100000,
        taxBands: [
            { threshold: 12570, rate: 0.20, limit: 50270, name: 'Basic Rate' },
            { threshold: 50270, rate: 0.40, limit: 125140, name: 'Higher Rate' },
            { threshold: 125140, rate: 0.45, limit: Infinity, name: 'Additional Rate' }
        ],
        ni: {
            primaryThreshold: 12570,
            upperEarningsLimit: 50270,
            class1Rate: 0.08,      // 8% between thresholds
            class1UpperRate: 0.02  // 2% above upper limit
        },
        pensionAnnualAllowance: 60000
    }
};

// Scottish Tax Configuration for 2024/25 and 2025/26
const SCOTTISH_TAX_CONFIG = {
    '2024/25': {
        personalAllowance: 12570,
        personalAllowanceLimit: 100000,
        taxBands: [
            { threshold: 12570, rate: 0.19, limit: 14876, name: 'Starter Rate' },
            { threshold: 14876, rate: 0.20, limit: 26561, name: 'Basic Rate' },
            { threshold: 26561, rate: 0.21, limit: 43662, name: 'Intermediate Rate' },
            { threshold: 43662, rate: 0.42, limit: 75000, name: 'Higher Rate' },
            { threshold: 75000, rate: 0.45, limit: 125140, name: 'Advanced Rate' },
            { threshold: 125140, rate: 0.48, limit: Infinity, name: 'Top Rate' }
        ],
        ni: {
            primaryThreshold: 12570,
            upperEarningsLimit: 50270,
            class1Rate: 0.08,
            class1UpperRate: 0.02
        },
        pensionAnnualAllowance: 60000
    },
    '2025/26': {
        personalAllowance: 12570,
        personalAllowanceLimit: 100000,
        taxBands: [
            { threshold: 12570, rate: 0.19, limit: 15397, name: 'Starter Rate' },
            { threshold: 15397, rate: 0.20, limit: 27491, name: 'Basic Rate' },
            { threshold: 27491, rate: 0.21, limit: 43662, name: 'Intermediate Rate' },
            { threshold: 43662, rate: 0.42, limit: 75000, name: 'Higher Rate' },
            { threshold: 75000, rate: 0.45, limit: 125140, name: 'Advanced Rate' },
            { threshold: 125140, rate: 0.48, limit: Infinity, name: 'Top Rate' }
        ],
        ni: {
            primaryThreshold: 12570,
            upperEarningsLimit: 50270,
            class1Rate: 0.08,
            class1UpperRate: 0.02
        },
        pensionAnnualAllowance: 60000
    }
};

// Student Loan Configuration
const STUDENT_LOAN_CONFIG = {
    plan1: {
        threshold: 22015,
        rate: 0.09,
        name: 'Plan 1',
        description: 'Threshold: £22,015/year | Rate: 9%'
    },
    plan2: {
        threshold: 27295,
        rate: 0.09,
        name: 'Plan 2',
        description: 'Threshold: £27,295/year | Rate: 9%'
    },
    plan4: {
        threshold: 25000,
        rate: 0.09,
        name: 'Plan 4',
        description: 'Threshold: £25,000/year | Rate: 9%'
    },
    plan5: {
        threshold: 25000,
        rate: 0.09,
        name: 'Plan 5',
        description: 'Threshold: £25,000/year | Rate: 9%'
    },
    postgrad: {
        threshold: 21000,
        rate: 0.06,
        name: 'Postgraduate',
        description: 'Threshold: £21,000/year | Rate: 6%'
    }
};

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate personal allowance (tapers for high earners)
function calculatePersonalAllowance(adjustedGrossSalary, taxYear, isScotland = false) {
    const config = isScotland ? SCOTTISH_TAX_CONFIG[taxYear] : TAX_CONFIG[taxYear];
    
    if (adjustedGrossSalary <= config.personalAllowanceLimit) {
        return config.personalAllowance;
    }
    
    const excess = adjustedGrossSalary - config.personalAllowanceLimit;
    const reduction = excess * 0.5; // £1 reduction for every £2 over limit
    const adjustedAllowance = Math.max(0, config.personalAllowance - reduction);
    
    return adjustedAllowance;
}

// Calculate income tax
function calculateIncomeTax(adjustedGrossSalary, taxYear, isScotland = false) {
    console.log('calculateIncomeTax called with isScotland:', isScotland);
    const config = isScotland ? SCOTTISH_TAX_CONFIG[taxYear] : TAX_CONFIG[taxYear];
    console.log('Using config:', isScotland ? 'SCOTTISH' : 'UK', 'Tax bands:', config.taxBands.length);
    const personalAllowance = calculatePersonalAllowance(adjustedGrossSalary, taxYear, isScotland);
    
    let tax = 0;
    
    if (adjustedGrossSalary <= personalAllowance) {
        return 0; // All income covered by personal allowance
    }
    
    const taxableIncome = adjustedGrossSalary - personalAllowance;
    
    // Apply tax bands from config
    // Bands are defined by their gross income thresholds (assuming standard PA of £12,570)
    // We need to convert these to taxable income bands
    const standardPA = 12570;
    
    for (let i = 0; i < config.taxBands.length; i++) {
        const band = config.taxBands[i];
        
        // Convert gross income thresholds to taxable income thresholds
        // (using standard PA, not the individual's PA)
        const bandStartTaxable = Math.max(0, band.threshold - standardPA);
        const bandEndTaxable = band.limit === Infinity ? Infinity : band.limit - standardPA;
        
        // Check if any of the taxable income falls in this band
        if (taxableIncome > bandStartTaxable) {
            const taxableInBand = Math.min(taxableIncome, bandEndTaxable) - bandStartTaxable;
            if (taxableInBand > 0) {
                tax += taxableInBand * band.rate;
                console.log(`Band ${band.name}: £${taxableInBand.toFixed(2)} @ ${(band.rate * 100)}% = £${(taxableInBand * band.rate).toFixed(2)}`);
            }
        }
        
        // Stop if we've accounted for all taxable income
        if (taxableIncome <= bandEndTaxable) {
            break;
        }
    }
    
    return Math.round(tax * 100) / 100;
}

// Calculate National Insurance
function calculateNationalInsurance(adjustedGrossSalary, taxYear, ageGroup) {
    // No NI for people at or above State Pension age (66+)
    if (ageGroup === '66-74' || ageGroup === 'over74') {
        return 0;
    }
    
    const config = TAX_CONFIG[taxYear].ni;
    let ni = 0;
    
    if (adjustedGrossSalary <= config.primaryThreshold) {
        return 0;
    }
    
    // Calculate NI between primary threshold and upper earnings limit (8%)
    if (adjustedGrossSalary > config.primaryThreshold) {
        const lowerBandIncome = Math.min(
            adjustedGrossSalary - config.primaryThreshold,
            config.upperEarningsLimit - config.primaryThreshold
        );
        ni += lowerBandIncome * config.class1Rate;
    }
    
    // Calculate NI above upper earnings limit (2%)
    if (adjustedGrossSalary > config.upperEarningsLimit) {
        const upperBandIncome = adjustedGrossSalary - config.upperEarningsLimit;
        ni += upperBandIncome * config.class1UpperRate;
    }
    
    return Math.round(ni * 100) / 100;
}

// Calculate student loan repayment
function calculateStudentLoanRepayment(adjustedGrossSalary, studentLoanPlan) {
    if (studentLoanPlan === 'none') {
        return 0;
    }
    
    const plan = STUDENT_LOAN_CONFIG[studentLoanPlan];
    
    if (adjustedGrossSalary <= plan.threshold) {
        return 0;
    }
    
    const repayment = (adjustedGrossSalary - plan.threshold) * plan.rate;
    return Math.round(repayment * 100) / 100;
}

// Calculate net pay
function calculateNetPay(formData) {
    const {
        salary,
        bonus,
        isScotland,
        taxYear,
        ageGroup,
        hasPension,
        pensionType,
        pensionPercentage,
        pensionAmount,
        hasChildcareVouchers,
        childcareVouchersAmount,
        studentLoanPlan
    } = formData;
    
    // Salary is always annual now, add bonus
    const annualGrossSalary = salary + bonus;
    
    // Calculate annual pension contribution
    let annualPensionContribution = 0;
    if (hasPension) {
        if (pensionType === 'percentage') {
            annualPensionContribution = (annualGrossSalary * pensionPercentage) / 100;
        } else {
            annualPensionContribution = pensionAmount * 12;
        }
        
        // Cap at annual allowance
        const maxAllowance = TAX_CONFIG[taxYear].pensionAnnualAllowance;
        if (annualPensionContribution > maxAllowance) {
            annualPensionContribution = maxAllowance;
        }
    }
    
    // Calculate annual childcare vouchers (salary sacrifice)
    let annualChildcareVouchers = 0;
    if (hasChildcareVouchers) {
        annualChildcareVouchers = childcareVouchersAmount * 12;
    }
    
    // Calculate adjusted gross salary (after salary sacrifice: pension + childcare vouchers)
    const adjustedGrossSalary = annualGrossSalary - annualPensionContribution - annualChildcareVouchers;
    
    // Calculate deductions
    console.log('Debug: isScotland =', isScotland, 'taxYear =', taxYear);
    const incomeTax = calculateIncomeTax(adjustedGrossSalary, taxYear, isScotland);
    console.log('Income Tax calculated:', incomeTax);
    const nationalInsurance = calculateNationalInsurance(adjustedGrossSalary, taxYear, ageGroup);
    const studentLoanRepayment = calculateStudentLoanRepayment(adjustedGrossSalary, studentLoanPlan);
    
    // Calculate net pay
    const annualNetPay = adjustedGrossSalary - incomeTax - nationalInsurance - studentLoanRepayment;
    
    return {
        annualGross: annualGrossSalary,
        pensionContribution: annualPensionContribution,
        childcareVouchers: annualChildcareVouchers,
        adjustedGross: adjustedGrossSalary,
        incomeTax: incomeTax,
        nationalInsurance: nationalInsurance,
        studentLoanRepayment: studentLoanRepayment,
        annualNet: annualNetPay,
        monthlyGross: annualGrossSalary / 12,
        monthlyNet: annualNetPay / 12
    };
}

// Display results
function displayResults(results, isAnnual, hasPension, hasChildcareVouchers, hasStudentLoan) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    
    // Update net pay display
    const periodText = isAnnual ? 'per year' : 'per month';
    const displayAmount = isAnnual ? results.annualNet : results.monthlyNet;
    
    document.getElementById('netPayAmount').textContent = formatCurrency(displayAmount);
    document.getElementById('netPayPeriod').textContent = periodText;
    
    // Populate the table breakdown
    document.getElementById('tableGrossAnnual').textContent = formatCurrency(results.annualGross);
    document.getElementById('tableGrossMonthly').textContent = formatCurrency(results.monthlyGross);
    document.getElementById('tableGrossWeekly').textContent = formatCurrency(results.annualGross / 52);
    
    const tablePensionRow = document.getElementById('tablePensionRow');
    const tableChildcareRow = document.getElementById('tableChildcareRow');
    const tableAdjustedRow = document.getElementById('tableAdjustedRow');
    
    // Show/hide pension row
    if (hasPension && results.pensionContribution > 0) {
        tablePensionRow.style.display = 'table-row';
        document.getElementById('tablePensionAnnual').textContent = '-' + formatCurrency(results.pensionContribution);
        document.getElementById('tablePensionMonthly').textContent = '-' + formatCurrency(results.pensionContribution / 12);
        document.getElementById('tablePensionWeekly').textContent = '-' + formatCurrency(results.pensionContribution / 52);
    } else {
        tablePensionRow.style.display = 'none';
    }
    
    // Show/hide childcare vouchers row
    if (hasChildcareVouchers && results.childcareVouchers > 0) {
        tableChildcareRow.style.display = 'table-row';
        document.getElementById('tableChildcareAnnual').textContent = '-' + formatCurrency(results.childcareVouchers);
        document.getElementById('tableChildcareMonthly').textContent = '-' + formatCurrency(results.childcareVouchers / 12);
        document.getElementById('tableChildcareWeekly').textContent = '-' + formatCurrency(results.childcareVouchers / 52);
    } else {
        tableChildcareRow.style.display = 'none';
    }
    
    // Always show adjusted gross row
    tableAdjustedRow.style.display = 'table-row';
    document.getElementById('tableAdjustedAnnual').innerHTML = '<strong>' + formatCurrency(results.adjustedGross) + '</strong>';
    document.getElementById('tableAdjustedMonthly').innerHTML = '<strong>' + formatCurrency(results.adjustedGross / 12) + '</strong>';
    document.getElementById('tableAdjustedWeekly').innerHTML = '<strong>' + formatCurrency(results.adjustedGross / 52) + '</strong>';
    
    document.getElementById('tableTaxAnnual').textContent = '-' + formatCurrency(results.incomeTax);
    document.getElementById('tableTaxMonthly').textContent = '-' + formatCurrency(results.incomeTax / 12);
    document.getElementById('tableTaxWeekly').textContent = '-' + formatCurrency(results.incomeTax / 52);
    
    document.getElementById('tableNIAnnual').textContent = '-' + formatCurrency(results.nationalInsurance);
    document.getElementById('tableNIMonthly').textContent = '-' + formatCurrency(results.nationalInsurance / 12);
    document.getElementById('tableNIWeekly').textContent = '-' + formatCurrency(results.nationalInsurance / 52);
    
    const tableStudentLoanRow = document.getElementById('tableStudentLoanRow');
    if (hasStudentLoan && results.studentLoanRepayment > 0) {
        tableStudentLoanRow.style.display = 'table-row';
        document.getElementById('tableStudentLoanAnnual').textContent = '-' + formatCurrency(results.studentLoanRepayment);
        document.getElementById('tableStudentLoanMonthly').textContent = '-' + formatCurrency(results.studentLoanRepayment / 12);
        document.getElementById('tableStudentLoanWeekly').textContent = '-' + formatCurrency(results.studentLoanRepayment / 52);
    } else {
        tableStudentLoanRow.style.display = 'none';
    }
    
    document.getElementById('tableNetAnnual').innerHTML = '<strong>' + formatCurrency(results.annualNet) + '</strong>';
    document.getElementById('tableNetMonthly').innerHTML = '<strong>' + formatCurrency(results.monthlyNet) + '</strong>';
    document.getElementById('tableNetWeekly').innerHTML = '<strong>' + formatCurrency(results.annualNet / 52) + '</strong>';
    
    // Show mortgage affordability quick view
    const mortgageAffordability = document.getElementById('mortgageAffordability');
    const annualIncome = results.annualGross;
    const lowEstimate = annualIncome * 4;
    const highEstimate = annualIncome * 5.5;
    
    document.getElementById('affordabilityIncome').textContent = formatCurrency(annualIncome);
    document.getElementById('affordabilityLow').textContent = formatCurrency(lowEstimate);
    document.getElementById('affordabilityHigh').textContent = formatCurrency(highEstimate);
    mortgageAffordability.style.display = 'block';
    
    // Set up links with income parameter
    const mortgageAffordabilityLink = document.getElementById('mortgageAffordabilityLink');
    const budgetPlannerLink = document.getElementById('budgetPlannerLink');
    const whatsNextSection = document.getElementById('whatsNextSection');
    
    mortgageAffordabilityLink.href = `mortgage-affordability.html?income=${Math.round(annualIncome)}`;
    budgetPlannerLink.href = `budget-planner.html?income=${Math.round(results.monthlyNet)}`;
    whatsNextSection.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Handle URL parameters for pre-filling calculator
    const urlParams = new URLSearchParams(window.location.search);
    const salaryParam = urlParams.get('salary') || urlParams.get('amount');

    if (salaryParam) {
        const salaryInput = document.getElementById('salary');
        const numericSalary = parseFloat(salaryParam.replace(/[^0-9.]/g, ''));

        if (numericSalary && numericSalary > 0) {
            salaryInput.value = numericSalary;

            // Auto-calculate if salary is provided
            setTimeout(() => {
                form.dispatchEvent(new Event('submit'));
            }, 500);
        }
    }

    const form = document.getElementById('salaryForm');
    const hasPensionCheckbox = document.getElementById('hasPension');
    const pensionInputs = document.getElementById('pensionInputs');
    const pensionTypeRadios = document.querySelectorAll('input[name="pensionType"]');
    const pensionPercentageGroup = document.getElementById('pensionPercentageGroup');
    const pensionAmountGroup = document.getElementById('pensionAmountGroup');
    const hasChildcareVouchersCheckbox = document.getElementById('hasChildcareVouchers');
    const childcareVouchersInputs = document.getElementById('childcareVouchersInputs');
    const studentLoanSelect = document.getElementById('studentLoanPlan');
    const studentLoanInfo = document.getElementById('studentLoanInfo');
    const studentLoanText = document.getElementById('studentLoanText');
    
    // Toggle Scotland location and highlight active option
    const scotlandCheckbox = document.getElementById('isScotland');
    const englandLabel = document.getElementById('englandLabel');
    const scotlandLabel = document.getElementById('scotlandLabel');
    
    function updateLocationLabels() {
        if (englandLabel && scotlandLabel) {
            if (scotlandCheckbox.checked) {
                englandLabel.classList.remove('active');
                scotlandLabel.classList.add('active');
            } else {
                englandLabel.classList.add('active');
                scotlandLabel.classList.remove('active');
            }
        }
    }
    
    // Set initial state
    if (scotlandCheckbox) {
        updateLocationLabels();
        scotlandCheckbox.addEventListener('change', updateLocationLabels);
    }
    
    // Toggle pension inputs and update label
    const pensionToggleText = document.getElementById('pensionToggleText');
    hasPensionCheckbox.addEventListener('change', function() {
        pensionInputs.style.display = this.checked ? 'block' : 'none';
        if (pensionToggleText) {
            pensionToggleText.textContent = this.checked ? 'Yes' : 'No';
        }
    });
    
    // Toggle childcare vouchers inputs and update label
    const childcareToggleText = document.getElementById('childcareToggleText');
    hasChildcareVouchersCheckbox.addEventListener('change', function() {
        childcareVouchersInputs.style.display = this.checked ? 'block' : 'none';
        if (childcareToggleText) {
            childcareToggleText.textContent = this.checked ? 'Yes' : 'No';
        }
    });
    
    // Toggle pension type (percentage vs amount) - updated for inline layout
    pensionTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const percentInput = document.querySelector('.input-with-symbol.mini:has(#pensionPercentage)') || 
                                 document.getElementById('pensionPercentage')?.parentElement;
            if (this.value === 'percentage') {
                if (percentInput) percentInput.style.display = 'flex';
                pensionAmountGroup.style.display = 'none';
            } else {
                if (percentInput) percentInput.style.display = 'none';
                pensionAmountGroup.style.display = 'flex';
            }
        });
    });
    
    // Show student loan info when plan is selected
    studentLoanSelect.addEventListener('change', function() {
        if (this.value !== 'none') {
            const plan = STUDENT_LOAN_CONFIG[this.value];
            studentLoanText.textContent = plan.description;
            studentLoanInfo.style.display = 'block';
        } else {
            studentLoanInfo.style.display = 'none';
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const salary = parseFloat(document.getElementById('salary').value);
        const bonus = parseFloat(document.getElementById('bonus').value) || 0;
        const isScotland = document.getElementById('isScotland').checked;
        const taxYear = document.getElementById('taxYear').value;
        const ageGroup = document.getElementById('ageGroup').value;
        const hasPension = hasPensionCheckbox.checked;
        const pensionType = document.querySelector('input[name="pensionType"]:checked').value;
        const pensionPercentage = parseFloat(document.getElementById('pensionPercentage').value) || 0;
        const pensionAmount = parseFloat(document.getElementById('pensionAmount').value) || 0;
        const hasChildcareVouchers = document.getElementById('hasChildcareVouchers').checked;
        const childcareVouchersAmount = parseFloat(document.getElementById('childcareVouchersAmount').value) || 0;
        const studentLoanPlan = studentLoanSelect.value;
        
        // Validate inputs
        if (!salary || salary <= 0) {
            alert('Please enter a valid salary amount');
            return;
        }
        
        if (hasPension) {
            if (pensionType === 'percentage' && (pensionPercentage < 0 || pensionPercentage > 100)) {
                alert('Please enter a pension percentage between 0 and 100');
                return;
            }
            if (pensionType === 'amount' && pensionAmount < 0) {
                alert('Please enter a valid pension amount');
                return;
            }
        }
        
        // Prepare form data
        const formData = {
            salary,
            bonus,
            isScotland,
            taxYear,
            ageGroup,
            hasPension,
            pensionType,
            pensionPercentage,
            pensionAmount,
            hasChildcareVouchers,
            childcareVouchersAmount,
            studentLoanPlan
        };
        
        // Calculate net pay
        const results = calculateNetPay(formData);
        
        // Display results (show monthly net pay instead of annual)
        displayResults(results, false, hasPension, hasChildcareVouchers, studentLoanPlan !== 'none');
    });
});
