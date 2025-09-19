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

    // Import account management functions
    let AccountManager;
    if (typeof require !== 'undefined') {
        // Node.js environment
        AccountManager = require('./accounts.js');
    } else if (typeof window !== 'undefined' && window.AccountManager) {
        // Browser environment
        AccountManager = window.AccountManager;
    } else {
        throw new Error('AccountManager module not available');
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
            taxableGainsRatio,
            contributionGrowth
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
        const accounts = AccountManager.initializeAccounts(params);
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
            const startBalance = AccountManager.getTotalBalance(accounts);

            // Calculate withdrawal using new strategy
            let withdrawalResult = { withdrawals: {}, totalWithdrawn: 0, totalTaxes: 0, netWithdrawn: 0 };
            if (!isWorking) {
                const targetWithdrawal = indexWithdrawals ? baseWithdrawal * priceIndex : baseWithdrawal;
                withdrawalResult = AccountManager.executeWithdrawalStrategy(targetWithdrawal, accounts, effectiveTaxSettings);
            }

            // Apply investment growth and contributions with growth
            const contributionGrowthMultiplier = Math.pow(1 + (contributionGrowth || 0), yearOffset);
            AccountManager.growAccounts(accounts, investmentReturn, isWorking, effectiveTaxSettings, contributionGrowthMultiplier);

            // Get ending balances
            const endBalance = AccountManager.getTotalBalance(accounts);

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
                contributions: isWorking ? AccountManager.getTotalContributions(accounts, contributionGrowthMultiplier) : 0,
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