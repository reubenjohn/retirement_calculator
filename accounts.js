// Account Management Module
// Handles account data structures, withdrawal strategies, and tax calculations

(function (global) {
    'use strict';

    // Account initialization and management functions
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

    function getTotalContributions(accounts, contributionGrowthMultiplier = 1) {
        return Object.values(accounts).reduce((sum, account) => sum + (account.contributions * contributionGrowthMultiplier), 0);
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

    function withdrawFromAccount(accountType, amount, accounts, withdrawals) {
        const available = accounts[accountType].balance;
        const toWithdraw = Math.min(amount, available);

        if (toWithdraw > 0) {
            accounts[accountType].balance -= toWithdraw;
            withdrawals[accountType] = toWithdraw;
        }

        return toWithdraw;
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
        remaining -= withdrawFromAccount('taxable', remaining, accounts, withdrawals);
        remaining -= withdrawFromAccount('cash', remaining, accounts, withdrawals);

        // 2. Traditional accounts (ordinary income rates)
        remaining -= withdrawFromAccount('traditional', remaining, accounts, withdrawals);

        // 3. Roth accounts last (tax-free, preserve growth)
        remaining -= withdrawFromAccount('roth', remaining, accounts, withdrawals);
        remaining -= withdrawFromAccount('hsa', remaining, accounts, withdrawals);

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

    function growAccounts(accounts, investmentReturn, isWorking, taxSettings, contributionGrowthMultiplier = 1) {
        Object.values(accounts).forEach((account) => {
            // Apply different growth rates based on tax treatment
            let effectiveReturn = investmentReturn;

            // Apply tax drag to taxable accounts
            if (account.taxTreatment === 'taxable') {
                effectiveReturn *= (1 - taxSettings.taxDragRate);
            }

            // Growth
            account.balance *= (1 + effectiveReturn);

            // Add contributions during working years with growth applied
            if (isWorking) {
                account.balance += account.contributions * contributionGrowthMultiplier;
            }
        });
    }

    // Export for different environments
    const AccountManager = {
        initializeAccounts,
        getTotalBalance,
        getTotalContributions,
        calculateTaxOnWithdrawal,
        withdrawFromAccount,
        executeWithdrawalStrategy,
        growAccounts
    };

    // Node.js environment
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AccountManager;
    }
    // Browser environment
    else if (typeof global !== 'undefined') {
        global.AccountManager = AccountManager;
    }
    // Fallback for browser window
    else if (typeof window !== 'undefined') {
        window.AccountManager = AccountManager;
    }

})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);