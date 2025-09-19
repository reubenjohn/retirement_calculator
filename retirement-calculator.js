// Universal Retirement Calculator Module
// Works in both Node.js and browser environments

(function (global) {
    'use strict';

    // Load configuration from global object (set by config.js in browser)
    let config = {};
    if (typeof window !== 'undefined' && window.RetirementConfig) {
        config = window.RetirementConfig;
    }

    // Use scenarios from loaded config
    const scenarios = config.scenarios || {};

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

    function executeWithdrawalStrategy(targetAmount, accounts) {
        const withdrawals = { taxable: 0, traditional: 0, roth: 0, hsa: 0, cash: 0 };
        let remaining = targetAmount;

        // TODO: Add RMD calculations for Traditional accounts starting at age 73
        // TODO: Implement tax bracket management for withdrawal optimization
        // TODO: Add low-tax years detection and Roth conversion opportunities

        // Strategy: Taxable → Traditional → Roth
        // 1. Taxable accounts first (including cash, capital gains rates)
        remaining -= withdrawFromAccount('taxable', remaining, accounts, withdrawals);
        remaining -= withdrawFromAccount('cash', remaining, accounts, withdrawals);

        // 2. Traditional accounts (ordinary income rates)
        remaining -= withdrawFromAccount('traditional', remaining, accounts, withdrawals);

        // 3. Roth accounts last (tax-free, preserve growth)
        remaining -= withdrawFromAccount('roth', remaining, accounts, withdrawals);
        remaining -= withdrawFromAccount('hsa', remaining, accounts, withdrawals);

        return { withdrawals, totalWithdrawn: targetAmount - remaining };
    }

    function withdrawFromAccount(accountType, amount, accounts, withdrawals) {
        const available = accounts[accountType].balance;
        const toWithdraw = Math.min(amount, available);

        if (toWithdraw > 0) {
            accounts[accountType].balance -= toWithdraw;
            withdrawals[accountType] = toWithdraw;
        }

        return toWithdraw;
    }

    function growAccounts(accounts, investmentReturn, isWorking) {
        Object.entries(accounts).forEach(([type, account]) => {
            // Apply different growth rates based on tax treatment
            let effectiveReturn = investmentReturn;

            // Apply tax drag to taxable accounts
            if (account.taxTreatment === 'taxable') {
                effectiveReturn *= 0.85; // 15% tax drag
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
            indexWithdrawals
        } = params;

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
            let withdrawalResult = { withdrawals: {}, totalWithdrawn: 0 };
            if (!isWorking) {
                const targetWithdrawal = indexWithdrawals ? baseWithdrawal * priceIndex : baseWithdrawal;
                withdrawalResult = executeWithdrawalStrategy(targetWithdrawal, accounts);
            }

            // Apply investment growth and contributions
            growAccounts(accounts, investmentReturn, isWorking);

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