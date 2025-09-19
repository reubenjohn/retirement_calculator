// Retirement Planning Simulator JavaScript

// Use scenarios from the shared module
const scenarios = RetirementCalculator.scenarios;

// Initialize scenario buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const scenario = scenarios[this.dataset.scenario];
        document.getElementById('investmentReturn').value = scenario.return;
        document.getElementById('inflation').value = scenario.inflation;

        calculateRetirement();
    });
});

// Add automatic recalculation for all input fields
function setupAutoRecalculation() {
    const inputFields = [
        'currentAge', 'retirementAge', 'lifeExpectancy',
        'baseSalary', 'bonus', 'salaryGrowth',
        'taxableBalance', 'traditional401k', 'rothBalance', 'hsaBalance', 'cashBalance',
        'taxableContrib', 'employee401k', 'employer401k', 'rothContrib', 'hsaEmployee', 'hsaEmployer',
        'investmentReturn', 'inflation',
        'baseWithdrawal', 'indexWithdrawals'
    ];

    inputFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', calculateRetirement);
            element.addEventListener('change', calculateRetirement);
        }
    });
}

// Main calculation function - now uses shared module
function calculateRetirement() {
    // Get all input values
    const params = {
        currentAge: parseInt(document.getElementById('currentAge').value),
        retirementAge: parseInt(document.getElementById('retirementAge').value),
        lifeExpectancy: parseInt(document.getElementById('lifeExpectancy').value),
        baseSalary: parseFloat(document.getElementById('baseSalary').value),
        bonus: parseFloat(document.getElementById('bonus').value),
        salaryGrowth: parseFloat(document.getElementById('salaryGrowth').value) / 100,
        startingBalance:
            parseFloat(document.getElementById('taxableBalance').value) +
            parseFloat(document.getElementById('traditional401k').value) +
            parseFloat(document.getElementById('rothBalance').value) +
            parseFloat(document.getElementById('hsaBalance').value) +
            parseFloat(document.getElementById('cashBalance').value),
        annualContributions:
            parseFloat(document.getElementById('taxableContrib').value) +
            parseFloat(document.getElementById('employee401k').value) +
            parseFloat(document.getElementById('employer401k').value) +
            parseFloat(document.getElementById('rothContrib').value) +
            parseFloat(document.getElementById('hsaEmployee').value) +
            parseFloat(document.getElementById('hsaEmployer').value),
        investmentReturn: parseFloat(document.getElementById('investmentReturn').value) / 100,
        inflation: parseFloat(document.getElementById('inflation').value) / 100,
        baseWithdrawal: parseFloat(document.getElementById('baseWithdrawal').value),
        indexWithdrawals: document.getElementById('indexWithdrawals').value === 'yes'
    };

    // Use shared calculation function
    const result = RetirementCalculator.calculateRetirement(params);

    // Display results
    displayResults(result.projections, params.retirementAge, params.lifeExpectancy, result.depletionYear);
}

function displayResults(projections, retirementAge, lifeExpectancy, depletionYear) {
    // Find retirement balance
    const retirementProjection = projections.find(p => p.age === retirementAge);
    const retirementBalance = retirementProjection ? retirementProjection.endBalance : 0;

    // Find end balance at life expectancy
    const lifeExpectancyProjection = projections.find(p => p.age === lifeExpectancy);
    const endBalance = lifeExpectancyProjection ? lifeExpectancyProjection.endBalance : 0;

    // Calculate years sustainable
    let yearsSustainable = 0;
    if (depletionYear) {
        const depletionProjection = projections.find(p => p.year === depletionYear);
        yearsSustainable = depletionProjection ? depletionProjection.age - retirementAge : 0;
    } else {
        yearsSustainable = lifeExpectancy - retirementAge + 1;
    }

    // Update summary cards
    document.getElementById('retirementBalance').textContent = formatCurrency(retirementBalance);
    document.getElementById('yearsSustainable').textContent = yearsSustainable + ' years';
    document.getElementById('endBalance').textContent = formatCurrency(endBalance);
    document.getElementById('depletionYear').textContent = depletionYear || 'Never';

    // Show results
    document.getElementById('results').classList.remove('hidden');

    // Create chart
    createChart(projections);

    // Create projection table
    createProjectionTable(projections);
}

function createChart(projections) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.portfolioChart && typeof window.portfolioChart.destroy === 'function') {
        window.portfolioChart.destroy();
    }

    const years = projections.map(p => p.year);
    const balances = projections.map(p => p.endBalance);
    const realBalances = projections.map(p => p.endBalanceReal);

    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Portfolio Balance (Nominal)',
                data: balances,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.1
            }, {
                label: 'Portfolio Balance (Real)',
                data: realBalances,
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolio Balance Over Time'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createProjectionTable(projections) {
    const tableBody = document.querySelector('#projectionTable tbody');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Populate table with projection data
    projections.forEach(projection => {
        const row = document.createElement('tr');

        // Determine status and apply appropriate class
        let status, statusClass;
        if (projection.depleted) {
            status = 'Depleted';
            statusClass = 'status-depleted';
        } else if (projection.isWorking) {
            status = 'Working';
            statusClass = 'status-working';
        } else {
            status = 'Retired';
            statusClass = 'status-retired';
        }

        // Calculate investment gain for display
        const investmentGain = projection.startBalance * projection.investmentReturn;

        row.innerHTML = `
            <td>${projection.year}</td>
            <td>${projection.age}</td>
            <td class="${statusClass}">${status}</td>
            <td>${projection.salary > 0 ? formatCurrency(projection.salary) : '-'}</td>
            <td>${projection.contributions > 0 ? formatCurrency(projection.contributions) : '-'}</td>
            <td>${projection.withdrawal > 0 ? formatCurrency(projection.withdrawal) : '-'}</td>
            <td>${formatCurrency(investmentGain)}</td>
            <td>${formatCurrency(projection.endBalance)}</td>
            <td>${formatCurrency(projection.endBalanceReal)}</td>
        `;

        tableBody.appendChild(row);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize with default calculation and setup auto-recalculation
document.addEventListener('DOMContentLoaded', function() {
    setupAutoRecalculation();
    calculateRetirement();
});