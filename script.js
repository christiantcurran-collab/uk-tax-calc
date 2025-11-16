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
            { threshold: 43662, rate: 0.42, limit: 125140, name: 'Higher Rate' },
            { threshold: 125140, rate: 0.47, limit: Infinity, name: 'Top Rate' }
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
            { threshold: 12570, rate: 0.19, limit: 14876, name: 'Starter Rate' },
            { threshold: 14876, rate: 0.20, limit: 26561, name: 'Basic Rate' },
            { threshold: 26561, rate: 0.21, limit: 43662, name: 'Intermediate Rate' },
            { threshold: 43662, rate: 0.42, limit: 125140, name: 'Higher Rate' },
            { threshold: 125140, rate: 0.47, limit: Infinity, name: 'Top Rate' }
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
    const config = isScotland ? SCOTTISH_TAX_CONFIG[taxYear] : TAX_CONFIG[taxYear];
    const personalAllowance = calculatePersonalAllowance(adjustedGrossSalary, taxYear, isScotland);
    
    let tax = 0;
    
    if (adjustedGrossSalary <= personalAllowance) {
        return 0; // All income covered by personal allowance
    }
    
    // UK Tax calculation:
    // Tax is applied to TAXABLE income (after PA is deducted)
    // Tax band widths based on taxable income:
    // £0 to £37,700: Basic rate (20%)
    // £37,700 to £125,140: Higher rate (40%) 
    // £125,140+: Additional rate (45%)
    
    const taxableIncome = adjustedGrossSalary - personalAllowance;
    
    // Basic rate: First £37,700 of taxable income at 20%
    if (taxableIncome > 0) {
        const basicRateTaxable = Math.min(taxableIncome, 37700);
        tax += basicRateTaxable * 0.20;
    }
    
    // Higher rate: £37,700 to £125,140 of taxable income at 40%
    if (taxableIncome > 37700) {
        const higherRateTaxable = Math.min(taxableIncome - 37700, 125140 - 37700);
        tax += higherRateTaxable * 0.40;
    }
    
    // Additional rate: Above £125,140 of taxable income at 45%
    if (taxableIncome > 125140) {
        const additionalRateTaxable = taxableIncome - 125140;
        tax += additionalRateTaxable * 0.45;
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
        isAnnual,
        taxYear,
        ageGroup,
        hasPension,
        pensionType,
        pensionPercentage,
        pensionAmount,
        studentLoanPlan
    } = formData;
    
    // Convert to annual salary
    const annualGrossSalary = isAnnual ? salary : salary * 12;
    
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
    
    // Calculate adjusted gross salary (after salary sacrifice pension)
    const adjustedGrossSalary = annualGrossSalary - annualPensionContribution;
    
    // Calculate deductions
    const incomeTax = calculateIncomeTax(adjustedGrossSalary, taxYear, isScotland);
    const nationalInsurance = calculateNationalInsurance(adjustedGrossSalary, taxYear, ageGroup);
    const studentLoanRepayment = calculateStudentLoanRepayment(adjustedGrossSalary, studentLoanPlan);
    
    // Calculate net pay
    const annualNetPay = adjustedGrossSalary - incomeTax - nationalInsurance - studentLoanRepayment;
    
    return {
        annualGross: annualGrossSalary,
        pensionContribution: annualPensionContribution,
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
function displayResults(results, isAnnual, hasPension, hasStudentLoan) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    
    // Update net pay display
    const periodText = isAnnual ? 'per year' : 'per month';
    const displayAmount = isAnnual ? results.annualNet : results.monthlyNet;
    
    document.getElementById('netPayAmount').textContent = formatCurrency(displayAmount);
    document.getElementById('netPayPeriod').textContent = periodText;
    
    // Update breakdown
    document.getElementById('grossSalary').textContent = formatCurrency(results.annualGross);
    
    // Show/hide pension row
    const pensionRow = document.getElementById('pensionRow');
    const adjustedGrossRow = document.getElementById('adjustedGrossRow');
    
    if (hasPension && results.pensionContribution > 0) {
        pensionRow.style.display = 'flex';
        adjustedGrossRow.style.display = 'flex';
        document.getElementById('pensionAmount').textContent = '-' + formatCurrency(results.pensionContribution);
        document.getElementById('adjustedGrossSalary').textContent = formatCurrency(results.adjustedGross);
    } else {
        pensionRow.style.display = 'none';
        adjustedGrossRow.style.display = 'flex';
        document.getElementById('adjustedGrossSalary').textContent = formatCurrency(results.adjustedGross);
    }
    
    document.getElementById('incomeTax').textContent = '-' + formatCurrency(results.incomeTax);
    document.getElementById('nationalInsurance').textContent = '-' + formatCurrency(results.nationalInsurance);
    
    // Show/hide student loan row
    const studentLoanRow = document.getElementById('studentLoanRow');
    if (hasStudentLoan && results.studentLoanRepayment > 0) {
        studentLoanRow.style.display = 'flex';
        document.getElementById('studentLoanRepayment').textContent = '-' + formatCurrency(results.studentLoanRepayment);
    } else {
        studentLoanRow.style.display = 'none';
    }
    
    document.getElementById('netPay').textContent = formatCurrency(results.annualNet);
    
    // Populate the table breakdown
    document.getElementById('tableGrossAnnual').textContent = formatCurrency(results.annualGross);
    document.getElementById('tableGrossMonthly').textContent = formatCurrency(results.monthlyGross);
    
    const tablePensionRow = document.getElementById('tablePensionRow');
    const tableAdjustedRow = document.getElementById('tableAdjustedRow');
    
    if (hasPension && results.pensionContribution > 0) {
        tablePensionRow.style.display = 'table-row';
        tableAdjustedRow.style.display = 'table-row';
        document.getElementById('tablePensionAnnual').textContent = '-' + formatCurrency(results.pensionContribution);
        document.getElementById('tablePensionMonthly').textContent = '-' + formatCurrency(results.pensionContribution / 12);
        document.getElementById('tableAdjustedAnnual').innerHTML = '<strong>' + formatCurrency(results.adjustedGross) + '</strong>';
        document.getElementById('tableAdjustedMonthly').innerHTML = '<strong>' + formatCurrency(results.adjustedGross / 12) + '</strong>';
    } else {
        tablePensionRow.style.display = 'none';
        tableAdjustedRow.style.display = 'table-row';
        document.getElementById('tableAdjustedAnnual').innerHTML = '<strong>' + formatCurrency(results.adjustedGross) + '</strong>';
        document.getElementById('tableAdjustedMonthly').innerHTML = '<strong>' + formatCurrency(results.adjustedGross / 12) + '</strong>';
    }
    
    document.getElementById('tableTaxAnnual').textContent = '-' + formatCurrency(results.incomeTax);
    document.getElementById('tableTaxMonthly').textContent = '-' + formatCurrency(results.incomeTax / 12);
    
    document.getElementById('tableNIAnnual').textContent = '-' + formatCurrency(results.nationalInsurance);
    document.getElementById('tableNIMonthly').textContent = '-' + formatCurrency(results.nationalInsurance / 12);
    
    const tableStudentLoanRow = document.getElementById('tableStudentLoanRow');
    if (hasStudentLoan && results.studentLoanRepayment > 0) {
        tableStudentLoanRow.style.display = 'table-row';
        document.getElementById('tableStudentLoanAnnual').textContent = '-' + formatCurrency(results.studentLoanRepayment);
        document.getElementById('tableStudentLoanMonthly').textContent = '-' + formatCurrency(results.studentLoanRepayment / 12);
    } else {
        tableStudentLoanRow.style.display = 'none';
    }
    
    document.getElementById('tableNetAnnual').innerHTML = '<strong>' + formatCurrency(results.annualNet) + '</strong>';
    document.getElementById('tableNetMonthly').innerHTML = '<strong>' + formatCurrency(results.monthlyNet) + '</strong>';
    
    // Update monthly breakdown
    const monthlyBreakdown = document.getElementById('monthlyBreakdown');
    if (isAnnual) {
        monthlyBreakdown.style.display = 'block';
        document.getElementById('monthlyGross').textContent = formatCurrency(results.monthlyGross);
        document.getElementById('monthlyNet').textContent = formatCurrency(results.monthlyNet);
    } else {
        monthlyBreakdown.style.display = 'none';
    }
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('salaryForm');
    const hasPensionCheckbox = document.getElementById('hasPension');
    const pensionInputs = document.getElementById('pensionInputs');
    const pensionTypeRadios = document.querySelectorAll('input[name="pensionType"]');
    const pensionPercentageGroup = document.getElementById('pensionPercentageGroup');
    const pensionAmountGroup = document.getElementById('pensionAmountGroup');
    const studentLoanSelect = document.getElementById('studentLoanPlan');
    const studentLoanInfo = document.getElementById('studentLoanInfo');
    const studentLoanText = document.getElementById('studentLoanText');
    
    // Toggle pension inputs
    hasPensionCheckbox.addEventListener('change', function() {
        pensionInputs.style.display = this.checked ? 'block' : 'none';
    });
    
    // Toggle pension type (percentage vs amount)
    pensionTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'percentage') {
                pensionPercentageGroup.style.display = 'block';
                pensionAmountGroup.style.display = 'none';
            } else {
                pensionPercentageGroup.style.display = 'none';
                pensionAmountGroup.style.display = 'block';
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
            isAnnual: frequency === 'annual',
            taxYear,
            ageGroup,
            hasPension,
            pensionType,
            pensionPercentage,
            pensionAmount,
            studentLoanPlan
        };
        
        // Calculate net pay
        const results = calculateNetPay(formData);
        
        // Display results
        displayResults(results, formData.isAnnual, hasPension, studentLoanPlan !== 'none');
    });
});
