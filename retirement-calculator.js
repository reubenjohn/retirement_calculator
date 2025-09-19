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

    // Main calculation function
    function calculateRetirement(params) {
        const {
            currentAge,
            retirementAge,
            lifeExpectancy,
            baseSalary,
            bonus,
            salaryGrowth,
            startingBalance,
            annualContributions,
            investmentReturn,
            inflation,
            baseWithdrawal,
            indexWithdrawals
        } = params;

        const projections = [];
        const currentYear = new Date().getFullYear();
        let balance = startingBalance;
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

            // Calculate contributions
            const contributions = isWorking ? annualContributions : 0;

            // Update price index
            priceIndex *= (1 + inflation);

            // Calculate withdrawal
            let withdrawal = 0;
            if (!isWorking) {
                withdrawal = indexWithdrawals ? baseWithdrawal * priceIndex : baseWithdrawal;
            }

            // Calculate investment returns
            const investmentGain = balance * investmentReturn;

            // Update balance
            const endBalance = Math.max(0, balance + contributions - withdrawal + investmentGain);

            // Check for depletion
            if (endBalance <= 0 && !depletionYear) {
                depletionYear = year;
            }

            projections.push({
                year,
                age,
                isWorking,
                salary,
                bonus: yearlyBonus,
                totalIncome,
                contributions,
                priceIndex,
                withdrawal,
                investmentReturn: investmentReturn,
                startBalance: balance,
                endBalance,
                endBalanceReal: endBalance / priceIndex,
                depleted: endBalance <= 0
            });

            balance = endBalance;

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