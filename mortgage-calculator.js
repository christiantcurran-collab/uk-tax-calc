document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mortgageForm');
    const buyersSelect = document.getElementById('buyers');
    const income2Group = document.getElementById('income2Group');
    const resultsSection = document.getElementById('results');

    // Show/hide second income field
    buyersSelect.addEventListener('change', function() {
        if (this.value === '2') {
            income2Group.style.display = 'block';
        } else {
            income2Group.style.display = 'none';
            document.getElementById('income2').value = '';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateMortgage();
    });

    function calculateMortgage() {
        // Get form values
        const income1 = parseFloat(document.getElementById('income1').value) || 0;
        const income2 = parseFloat(document.getElementById('income2').value) || 0;
        const deposit = parseFloat(document.getElementById('deposit').value) || 0;
        const term = parseInt(document.getElementById('term').value) || 25;
        const interestRate = parseFloat(document.getElementById('interestRate').value) || 4.5;

        // Calculate total income
        const totalIncome = income1 + income2;

        // Calculate maximum loan (typically 4.5x income)
        const maxLoan = Math.round(totalIncome * 4.5);

        // Calculate property value (loan + deposit)
        const propertyValue = maxLoan + deposit;

        // Calculate LTV ratio
        const ltvRatio = propertyValue > 0 ? Math.round((maxLoan / propertyValue) * 100) : 0;

        // Calculate monthly payment
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = term * 12;
        let monthlyPayment = 0;

        if (interestRate > 0) {
            monthlyPayment = maxLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            monthlyPayment = maxLoan / numPayments;
        }

        // Display results
        document.getElementById('maxLoan').textContent = '£' + maxLoan.toLocaleString();
        document.getElementById('totalIncome').textContent = '£' + totalIncome.toLocaleString();
        document.getElementById('monthlyPayment').textContent = '£' + Math.round(monthlyPayment).toLocaleString();
        document.getElementById('displayRate').textContent = interestRate + '%';
        document.getElementById('displayTerm').textContent = term + ' years';
        document.getElementById('ltvRatio').textContent = ltvRatio + '%';
        document.getElementById('loanForLTV').textContent = '£' + maxLoan.toLocaleString();
        document.getElementById('depositForLTV').textContent = '£' + deposit.toLocaleString();

        // LTV advice
        const ltvAdvice = document.getElementById('ltvAdvice');
        if (ltvRatio <= 75) {
            ltvAdvice.textContent = 'Your LTV is relatively low. You are likely to be offered more generous interest rates.';
            ltvAdvice.style.color = 'var(--success-color)';
        } else if (ltvRatio <= 85) {
            ltvAdvice.textContent = 'Your LTV is moderate. You should have access to competitive mortgage deals.';
            ltvAdvice.style.color = 'var(--primary-color)';
        } else if (ltvRatio <= 90) {
            ltvAdvice.textContent = 'Your LTV is relatively high. Consider saving a larger deposit for better rates.';
            ltvAdvice.style.color = 'var(--text-medium)';
        } else {
            ltvAdvice.textContent = 'Your LTV is very high. You may face limited options and higher interest rates.';
            ltvAdvice.style.color = 'var(--danger-color)';
        }

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function formatCurrency(value) {
        return '£' + Math.round(value).toLocaleString();
    }
});

