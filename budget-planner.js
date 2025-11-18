// Budget Planner JavaScript

let expensesPieChart = null;
let incomeVsExpensesChart = null;
let categoryBarChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('budgetForm');
    const resultsSection = document.getElementById('results');
    const downloadBtn = document.getElementById('downloadExcel');

    // Check if income is passed via URL parameter (monthly net income)
    const urlParams = new URLSearchParams(window.location.search);
    const passedIncome = urlParams.get('income');
    if (passedIncome) {
        // This is monthly net income from the tax calculator
        document.getElementById('incomeEmployment').value = passedIncome;
        // Auto-calculate if income is pre-filled
        setTimeout(() => {
            form.dispatchEvent(new Event('submit'));
        }, 100);
    }

    // Auto-calculate on input change
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (resultsSection.style.display === 'block') {
                calculateBudget();
            }
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBudget();
    });

    downloadBtn.addEventListener('click', function() {
        downloadExcel();
    });

    function calculateBudget() {
        // Calculate total income
        const incomeEmployment = parseFloat(document.getElementById('incomeEmployment').value) || 0;
        const incomePension = parseFloat(document.getElementById('incomePension').value) || 0;
        const incomeBenefits = parseFloat(document.getElementById('incomeBenefits').value) || 0;
        const incomeOther = parseFloat(document.getElementById('incomeOther').value) || 0;
        
        const totalIncome = incomeEmployment + incomePension + incomeBenefits + incomeOther;

        // Calculate expenses by category
        const categories = {};
        const expenseInputs = document.querySelectorAll('.expense-input');
        
        expenseInputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            const category = input.getAttribute('data-category');
            
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category] += value;
        });

        // Calculate total expenses
        const totalExpenses = Object.values(categories).reduce((sum, val) => sum + val, 0);
        const netBalance = totalIncome - totalExpenses;

        // Display results
        displayResults(totalIncome, totalExpenses, netBalance, categories);
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function displayResults(totalIncome, totalExpenses, netBalance, categories) {
        // Update summary cards
        document.getElementById('totalIncome').textContent = '£' + totalIncome.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        document.getElementById('totalExpenses').textContent = '£' + totalExpenses.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const balanceElement = document.getElementById('netBalance');
        balanceElement.textContent = '£' + netBalance.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Update balance card styling
        const balanceCard = document.querySelector('.balance-card');
        if (netBalance >= 0) {
            balanceCard.style.borderTop = '4px solid var(--success-color)';
            balanceElement.style.color = 'var(--success-color)';
        } else {
            balanceCard.style.borderTop = '4px solid var(--danger-color)';
            balanceElement.style.color = 'var(--danger-color)';
        }

        // Display category breakdown
        displayCategoryBreakdown(categories, totalExpenses);

        // Create charts
        createExpensesPieChart(categories);
        createIncomeVsExpensesChart(totalIncome, totalExpenses);
        createCategoryBarChart(categories);
    }

    function displayCategoryBreakdown(categories, totalExpenses) {
        const breakdownContainer = document.getElementById('categoryBreakdown');
        breakdownContainer.innerHTML = '';

        // Sort categories by amount (highest first)
        const sortedCategories = Object.entries(categories)
            .filter(([_, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1]);

        sortedCategories.forEach(([category, amount]) => {
            const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
            
            const item = document.createElement('div');
            item.className = 'breakdown-item';
            item.innerHTML = `
                <span><i class="fas fa-circle" style="color: ${getCategoryColor(category)}; font-size: 0.7rem; margin-right: 0.5rem;"></i>${category}</span>
                <span>
                    £${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <small style="color: var(--text-light); margin-left: 0.5rem;">(${percentage.toFixed(1)}%)</small>
                </span>
            `;
            breakdownContainer.appendChild(item);
        });

        if (sortedCategories.length === 0) {
            breakdownContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No expenses entered yet</p>';
        }
    }

    function createExpensesPieChart(categories) {
        const ctx = document.getElementById('expensesPieChart');

        // Destroy existing chart
        if (expensesPieChart) {
            expensesPieChart.destroy();
        }

        // Filter out zero values
        const filteredCategories = Object.entries(categories).filter(([_, amount]) => amount > 0);
        
        if (filteredCategories.length === 0) {
            return;
        }

        const labels = filteredCategories.map(([category, _]) => category);
        const data = filteredCategories.map(([_, amount]) => amount);
        const colors = filteredCategories.map(([category, _]) => getCategoryColor(category));

        expensesPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Spending by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '£' + context.parsed.toLocaleString('en-GB', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                label += ' (' + percentage + '%)';
                                
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function createIncomeVsExpensesChart(totalIncome, totalExpenses) {
        const ctx = document.getElementById('incomeVsExpensesChart');

        // Destroy existing chart
        if (incomeVsExpensesChart) {
            incomeVsExpensesChart.destroy();
        }

        incomeVsExpensesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Amount (£)',
                    data: [totalIncome, totalExpenses],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(0, 102, 204, 0.7)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(0, 102, 204, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Income vs Expenses',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '£' + context.parsed.y.toLocaleString('en-GB', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '£' + value.toLocaleString('en-GB');
                            }
                        }
                    }
                }
            }
        });
    }

    function createCategoryBarChart(categories) {
        const ctx = document.getElementById('categoryBarChart');

        // Destroy existing chart
        if (categoryBarChart) {
            categoryBarChart.destroy();
        }

        // Filter and sort categories
        const filteredCategories = Object.entries(categories)
            .filter(([_, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1]);

        if (filteredCategories.length === 0) {
            return;
        }

        const labels = filteredCategories.map(([category, _]) => category);
        const data = filteredCategories.map(([_, amount]) => amount);
        const colors = filteredCategories.map(([category, _]) => getCategoryColor(category));

        categoryBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spending (£)',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Spending by Category (Detailed)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '£' + context.parsed.x.toLocaleString('en-GB', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '£' + value.toLocaleString('en-GB');
                            }
                        }
                    }
                }
            }
        });
    }

    function getCategoryColor(category) {
        const colorMap = {
            'Home': 'rgba(0, 102, 204, 0.7)',
            'Insurance': 'rgba(255, 99, 132, 0.7)',
            'Transport': 'rgba(255, 159, 64, 0.7)',
            'Loan Repayments': 'rgba(255, 205, 86, 0.7)',
            'Food & Drink': 'rgba(75, 192, 192, 0.7)',
            'Family': 'rgba(54, 162, 235, 0.7)',
            'Entertainment': 'rgba(153, 102, 255, 0.7)',
            'Health': 'rgba(40, 167, 69, 0.7)',
            'Clothes': 'rgba(201, 203, 207, 0.7)',
            'Education': 'rgba(255, 99, 255, 0.7)',
            'Other': 'rgba(128, 128, 128, 0.7)'
        };
        return colorMap[category] || 'rgba(128, 128, 128, 0.7)';
    }

    function downloadExcel() {
        // Prepare income data
        const incomeData = [
            ['INCOME'],
            ['Category', 'Amount'],
            ['Income from Employment', parseFloat(document.getElementById('incomeEmployment').value) || 0],
            ['Income from Pension', parseFloat(document.getElementById('incomePension').value) || 0],
            ['Income from Benefits', parseFloat(document.getElementById('incomeBenefits').value) || 0],
            ['Other Income', parseFloat(document.getElementById('incomeOther').value) || 0],
            [],
            ['Total Income', parseFloat(document.getElementById('incomeEmployment').value || 0) + 
                           parseFloat(document.getElementById('incomePension').value || 0) + 
                           parseFloat(document.getElementById('incomeBenefits').value || 0) + 
                           parseFloat(document.getElementById('incomeOther').value || 0)]
        ];

        // Prepare expenses data grouped by category
        const expenseData = [
            [],
            ['EXPENSES'],
            []
        ];

        // Get all expense inputs grouped by category
        const categories = {
            'Home': [],
            'Insurance': [],
            'Transport': [],
            'Loan Repayments': [],
            'Food & Drink': [],
            'Family': [],
            'Entertainment': [],
            'Health': [],
            'Clothes': [],
            'Education': [],
            'Other': []
        };

        const expenseInputs = document.querySelectorAll('.expense-input');
        expenseInputs.forEach(input => {
            const category = input.getAttribute('data-category');
            const label = input.closest('.input-group').querySelector('label').textContent.trim();
            const value = parseFloat(input.value) || 0;
            
            if (categories[category]) {
                categories[category].push([label, value]);
            }
        });

        // Add category data to expenses
        let totalExpenses = 0;
        Object.entries(categories).forEach(([categoryName, items]) => {
            const categoryTotal = items.reduce((sum, item) => sum + item[1], 0);
            
            if (categoryTotal > 0) {
                expenseData.push([categoryName]);
                items.forEach(([label, value]) => {
                    if (value > 0) {
                        expenseData.push([label, value]);
                    }
                });
                expenseData.push(['Subtotal', categoryTotal]);
                expenseData.push([]);
                totalExpenses += categoryTotal;
            }
        });

        expenseData.push(['Total Expenses', totalExpenses]);

        // Summary section
        const totalIncome = parseFloat(document.getElementById('incomeEmployment').value || 0) + 
                          parseFloat(document.getElementById('incomePension').value || 0) + 
                          parseFloat(document.getElementById('incomeBenefits').value || 0) + 
                          parseFloat(document.getElementById('incomeOther').value || 0);
        
        const summaryData = [
            [],
            [],
            ['SUMMARY'],
            ['Total Income', totalIncome],
            ['Total Expenses', totalExpenses],
            ['Remaining Balance', totalIncome - totalExpenses]
        ];

        // Combine all data
        const worksheetData = [...incomeData, ...expenseData, ...summaryData];

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        ws['!cols'] = [
            { wch: 40 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Budget');

        // Generate file name with date
        const date = new Date();
        const fileName = `Budget_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;

        // Download
        XLSX.writeFile(wb, fileName);
    }
});

