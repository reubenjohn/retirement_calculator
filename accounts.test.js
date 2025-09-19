// Test account management functionality
const AccountManager = require('./accounts.js');

const testParams = {
    taxableBalance: 100000,
    traditional401k: 200000,
    rothBalance: 50000,
    hsaBalance: 25000,
    cashBalance: 30000,
    taxableContrib: 10000,
    employee401k: 15000,
    employer401k: 5000,
    rothContrib: 6000,
    hsaEmployee: 3000,
    hsaEmployer: 1000
};

const taxSettings = {
    taxDragRate: 0.15,
    capitalGainsRate: 0.15,
    ordinaryIncomeRate: 0.22,
    taxableGainsRatio: 0.70
};

describe('Account Manager', () => {
    test('initializes accounts correctly', () => {
        const accounts = AccountManager.initializeAccounts(testParams);

        expect(accounts).toBeDefined();
        expect(accounts.taxable.balance).toBe(100000);
        expect(accounts.traditional.balance).toBe(200000);
        expect(accounts.roth.balance).toBe(50000);
        expect(accounts.hsa.balance).toBe(25000);
        expect(accounts.cash.balance).toBe(30000);

        const totalBalance = AccountManager.getTotalBalance(accounts);
        const totalContributions = AccountManager.getTotalContributions(accounts);

        expect(totalBalance).toBe(405000);
        expect(totalContributions).toBe(40000);
    });

    test('calculates taxes on withdrawals correctly', () => {
        const taxableTax = AccountManager.calculateTaxOnWithdrawal('taxable', 10000, taxSettings);
        const traditionalTax = AccountManager.calculateTaxOnWithdrawal('traditional', 10000, taxSettings);
        const rothTax = AccountManager.calculateTaxOnWithdrawal('roth', 10000, taxSettings);
        const hsaTax = AccountManager.calculateTaxOnWithdrawal('hsa', 10000, taxSettings);
        const cashTax = AccountManager.calculateTaxOnWithdrawal('cash', 10000, taxSettings);

        expect(taxableTax).toBe(1050); // 70% gains * 15% capital gains rate
        expect(traditionalTax).toBe(2200); // 100% * 22% ordinary income rate
        expect(rothTax).toBe(0); // Tax-free
        expect(hsaTax).toBe(0); // Tax-free
        expect(cashTax).toBe(1050); // Same as taxable
    });

    test('executes withdrawal strategy correctly', () => {
        const testAccounts = AccountManager.initializeAccounts({
            taxableBalance: 50000,
            traditional401k: 100000,
            rothBalance: 75000,
            hsaBalance: 25000,
            cashBalance: 25000
        });

        const withdrawalResult = AccountManager.executeWithdrawalStrategy(60000, testAccounts, taxSettings);

        expect(withdrawalResult.totalWithdrawn).toBe(60000);
        expect(withdrawalResult.totalTaxes).toBeGreaterThan(0);
        expect(withdrawalResult.netWithdrawn).toBeLessThan(60000);
        expect(withdrawalResult.withdrawals.taxable).toBeDefined();
        expect(withdrawalResult.withdrawals.traditional).toBeDefined();
    });

    test('grows accounts with tax drag correctly', () => {
        const growthAccounts = AccountManager.initializeAccounts({
            taxableBalance: 100000,
            traditional401k: 100000,
            rothBalance: 100000,
            taxableContrib: 10000,
            employee401k: 10000,
            rothContrib: 10000
        });

        const initialBalance = AccountManager.getTotalBalance(growthAccounts);
        AccountManager.growAccounts(growthAccounts, 0.06, true, taxSettings); // 6% return, working
        const finalBalance = AccountManager.getTotalBalance(growthAccounts);

        expect(finalBalance).toBeGreaterThan(initialBalance);

        // Test tax drag calculation
        const expectedTaxableGrowth = (100000 * 1.051) + 10000; // 6% - 15% tax drag = 5.1%
        const expectedTraditionalGrowth = (100000 * 1.06) + 10000; // No tax drag

        expect(Math.abs(growthAccounts.taxable.balance - expectedTaxableGrowth)).toBeLessThan(1);
        expect(Math.abs(growthAccounts.traditional.balance - expectedTraditionalGrowth)).toBeLessThan(1);
    });

    test('handles edge cases in withdrawal strategy', () => {
        const smallAccounts = AccountManager.initializeAccounts({
            taxableBalance: 5000,
            traditional401k: 10000,
            rothBalance: 15000
        });

        // Request more than total available
        const largeWithdrawal = AccountManager.executeWithdrawalStrategy(50000, smallAccounts, taxSettings);

        expect(largeWithdrawal.totalWithdrawn).toBeLessThanOrEqual(30000);
        expect(largeWithdrawal.netWithdrawn).toBeGreaterThan(0);
    });
});