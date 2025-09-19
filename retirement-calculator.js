// Universal Retirement Calculator Module
// Works in both Node.js and browser environments

(function (global) {
    'use strict';

    // Load configuration
    let config = {};

    // Try to load config in Node.js environment synchronously
    if (typeof module !== 'undefined' && module.exports) {
        try {
            const fs = require('fs');
            const path = require('path');
            const configPath = path.join(__dirname, 'config.json');
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
        } catch (err) {
            console.warn('Could not load config.json, using defaults');
        }
    }
    // In browser environment, check for global config object
    else if (typeof window !== 'undefined' && window.RetirementConfig) {
        config = window.RetirementConfig;
    }

    // Default scenarios and configuration
    const defaultScenarios = {
        conservative: { return: 4.0, inflation: 2.0 },
        moderate: { return: 6.0, inflation: 2.5 },
        aggressive: { return: 8.0, inflation: 3.0 },
        custom: { return: 5.5, inflation: 2.3 }
    };

    // Use loaded config or fallback to defaults
    const scenarios = config.scenarios || defaultScenarios;

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