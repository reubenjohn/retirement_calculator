// Universal Retirement Calculator Module
// Works in both Node.js and browser environments

(function (global) {
    'use strict';

    // Load configuration from global object (set by config.js in browser)
    let config = {};
    if (typeof window !== 'undefined' && window.RetirementConfig) {
        config = window.RetirementConfig;
    }

    // Use scenarios and tax settings from loaded config
    const scenarios = config.scenarios || {};
    const taxSettings = config.taxSettings || {
        taxDragRate: 0.15,
        capitalGainsRate: 0.15,
        ordinaryIncomeRate: 0.22,
        taxableGainsRatio: 0.7
    };

    // Account management functions
    function initializeAccounts(params) {
        return {
            taxable: {
                balance: parseFloat(params.taxableBalance || 0),
                contributions: parseFloat(params.taxableContrib || 0),
                taxTreatment: 'taxable'
            },
            traditional: {
                balance: parseFloat(params.traditional401k || 0),
                contributions: parseFloat(params.employee401k || 0) + parseFloat(params.employer401k || 0),
                taxTreatment: 'deferred'
            },
            roth: {
                balance: parseFloat(params.rothBalance || 0),
                contributions: parseFloat(params.rothContrib || 0),
                taxTreatment: 'free'
            },
            hsa: {
                balance: parseFloat(params.hsaBalance || 0),
                contributions: parseFloat(params.hsaEmployee || 0) + parseFloat(params.hsaEmployer || 0),
                taxTreatment: 'free'
            },
            cash: {
                balance: parseFloat(params.cashBalance || 0),
                contributions: 0,
                taxTreatment: 'taxable'
            }
        };
    }

    function getTotalBalance(accounts) {
        return Object.values(accounts).reduce((sum, account) => sum + account.balance, 0);
    }

    function getTotalContributions(accounts) {
        return Object.values(accounts).reduce((sum, account) => sum + account.contributions, 0);
    }

    function executeWithdrawalStrategy(targetAmount, accounts, taxSettings) {
        const withdrawals = { taxable: 0, traditional: 0, roth: 0, hsa: 0, cash: 0 };
        const taxes = { taxable: 0, traditional: 0, roth: 0, hsa: 0, cash: 0 };
        let remaining = targetAmount;

        // TODO: Add RMD calculations for Traditional accounts starting at age 73
        // TODO: Implement tax bracket management for withdrawal optimization
        // TODO: Add low-tax years detection and Roth conversion opportunities

        // Strategy: Taxable → Traditional → Roth
        // 1. Taxable accounts first (including cash, capital gains rates)
        remaining -= withdrawFromAccount('taxable', remaining, accounts, withdrawals, taxSettings);
        remaining -= withdrawFromAccount('cash', remaining, accounts, withdrawals, taxSettings);

        // 2. Traditional accounts (ordinary income rates)
        remaining -= withdrawFromAccount('traditional', remaining, accounts, withdrawals, taxSettings);

        // 3. Roth accounts last (tax-free, preserve growth)
        remaining -= withdrawFromAccount('roth', remaining, accounts, withdrawals, taxSettings);
        remaining -= withdrawFromAccount('hsa', remaining, accounts, withdrawals, taxSettings);

        // Calculate taxes owed on withdrawals
        Object.keys(withdrawals).forEach(accountType => {
            if (withdrawals[accountType] > 0) {
                taxes[accountType] = calculateTaxOnWithdrawal(accountType, withdrawals[accountType], taxSettings);
            }
        });

        const totalTaxes = Object.values(taxes).reduce((sum, tax) => sum + tax, 0);

        return {
            withdrawals,
            taxes,
            totalWithdrawn: targetAmount - remaining,
            totalTaxes,
            netWithdrawn: (targetAmount - remaining) - totalTaxes
        };
    }

    function withdrawFromAccount(accountType, amount, accounts, withdrawals, taxSettings) {
        const available = accounts[accountType].balance;
        const toWithdraw = Math.min(amount, available);

        if (toWithdraw > 0) {
            accounts[accountType].balance -= toWithdraw;
            withdrawals[accountType] = toWithdraw;
        }

        return toWithdraw;
    }

    function calculateTaxOnWithdrawal(accountType, withdrawalAmount, taxSettings) {
        let taxOwed = 0;

        if (accountType === 'taxable' || accountType === 'cash') {
            // Capital gains tax on the gains portion only
            const gainsAmount = withdrawalAmount * taxSettings.taxableGainsRatio;
            taxOwed = gainsAmount * taxSettings.capitalGainsRate;
        } else if (accountType === 'traditional') {
            // Ordinary income tax on full withdrawal amount
            taxOwed = withdrawalAmount * taxSettings.ordinaryIncomeRate;
        }
        // Roth and HSA withdrawals are tax-free (taxOwed remains 0)

        return taxOwed;
    }

    function growAccounts(accounts, investmentReturn, isWorking, taxSettings) {
        Object.values(accounts).forEach((account) => {
            // Apply different growth rates based on tax treatment
            let effectiveReturn = investmentReturn;

            // Apply tax drag to taxable accounts
            if (account.taxTreatment === 'taxable') {
                effectiveReturn *= (1 - taxSettings.taxDragRate);
            }

            // Growth
            account.balance *= (1 + effectiveReturn);

            // Add contributions during working years
            if (isWorking) {
                account.balance += account.contributions;
            }
        });
    }

    // Main calculation function
    function calculateRetirement(params) {
        const {
            currentAge,
            retirementAge,
            lifeExpectancy,
            baseSalary,
            bonus,
            salaryGrowth,
            investmentReturn,
            inflation,
            baseWithdrawal,
            indexWithdrawals,
            taxDragRate,
            capitalGainsRate,
            ordinaryIncomeRate,
            taxableGainsRatio
        } = params;

        // Use tax settings from params or fall back to config defaults
        const effectiveTaxSettings = {
            taxDragRate: taxDragRate !== undefined ? taxDragRate : taxSettings.taxDragRate,
            capitalGainsRate: capitalGainsRate !== undefined ? capitalGainsRate : taxSettings.capitalGainsRate,
            ordinaryIncomeRate: ordinaryIncomeRate !== undefined ? ordinaryIncomeRate : taxSettings.ordinaryIncomeRate,
            taxableGainsRatio: taxableGainsRatio !== undefined ? taxableGainsRatio : taxSettings.taxableGainsRatio
        };

        const projections = [];
        const currentYear = new Date().getFullYear();
        const accounts = initializeAccounts(params);
        let priceIndex = 1.0;
        let depletionYear = null;

        for (let yearOffset = 0; yearOffset < 75; yearOffset++) {
            const year = currentYear + yearOffset;
            const age = currentAge + yearOffset;
            const isWorking = age < retirementAge;

            // Calculate income
            const salary = isWorking ? baseSalary * Math.pow(1 + salaryGrowth, yearOffset) : 0;
            const yearlyBonus = isWorking ? bonus : 0;
            const totalIncome = salary + yearlyBonus;

            // Update price index
            priceIndex *= (1 + inflation);

            // Get starting balances for this year
            const startBalance = getTotalBalance(accounts);

            // Calculate withdrawal using new strategy
            let withdrawalResult = { withdrawals: {}, totalWithdrawn: 0, totalTaxes: 0, netWithdrawn: 0 };
            if (!isWorking) {
                const targetWithdrawal = indexWithdrawals ? baseWithdrawal * priceIndex : baseWithdrawal;
                withdrawalResult = executeWithdrawalStrategy(targetWithdrawal, accounts, effectiveTaxSettings);
            }

            // Apply investment growth and contributions
            growAccounts(accounts, investmentReturn, isWorking, effectiveTaxSettings);

            // Get ending balances
            const endBalance = getTotalBalance(accounts);

            // Check for depletion
            if (endBalance <= 0 && !depletionYear) {
                depletionYear = year;
            }

            // Create projection with account details
            const projection = {
                year,
                age,
                isWorking,
                salary,
                bonus: yearlyBonus,
                totalIncome,
                contributions: getTotalContributions(accounts),
                priceIndex,
                withdrawal: withdrawalResult.totalWithdrawn,
                withdrawals: withdrawalResult.withdrawals,
                taxes: withdrawalResult.taxes || {},
                totalTaxes: withdrawalResult.totalTaxes || 0,
                netWithdrawn: withdrawalResult.netWithdrawn || 0,
                investmentReturn: investmentReturn,
                startBalance,
                endBalance,
                endBalanceReal: endBalance / priceIndex,
                depleted: endBalance <= 0,
                accounts: JSON.parse(JSON.stringify(accounts)) // Deep copy for history
            };

            projections.push(projection);

            // Stop if depleted and past retirement
            if (endBalance <= 0 && !isWorking) break;
        }

        return { projections, depletionYear };
    }

    // Simple function to get current configuration defaults
    function getDefaults() {
        return config.defaults || {};
    }

    // Export for different environments
    const RetirementCalculator = {
        calculateRetirement,
        scenarios,
        getDefaults
    };

    // Node.js environment
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RetirementCalculator;
    }
    // Browser environment
    else if (typeof global !== 'undefined') {
        global.RetirementCalculator = RetirementCalculator;
    }
    // Fallback for browser window
    else if (typeof window !== 'undefined') {
        window.RetirementCalculator = RetirementCalculator;
    }

})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);