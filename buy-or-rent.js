// Buy or Rent Calculator JavaScript

let comparisonChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('buyRentForm');
    const resultsSection = document.getElementById('results');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBuyVsRent();
    });

    function calculateBuyVsRent() {
        // Get input values
        const propertyPrice = parseFloat(document.getElementById('propertyPrice').value);
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
        const location = document.getElementById('location').value;
        const isAdditional = document.querySelector('input[name="additionalProperty"]:checked').value === 'yes';
        const deposit = parseFloat(document.getElementById('deposit').value);
        const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) / 100;
        const mortgageTerm = parseInt(document.getElementById('mortgageTerm').value);
        const adminFees = parseFloat(document.getElementById('adminFees').value);

        // Calculate stamp duty
        const stampDuty = calculateStampDutySimple(propertyPrice, location, isAdditional);

        // Calculate mortgage amount and monthly payment
        const loanAmount = propertyPrice - deposit;
        const monthlyRate = mortgageRate / 12;
        const numberOfPayments = mortgageTerm * 12;
        
        let monthlyMortgage;
        if (monthlyRate === 0) {
            monthlyMortgage = loanAmount / numberOfPayments;
        } else {
            monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        // Calculate total upfront cost
        const totalUpfront = stampDuty + adminFees + deposit;

        // Calculate 5-year comparison for different growth rates
        const growthRates = [-0.03, -0.015, 0, 0.015, 0.03];
        const comparisonData = growthRates.map(rate => 
            calculateFiveYearComparison(
                propertyPrice,
                loanAmount,
                monthlyMortgage,
                monthlyRent,
                totalUpfront,
                rate,
                mortgageRate
            )
        );

        // Display results
        displayResults(
            stampDuty,
            adminFees,
            deposit,
            totalUpfront,
            monthlyMortgage,
            monthlyRent,
            comparisonData
        );
    }

    function calculateStampDutySimple(price, location, isAdditional) {
        // Simplified stamp duty calculation (using standard rates, not first-time buyer)
        let stampDuty = 0;

        if (location === 'uk') {
            // England, Wales, Northern Ireland
            if (isAdditional) {
                // Additional property rates
                if (price > 125000) stampDuty += Math.min(price - 125000, 125000) * 0.05;
                if (price > 125000) stampDuty += Math.min(price - 125000, 125000) * 0.07;
                if (price > 250000) stampDuty += Math.min(price - 250000, 675000) * 0.10;
                if (price > 925000) stampDuty += Math.min(price - 925000, 575000) * 0.15;
                if (price > 1500000) stampDuty += (price - 1500000) * 0.17;
            } else {
                // Standard rates
                if (price > 125000) stampDuty += Math.min(price - 125000, 125000) * 0.02;
                if (price > 250000) stampDuty += Math.min(price - 250000, 675000) * 0.05;
                if (price > 925000) stampDuty += Math.min(price - 925000, 575000) * 0.10;
                if (price > 1500000) stampDuty += (price - 1500000) * 0.12;
            }
        } else {
            // Scotland
            if (isAdditional) {
                // ADS rates
                if (price > 145000) stampDuty += Math.min(price - 145000, 105000) * 0.06;
                if (price > 145000) stampDuty += Math.min(price - 145000, 105000) * 0.08;
                if (price > 250000) stampDuty += Math.min(price - 250000, 75000) * 0.11;
                if (price > 325000) stampDuty += Math.min(price - 325000, 425000) * 0.16;
                if (price > 750000) stampDuty += (price - 750000) * 0.18;
            } else {
                // Standard rates
                if (price > 145000) stampDuty += Math.min(price - 145000, 105000) * 0.02;
                if (price > 250000) stampDuty += Math.min(price - 250000, 75000) * 0.05;
                if (price > 325000) stampDuty += Math.min(price - 325000, 425000) * 0.10;
                if (price > 750000) stampDuty += (price - 750000) * 0.12;
            }
        }

        return stampDuty;
    }

    function calculateFiveYearComparison(propertyPrice, loanAmount, monthlyMortgage, monthlyRent, upfrontCost, growthRate, mortgageRate) {
        const years = 5;
        const months = years * 12;

        // Calculate property value after 5 years
        const futurePropertyValue = propertyPrice * Math.pow(1 + growthRate, years);

        // Calculate remaining mortgage balance after 5 years
        const monthlyRate = mortgageRate / 12;
        let remainingBalance = loanAmount;
        
        for (let i = 0; i < months; i++) {
            const interest = remainingBalance * monthlyRate;
            const principal = monthlyMortgage - interest;
            remainingBalance -= principal;
        }

        // Calculate equity
        const equity = futurePropertyValue - remainingBalance;

        // Calculate total cost to buy
        const totalMortgagePayments = monthlyMortgage * months;
        const netCostToBuy = upfrontCost + totalMortgagePayments - equity;

        // Calculate total cost to rent
        const totalRentPayments = monthlyRent * months;
        const netCostToRent = totalRentPayments;

        // Determine better option
        const difference = netCostToRent - netCostToBuy;
        const betterOption = difference > 0 ? 'Buy' : 'Rent';
        const savingsAmount = Math.abs(difference);

        return {
            growthRate: growthRate,
            futurePropertyValue: futurePropertyValue,
            equity: equity,
            netCostToBuy: netCostToBuy,
            netCostToRent: netCostToRent,
            betterOption: betterOption,
            savingsAmount: savingsAmount
        };
    }

    function displayResults(stampDuty, adminFees, deposit, totalUpfront, monthlyMortgage, monthlyRent, comparisonData) {
        // Display initial costs
        document.getElementById('stampDuty').textContent = '£' + stampDuty.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        document.getElementById('displayAdminFees').textContent = '£' + adminFees.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        document.getElementById('displayDeposit').textContent = '£' + deposit.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        document.getElementById('totalUpfront').textContent = '£' + totalUpfront.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Display monthly costs
        document.getElementById('monthlyMortgage').textContent = '£' + monthlyMortgage.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        document.getElementById('displayRent').textContent = '£' + monthlyRent.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const monthlyDiff = monthlyMortgage - monthlyRent;
        const diffElement = document.getElementById('monthlyDifference');
        diffElement.textContent = (monthlyDiff >= 0 ? '+' : '') + '£' + Math.abs(monthlyDiff).toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        diffElement.style.color = monthlyDiff >= 0 ? 'var(--danger-color)' : 'var(--success-color)';

        // Display comparison table
        const tableBody = document.getElementById('comparisonTable');
        tableBody.innerHTML = '';

        comparisonData.forEach(data => {
            const row = document.createElement('tr');
            const isBuyBetter = data.betterOption === 'Buy';
            const percentageStr = (data.growthRate * 100).toFixed(1);
            const displayPercentage = data.growthRate >= 0 ? `+${percentageStr}` : percentageStr;
            
            row.innerHTML = `
                <td><strong>${displayPercentage}% per year</strong></td>
                <td>£${data.futurePropertyValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>£${data.equity.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>£${data.netCostToBuy.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>£${data.netCostToRent.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td style="color: ${isBuyBetter ? 'var(--success-color)' : 'var(--primary-color)'}; font-weight: bold;">
                    ${data.betterOption} (Save £${data.savingsAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Create chart
        createComparisonChart(comparisonData);

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function createComparisonChart(comparisonData) {
        const ctx = document.getElementById('comparisonChart');

        // Destroy existing chart if it exists
        if (comparisonChart) {
            comparisonChart.destroy();
        }

        const labels = comparisonData.map(d => {
            const percentageStr = (d.growthRate * 100).toFixed(1);
            const displayPercentage = d.growthRate >= 0 ? `+${percentageStr}` : percentageStr;
            return displayPercentage + '% Growth';
        });
        const buyData = comparisonData.map(d => d.netCostToBuy);
        const rentData = comparisonData.map(d => d.netCostToRent);

        comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net Cost to Buy',
                        data: buyData,
                        backgroundColor: 'rgba(0, 102, 204, 0.7)',
                        borderColor: 'rgba(0, 102, 204, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Net Cost to Rent',
                        data: rentData,
                        backgroundColor: 'rgba(51, 133, 214, 0.7)',
                        borderColor: 'rgba(51, 133, 214, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    title: {
                        display: true,
                        text: '5-Year Net Cost Comparison (Lower is Better)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '£' + context.parsed.y.toLocaleString('en-GB', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Annual Property Growth Rate'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Net Cost After 5 Years (£)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '£' + value.toLocaleString('en-GB', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                            }
                        }
                    }
                }
            }
        });
    }
});
