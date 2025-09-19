// Retirement Planning Simulator JavaScript

// Use scenarios from the shared module
const scenarios = RetirementCalculator.scenarios;

// Initialize scenario buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function () {
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
        'taxDragRate', 'capitalGainsRate', 'ordinaryIncomeRate', 'taxableGainsRatio',
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

        // Individual account balances
        taxableBalance: document.getElementById('taxableBalance').value,
        traditional401k: document.getElementById('traditional401k').value,
        rothBalance: document.getElementById('rothBalance').value,
        hsaBalance: document.getElementById('hsaBalance').value,
        cashBalance: document.getElementById('cashBalance').value,

        // Individual contributions
        taxableContrib: document.getElementById('taxableContrib').value,
        employee401k: document.getElementById('employee401k').value,
        employer401k: document.getElementById('employer401k').value,
        rothContrib: document.getElementById('rothContrib').value,
        hsaEmployee: document.getElementById('hsaEmployee').value,
        hsaEmployer: document.getElementById('hsaEmployer').value,

        investmentReturn: parseFloat(document.getElementById('investmentReturn').value) / 100,
        inflation: parseFloat(document.getElementById('inflation').value) / 100,

        // Tax settings
        taxDragRate: parseFloat(document.getElementById('taxDragRate').value) / 100,
        capitalGainsRate: parseFloat(document.getElementById('capitalGainsRate').value) / 100,
        ordinaryIncomeRate: parseFloat(document.getElementById('ordinaryIncomeRate').value) / 100,
        taxableGainsRatio: parseFloat(document.getElementById('taxableGainsRatio').value) / 100,

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
        yearsSustainable = lifeExpectancy;
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

    // Get retirement age and life expectancy for vertical lines
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value);

    // Find the year corresponding to retirement age and life expectancy
    const retirementProjection = projections.find(p => p.age === retirementAge);
    const lifeExpectancyProjection = projections.find(p => p.age === lifeExpectancy);

    // Vertical lines plugin
    const verticalLinePlugin = {
        id: 'verticalLines',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const scales = chart.scales;

            // Draw retirement age line
            if (retirementProjection) {
                // Find the index of this projection in the years array
                const retirementIndex = years.indexOf(retirementProjection.year);
                const retirementX = scales.x.getPixelForValue(retirementIndex);

                ctx.save();
                ctx.strokeStyle = 'rgba(255, 102, 0, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 4]);
                ctx.beginPath();
                ctx.moveTo(retirementX, chartArea.top);
                ctx.lineTo(retirementX, chartArea.bottom);
                ctx.stroke();

                // Add subtle label at top
                ctx.fillStyle = 'rgba(255, 102, 0, 0.9)';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Retirement', retirementX, chartArea.top + 20);
                ctx.restore();
            }

            // Draw life expectancy line
            if (lifeExpectancyProjection) {
                // Find the index of this projection in the years array
                const lifeExpectancyIndex = years.indexOf(lifeExpectancyProjection.year);
                const lifeExpectancyX = scales.x.getPixelForValue(lifeExpectancyIndex);

                ctx.save();
                ctx.strokeStyle = 'rgba(204, 0, 0, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 4]);
                ctx.beginPath();
                ctx.moveTo(lifeExpectancyX, chartArea.top);
                ctx.lineTo(lifeExpectancyX, chartArea.bottom);
                ctx.stroke();

                // Add subtle label at top
                ctx.fillStyle = 'rgba(204, 0, 0, 0.9)';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Life Expectancy', lifeExpectancyX, chartArea.top + 20);
                ctx.restore();
            }
        }
    };

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
                        callback: function (value) {
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
                        label: function (context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        },
        plugins: [verticalLinePlugin]
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

        // Get account withdrawals and balances
        const withdrawals = projection.withdrawals || { taxable: 0, cash: 0, traditional: 0, roth: 0, hsa: 0 };
        const accounts = projection.accounts || {
            taxable: { balance: 0 },
            cash: { balance: 0 },
            traditional: { balance: 0 },
            roth: { balance: 0 },
            hsa: { balance: 0 }
        };

        row.innerHTML = `
            <td>${projection.year}</td>
            <td>${projection.age}</td>
            <td class="${statusClass}">${status}</td>
            <td>${projection.salary > 0 ? formatCurrency(projection.salary) : '-'}</td>
            <td>${projection.contributions > 0 ? formatCurrency(projection.contributions) : '-'}</td>

            <!-- Total Balance and Real Value First -->
            <td>${formatCurrency(projection.endBalance)}</td>
            <td>${formatCurrency(projection.endBalanceReal)}</td>

            <!-- Account Balances -->
            <td>${formatCurrency(accounts.taxable.balance)}</td>
            <td>${formatCurrency(accounts.cash.balance)}</td>
            <td>${formatCurrency(accounts.traditional.balance)}</td>
            <td>${formatCurrency(accounts.roth.balance)}</td>
            <td>${formatCurrency(accounts.hsa.balance)}</td>

            <!-- Total Withdrawal and Taxes -->
            <td>${projection.withdrawal > 0 ? formatCurrency(projection.withdrawal) : '-'}</td>
            <td>${projection.totalTaxes > 0 ? formatCurrency(projection.totalTaxes) : '-'}</td>
            <td>${projection.netWithdrawn > 0 ? formatCurrency(projection.netWithdrawn) : '-'}</td>

            <!-- Account Withdrawals -->
            <td>${withdrawals.taxable > 0 ? formatCurrency(withdrawals.taxable) : '-'}</td>
            <td>${withdrawals.cash > 0 ? formatCurrency(withdrawals.cash) : '-'}</td>
            <td>${withdrawals.traditional > 0 ? formatCurrency(withdrawals.traditional) : '-'}</td>
            <td>${withdrawals.roth > 0 ? formatCurrency(withdrawals.roth) : '-'}</td>
            <td>${withdrawals.hsa > 0 ? formatCurrency(withdrawals.hsa) : '-'}</td>
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

// Function to populate form with defaults
function populateDefaults(defaults) {
    Object.keys(defaults).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = defaults[key];
        }
    });
}

// Initialize with default calculation and setup auto-recalculation
document.addEventListener('DOMContentLoaded', function () {
    // Get defaults from the calculator module
    const defaults = RetirementCalculator.getDefaults();
    if (defaults && Object.keys(defaults).length > 0) {
        populateDefaults(defaults);
    }

    // Apply configured default scenario
    const config = (typeof window !== 'undefined' && window.RetirementConfig) ? window.RetirementConfig : {};
    const defaultScenarioName = config.defaultScenario || "moderate";
    const defaultScenario = scenarios[defaultScenarioName];

    if (defaultScenario) {
        // Apply scenario values
        document.getElementById('investmentReturn').value = defaultScenario.return;
        document.getElementById('inflation').value = defaultScenario.inflation;

        // Set the corresponding button as active
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.scenario === defaultScenarioName) {
                btn.classList.add('active');
            }
        });
    }

    // Apply tax settings from config
    if (config.taxSettings) {
        const taxSettings = config.taxSettings;
        document.getElementById('taxDragRate').value = (taxSettings.taxDragRate * 100).toFixed(1);
        document.getElementById('capitalGainsRate').value = (taxSettings.capitalGainsRate * 100).toFixed(1);
        document.getElementById('ordinaryIncomeRate').value = (taxSettings.ordinaryIncomeRate * 100).toFixed(1);
        document.getElementById('taxableGainsRatio').value = (taxSettings.taxableGainsRatio * 100).toFixed(0);
    }

    setupAutoRecalculation();
    calculateRetirement();
});

// Panel collapse functionality
function togglePanel(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.panel-toggle');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '−';
    } else {
        content.style.display = 'none';
        toggle.textContent = '+';
    }
}