// Collapsible Section Toggle
function toggleSection(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.classList.remove('rotated');
    } else {
        content.classList.add('open');
        icon.classList.add('rotated');
    }
}

// Expand All / Collapse All
function expandAll() {
    const contents = document.querySelectorAll('.collapsible-content');
    const icons = document.querySelectorAll('.toggle-icon');
    
    contents.forEach(content => content.classList.add('open'));
    icons.forEach(icon => icon.classList.add('rotated'));
}

function collapseAll() {
    const contents = document.querySelectorAll('.collapsible-content');
    const icons = document.querySelectorAll('.toggle-icon');
    
    contents.forEach(content => content.classList.remove('open'));
    icons.forEach(icon => icon.classList.remove('rotated'));
}

// Email Capture Modal Functions
function showEmailCaptureModal() {
    document.getElementById('emailCaptureModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeEmailCaptureModal() {
    document.getElementById('emailCaptureModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('emailCaptureModal');
    if (event.target === modal) {
        closeEmailCaptureModal();
    }
}

// Handle Email Submission
async function handleEmailSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('downloadEmail').value;
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Subscribing...</span>';
    
    try {
        // Add to Mailchimp using JSONP
        const mailchimpUrl = 'https://quidwise.us18.list-manage.com/subscribe/post-json';
        const params = new URLSearchParams({
            u: 'e025cbf9df423e6bfc42642a1',
            id: '158f4d7246',
            EMAIL: email,
            c: 'mailchimpCallback'
        });
        
        // Create callback function
        window.mailchimpCallback = function(data) {
            if (data.result === 'success' || data.msg.includes('already subscribed')) {
                // Success or already subscribed - proceed with download
                submitButton.innerHTML = '<i class="fas fa-check"></i> <span>Success! Downloading...</span>';
                
                setTimeout(() => {
                    // Collect and download budget
                    const budgetData = collectBudgetData();
                    downloadPremiumExcel(budgetData);
                    
                    // Close modal
                    closeEmailCaptureModal();
                    
                    // Reset form
                    document.getElementById('emailCaptureForm').reset();
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    
                    // Show thank you message
                    alert('✅ Thank you for subscribing! Your budget is downloading now. Check your email for our weekly finance tips!');
                }, 1000);
            } else {
                // Error
                throw new Error(data.msg || 'Subscription failed');
            }
        };
        
        // Create script tag for JSONP request
        const script = document.createElement('script');
        script.src = `${mailchimpUrl}?${params.toString()}`;
        document.body.appendChild(script);
        
        // Clean up script after 5 seconds
        setTimeout(() => {
            document.body.removeChild(script);
            delete window.mailchimpCallback;
        }, 5000);
        
    } catch (error) {
        console.error('Subscription error:', error);
        alert('⚠️ There was an issue with the subscription. We\'ll download your budget anyway!');
        
        // Download anyway even if subscription fails
        const budgetData = collectBudgetData();
        downloadPremiumExcel(budgetData);
        closeEmailCaptureModal();
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

function collectBudgetData() {
    const data = {
        income: {},
        expenses: {}
    };
    
    // Collect income
    const incomeInputs = document.querySelectorAll('.income-input');
    incomeInputs.forEach(input => {
        data.income[input.id] = parseFloat(input.value) || 0;
    });
    
    // Collect expenses
    const expenseInputs = document.querySelectorAll('.expense-input');
    expenseInputs.forEach(input => {
        data.expenses[input.id] = parseFloat(input.value) || 0;
    });
    
    return data;
}

async function downloadPremiumExcel(data) {
    // Create new workbook with ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Budget', {
        properties: { tabColor: { argb: '1A6B5C' } }
    });
    
    // Set column widths
    worksheet.columns = [
        { width: 45 },
        { width: 18 }
    ];
    
    // QuidWise Colors
    const primaryGreen = '1A6B5C';
    const lightGreen = 'E8F5F3';
    const darkGreen = '155448';
    const white = 'FFFFFF';
    const lightGray = 'F5F5F5';
    const orange = 'FF9800';
    const red = 'E74C3C';
    
    // ========== HEADER SECTION ==========
    worksheet.mergeCells('A1:B1');
    const titleRow = worksheet.getRow(1);
    titleRow.height = 30;
    titleRow.getCell(1).value = 'QuidWise Budget Planner';
    titleRow.getCell(1).font = { name: 'Calibri', size: 20, bold: true, color: { argb: white } };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryGreen } };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    worksheet.mergeCells('A2:B2');
    const subtitleRow = worksheet.getRow(2);
    subtitleRow.height = 22;
    subtitleRow.getCell(1).value = 'Your Personal Monthly Budget';
    subtitleRow.getCell(1).font = { name: 'Calibri', size: 14, italic: true, color: { argb: primaryGreen } };
    subtitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    worksheet.mergeCells('A3:B3');
    const dateRow = worksheet.getRow(3);
    dateRow.getCell(1).value = 'Generated: ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    dateRow.getCell(1).font = { name: 'Calibri', size: 11, color: { argb: '666666' } };
    dateRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    let currentRow = 5;
    
    // ========== INCOME SECTION ==========
    const incomeHeaderRow = worksheet.getRow(currentRow);
    incomeHeaderRow.height = 25;
    incomeHeaderRow.getCell(1).value = 'INCOME';
    incomeHeaderRow.getCell(2).value = 'Amount (£)';
    incomeHeaderRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: white } };
    incomeHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkGreen } };
    incomeHeaderRow.alignment = { vertical: 'middle', horizontal: 'left' };
    incomeHeaderRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    currentRow++;
    
    // Income items
    const incomeItems = [
        ['Income from Employment', data.income.incomeEmployment || 0],
        ['Income from Pension', data.income.incomePension || 0],
        ['Income from Benefits', data.income.incomeBenefits || 0],
        ['Other Income', data.income.incomeOther || 0]
    ];
    
    incomeItems.forEach(([label, value]) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = label;
        row.getCell(2).value = value;
        row.getCell(2).numFmt = '£#,##0.00';
        row.getCell(1).font = { name: 'Calibri', size: 11 };
        row.getCell(2).font = { name: 'Calibri', size: 11 };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGray } };
        row.eachCell(cell => {
            cell.border = { left: { style: 'thin' }, right: { style: 'thin' } };
        });
        currentRow++;
    });
    
    // Total Income
    currentRow++;
    const totalIncomeRow = worksheet.getRow(currentRow);
    totalIncomeRow.height = 22;
    const totalIncome = (data.income.incomeEmployment || 0) + (data.income.incomePension || 0) + (data.income.incomeBenefits || 0) + (data.income.incomeOther || 0);
    totalIncomeRow.getCell(1).value = 'TOTAL INCOME';
    totalIncomeRow.getCell(2).value = totalIncome;
    totalIncomeRow.getCell(2).numFmt = '£#,##0.00';
    totalIncomeRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: white } };
    totalIncomeRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryGreen } };
    totalIncomeRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    currentRow += 3;
    
    // ========== EXPENSES SECTION ==========
    const expenseHeaderRow = worksheet.getRow(currentRow);
    expenseHeaderRow.height = 25;
    expenseHeaderRow.getCell(1).value = 'EXPENSES BY CATEGORY';
    expenseHeaderRow.getCell(2).value = 'Amount (£)';
    expenseHeaderRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: white } };
    expenseHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkGreen } };
    expenseHeaderRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    currentRow += 2;
    
    // Process expense categories
    const categories = ['Home', 'Insurance', 'Transport', 'Loan Repayments', 'Food & Drink', 'Family', 'Entertainment', 'Health', 'Clothes', 'Education', 'Other'];
    let totalExpenses = 0;
    
    categories.forEach(category => {
        const categoryExpenses = [];
        let categoryTotal = 0;
        
        Object.entries(data.expenses).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input && input.getAttribute('data-category') === category && value > 0) {
                const label = input.closest('.budget-input-group').querySelector('label').textContent.trim();
                categoryExpenses.push([label, value]);
                categoryTotal += value;
            }
        });
        
        if (categoryTotal > 0) {
            // Category header
            const catRow = worksheet.getRow(currentRow);
            catRow.height = 20;
            catRow.getCell(1).value = category;
            catRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: primaryGreen } };
            catRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGreen } };
            catRow.eachCell(cell => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });
            currentRow++;
            
            // Category items
            categoryExpenses.forEach(([label, value]) => {
                const row = worksheet.getRow(currentRow);
                row.getCell(1).value = '  ' + label;
                row.getCell(2).value = value;
                row.getCell(2).numFmt = '£#,##0.00';
                row.getCell(1).font = { name: 'Calibri', size: 10 };
                row.getCell(2).font = { name: 'Calibri', size: 10 };
                row.eachCell(cell => {
                    cell.border = { left: { style: 'thin' }, right: { style: 'thin' } };
                });
                currentRow++;
            });
            
            // Subtotal
            const subtotalRow = worksheet.getRow(currentRow);
            subtotalRow.getCell(1).value = 'Subtotal';
            subtotalRow.getCell(2).value = categoryTotal;
            subtotalRow.getCell(2).numFmt = '£#,##0.00';
            subtotalRow.font = { name: 'Calibri', size: 10, bold: true };
            subtotalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGreen } };
            subtotalRow.eachCell(cell => {
                cell.border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });
            currentRow += 2;
            
            totalExpenses += categoryTotal;
        }
    });
    
    // Total Expenses
    const totalExpenseRow = worksheet.getRow(currentRow);
    totalExpenseRow.height = 22;
    totalExpenseRow.getCell(1).value = 'TOTAL EXPENSES';
    totalExpenseRow.getCell(2).value = totalExpenses;
    totalExpenseRow.getCell(2).numFmt = '£#,##0.00';
    totalExpenseRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: white } };
    totalExpenseRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: orange } };
    totalExpenseRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    currentRow += 3;
    
    // ========== SUMMARY SECTION ==========
    const summaryHeaderRow = worksheet.getRow(currentRow);
    summaryHeaderRow.height = 25;
    summaryHeaderRow.getCell(1).value = 'SUMMARY';
    summaryHeaderRow.getCell(2).value = 'Amount (£)';
    summaryHeaderRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: white } };
    summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkGreen } };
    summaryHeaderRow.eachCell(cell => {
        cell.border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };
    });
    currentRow++;
    
    // Summary items
    const summaryItems = [
        ['Total Income', totalIncome, primaryGreen],
        ['Total Expenses', totalExpenses, orange]
    ];
    
    summaryItems.forEach(([label, value, color]) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = label;
        row.getCell(2).value = value;
        row.getCell(2).numFmt = '£#,##0.00';
        row.font = { name: 'Calibri', size: 11, bold: true };
        row.eachCell(cell => {
            cell.border = { left: { style: 'medium' }, right: { style: 'medium' } };
        });
        currentRow++;
    });
    
    // Remaining
    const remaining = totalIncome - totalExpenses;
    const remainingRow = worksheet.getRow(currentRow);
    remainingRow.height = 25;
    remainingRow.getCell(1).value = 'Remaining';
    remainingRow.getCell(2).value = remaining;
    remainingRow.getCell(2).numFmt = '£#,##0.00';
    remainingRow.font = { name: 'Calibri', size: 13, bold: true, color: { argb: white } };
    remainingRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: remaining >= 0 ? primaryGreen : red } };
    remainingRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } };
    });
    currentRow += 2;
    
    // Status message
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const statusRow = worksheet.getRow(currentRow);
    statusRow.height = 22;
    statusRow.getCell(1).value = remaining >= 0 ? '✓ You have money left over!' : '⚠ You are overspending!';
    statusRow.getCell(1).font = { name: 'Calibri', size: 12, bold: true, color: { argb: remaining >= 0 ? primaryGreen : red } };
    statusRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    statusRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: remaining >= 0 ? lightGreen : 'FFEBEE' } };
    statusRow.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'QuidWise_Budget_' + new Date().toISOString().split('T')[0] + '.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
}

