document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('buyRentForm');
    const resultsSection = document.getElementById('results');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        compareCosts();
    });

    function compareCosts() {
        // Get form values
        const propertyPrice = parseFloat(document.getElementById('propertyPrice').value) || 0;
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
        const timeframe = parseInt(document.getElementById('timeframe').value) || 10;
        const deposit = parseFloat(document.getElementById('deposit').value) || 0;
        const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) || 4.5;
        const stampDuty = parseFloat(document.getElementById('stampDuty').value) || 0;
        const maintenanceCost = parseFloat(document.getElementById('maintenanceCost').value) || 0;
        const propertyGrowth = parseFloat(document.getElementById('propertyGrowth').value) || 3;
        const rentIncrease = parseFloat(document.getElementById('rentIncrease').value) || 2;

        // Calculate buying costs
        const loanAmount = propertyPrice - deposit;
        const monthlyRate = mortgageRate / 100 / 12;
        const numPayments = 25 * 12; // Assume 25 year mortgage
        
        let monthlyMortgage = 0;
        if (mortgageRate > 0) {
            monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                             (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            monthlyMortgage = loanAmount / numPayments;
        }

        const buyInitialCost = deposit + stampDuty;
        const buyMonthlyCost = monthlyMortgage + (maintenanceCost / 12);
        
        // Calculate total mortgage payments over timeframe
        let totalMortgagePaid = 0;
        let remainingBalance = loanAmount;
        for (let month = 1; month <= timeframe * 12; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = monthlyMortgage - interestPayment;
            remainingBalance -= principalPayment;
            totalMortgagePaid += monthlyMortgage;
        }

        const totalMaintenanceCost = maintenanceCost * timeframe;
        const buyTotalCost = buyInitialCost + totalMortgagePaid + totalMaintenanceCost;
        
        // Calculate property value after growth
        const futurePropertyValue = propertyPrice * Math.pow(1 + propertyGrowth / 100, timeframe);
        const equityBuilt = futurePropertyValue - Math.max(0, remainingBalance);
        const buyNetPosition = equityBuilt - buyTotalCost;

        // Calculate renting costs
        let totalRentPaid = 0;
        let currentRent = monthlyRent;
        for (let year = 0; year < timeframe; year++) {
            totalRentPaid += currentRent * 12;
            currentRent *= (1 + rentIncrease / 100);
        }

        const rentInitialCost = 0; // Simplified - could add deposit
        const rentTotalCost = totalRentPaid;
        const rentNetPosition = -rentTotalCost; // Negative as no equity built

        // Display results
        document.getElementById('buyInitial').textContent = formatCurrency(buyInitialCost);
        document.getElementById('rentInitial').textContent = formatCurrency(rentInitialCost);
        
        document.getElementById('buyMonthly').textContent = formatCurrency(buyMonthlyCost);
        document.getElementById('rentMonthly').textContent = formatCurrency(monthlyRent) + ' (initial)';
        
        document.getElementById('buyTotal').textContent = formatCurrency(buyTotalCost);
        document.getElementById('rentTotal').textContent = formatCurrency(rentTotalCost);
        
        document.getElementById('buyNet').textContent = formatCurrency(buyNetPosition);
        document.getElementById('rentNet').textContent = formatCurrency(rentNetPosition);

        // Recommendation
        const difference = buyNetPosition - rentNetPosition;
        const recommendationText = document.getElementById('recommendationText');
        
        if (difference > 50000) {
            recommendationText.innerHTML = `<strong style="color: var(--success-color);">Buying appears significantly better financially.</strong> 
                Over ${timeframe} years, buying could leave you approximately <strong>${formatCurrency(difference)}</strong> better off, 
                primarily due to building equity and property appreciation.`;
        } else if (difference > 0) {
            recommendationText.innerHTML = `<strong style="color: var(--primary-color);">Buying appears slightly better financially.</strong> 
                Over ${timeframe} years, buying could leave you approximately <strong>${formatCurrency(difference)}</strong> better off. 
                However, consider non-financial factors like flexibility and lifestyle.`;
        } else if (difference > -50000) {
            recommendationText.innerHTML = `<strong style="color: var(--text-medium);">The costs are relatively similar.</strong> 
                The financial difference is approximately <strong>${formatCurrency(Math.abs(difference))}</strong> in favor of renting. 
                Your decision may depend more on lifestyle factors and personal circumstances.`;
        } else {
            recommendationText.innerHTML = `<strong style="color: var(--danger-color);">Renting appears more cost-effective.</strong> 
                Over ${timeframe} years, renting could save you approximately <strong>${formatCurrency(Math.abs(difference))}</strong>. 
                However, you won't build equity. Consider your long-term plans.`;
        }

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function formatCurrency(value) {
        return '£' + Math.round(value).toLocaleString();
    }
});

