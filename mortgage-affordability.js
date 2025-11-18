// Mortgage Affordability Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('affordabilityForm');
    const resultsSection = document.getElementById('results');
    const yourIncomeInput = document.getElementById('yourIncome');
    const partnerIncomeInput = document.getElementById('partnerIncome');

    // Check if income values are passed via URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const passedIncome = urlParams.get('income');
    if (passedIncome) {
        yourIncomeInput.value = passedIncome;
        // Auto-calculate if income is pre-filled
        setTimeout(() => {
            form.dispatchEvent(new Event('submit'));
        }, 100);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateAffordability();
    });

    function calculateAffordability() {
        // Get input values
        const yourIncome = parseFloat(yourIncomeInput.value) || 0;
        const partnerIncome = parseFloat(partnerIncomeInput.value) || 0;
        
        if (yourIncome === 0) {
            alert('Please enter your annual income');
            return;
        }

        // Calculate total income
        const totalIncome = yourIncome + partnerIncome;

        // Calculate borrowing capacity
        const lowEstimate = totalIncome * 4;
        const highEstimate = totalIncome * 5.5;

        // Display results
        displayResults(yourIncome, partnerIncome, totalIncome, lowEstimate, highEstimate);
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function displayResults(yourIncome, partnerIncome, totalIncome, lowEstimate, highEstimate) {
        // Display income breakdown
        document.getElementById('displayYourIncome').textContent = '£' + yourIncome.toLocaleString('en-GB', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        // Show/hide partner income row
        const partnerRow = document.getElementById('partnerIncomeRow');
        if (partnerIncome > 0) {
            partnerRow.style.display = 'flex';
            document.getElementById('displayPartnerIncome').textContent = '£' + partnerIncome.toLocaleString('en-GB', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } else {
            partnerRow.style.display = 'none';
        }

        document.getElementById('totalIncome').textContent = '£' + totalIncome.toLocaleString('en-GB', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        // Display borrowing estimates
        document.getElementById('lowEstimate').textContent = '£' + lowEstimate.toLocaleString('en-GB', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        document.getElementById('highEstimate').textContent = '£' + highEstimate.toLocaleString('en-GB', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
});

