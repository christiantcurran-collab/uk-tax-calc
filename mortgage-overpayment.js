document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('overpaymentForm');
    const resultsSection = document.getElementById('results');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateOverpayment();
    });

    function calculateOverpayment() {
        // Get form values
        const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
        const remainingTerm = parseInt(document.getElementById('remainingTerm').value) || 20;
        const interestRate = parseFloat(document.getElementById('interestRate').value) || 4.5;
        const overpaymentAmount = parseFloat(document.getElementById('overpaymentAmount').value) || 0;

        // Calculate without overpayment
        const normalResults = calculateMortgage(loanAmount, remainingTerm, interestRate, 0);
        
        // Calculate with overpayment
        const overpaymentResults = calculateMortgage(loanAmount, remainingTerm, interestRate, overpaymentAmount);

        // Calculate differences
        const interestSaved = normalResults.totalInterest - overpaymentResults.totalInterest;
        const termSaved = normalResults.termMonths - overpaymentResults.termMonths;
        const termSavedYears = Math.floor(termSaved / 12);
        const termSavedMonths = termSaved % 12;

        // Display results
        document.getElementById('normalMonthly').textContent = formatCurrency(normalResults.monthlyPayment);
        document.getElementById('overpaymentMonthly').textContent = formatCurrency(overpaymentResults.monthlyPayment);
        document.getElementById('monthlyDiff').textContent = '+' + formatCurrency(overpaymentAmount);

        document.getElementById('normalInterest').textContent = formatCurrency(normalResults.totalInterest);
        document.getElementById('overpaymentInterest').textContent = formatCurrency(overpaymentResults.totalInterest);
        document.getElementById('interestSaved').textContent = formatCurrency(interestSaved) + ' saved';

        document.getElementById('normalTerm').textContent = formatTerm(normalResults.termMonths);
        document.getElementById('overpaymentTerm').textContent = formatTerm(overpaymentResults.termMonths);
        document.getElementById('termSaved').textContent = formatTermDiff(termSavedYears, termSavedMonths) + ' earlier';

        // Summary
        document.getElementById('summaryOverpayment').textContent = formatCurrency(overpaymentAmount);
        document.getElementById('summarySavings').textContent = formatCurrency(interestSaved);
        document.getElementById('summaryYears').textContent = formatTermDiff(termSavedYears, termSavedMonths);

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function calculateMortgage(principal, termYears, annualRate, monthlyOverpayment) {
        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = termYears * 12;
        
        // Calculate base monthly payment
        let monthlyPayment = 0;
        if (annualRate > 0) {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                           (Math.pow(1 + monthlyRate, totalMonths) - 1);
        } else {
            monthlyPayment = principal / totalMonths;
        }

        // Calculate with overpayment
        let balance = principal;
        let totalInterest = 0;
        let monthsPaid = 0;
        const totalMonthlyPayment = monthlyPayment + monthlyOverpayment;

        for (let month = 1; month <= totalMonths * 2; month++) { // Allow extra months for calculation
            if (balance <= 0) break;

            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(totalMonthlyPayment - interestPayment, balance);
            
            balance -= principalPayment;
            totalInterest += interestPayment;
            monthsPaid = month;

            if (balance < 1) break; // Mortgage paid off
        }

        return {
            monthlyPayment: monthlyPayment,
            totalInterest: totalInterest,
            termMonths: monthsPaid
        };
    }

    function formatCurrency(value) {
        return '£' + Math.round(value).toLocaleString();
    }

    function formatTerm(months) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
            return years + ' years';
        }
        return years + ' years ' + remainingMonths + ' months';
    }

    function formatTermDiff(years, months) {
        if (years === 0 && months === 0) {
            return '0 months';
        }
        if (years === 0) {
            return months + ' month' + (months !== 1 ? 's' : '');
        }
        if (months === 0) {
            return years + ' year' + (years !== 1 ? 's' : '');
        }
        return years + ' year' + (years !== 1 ? 's' : '') + ' ' + months + ' month' + (months !== 1 ? 's' : '');
    }
});

