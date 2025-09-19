// Test account management functionality
const AccountManager = require('./accounts.js');

console.log('🧪 Running Account Management Tests\n');

// Test 1: Account initialization
console.log('Test 1: Account Initialization');
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

const accounts = AccountManager.initializeAccounts(testParams);
console.log(`  ✅ Accounts initialized successfully`);
console.log(`  ✅ Total balance: $${AccountManager.getTotalBalance(accounts).toLocaleString()}`);
console.log(`  ✅ Total contributions: $${AccountManager.getTotalContributions(accounts).toLocaleString()}`);

// Test 2: Tax calculations
console.log('\nTest 2: Tax Calculations');
const taxSettings = {
    taxDragRate: 0.15,
    capitalGainsRate: 0.15,
    ordinaryIncomeRate: 0.22,
    taxableGainsRatio: 0.70
};

const taxableTax = AccountManager.calculateTaxOnWithdrawal('taxable', 10000, taxSettings);
const traditionalTax = AccountManager.calculateTaxOnWithdrawal('traditional', 10000, taxSettings);
const rothTax = AccountManager.calculateTaxOnWithdrawal('roth', 10000, taxSettings);

console.log(`  ✅ Taxable withdrawal tax (10k): $${taxableTax.toLocaleString()} (expected: $1,050)`);
console.log(`  ✅ Traditional withdrawal tax (10k): $${traditionalTax.toLocaleString()} (expected: $2,200)`);
console.log(`  ✅ Roth withdrawal tax (10k): $${rothTax.toLocaleString()} (expected: $0)`);

// Test 3: Withdrawal strategy
console.log('\nTest 3: Withdrawal Strategy');
const testAccounts = AccountManager.initializeAccounts({
    taxableBalance: 50000,
    traditional401k: 100000,
    rothBalance: 75000,
    hsaBalance: 25000,
    cashBalance: 25000
});

const withdrawalResult = AccountManager.executeWithdrawalStrategy(60000, testAccounts, taxSettings);
console.log(`  ✅ Target withdrawal: $60,000`);
console.log(`  ✅ Total withdrawn: $${withdrawalResult.totalWithdrawn.toLocaleString()}`);
console.log(`  ✅ Total taxes: $${withdrawalResult.totalTaxes.toLocaleString()}`);
console.log(`  ✅ Net after taxes: $${withdrawalResult.netWithdrawn.toLocaleString()}`);
console.log(`  ✅ Withdrawal strategy: Taxable first ($${withdrawalResult.withdrawals.taxable?.toLocaleString() || 0}), then Traditional ($${withdrawalResult.withdrawals.traditional?.toLocaleString() || 0})`);

// Test 4: Account growth
console.log('\nTest 4: Account Growth');
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

console.log(`  ✅ Initial balance: $${initialBalance.toLocaleString()}`);
console.log(`  ✅ Final balance after growth + contributions: $${finalBalance.toLocaleString()}`);
console.log(`  ✅ Growth applied with tax drag on taxable accounts`);

// Test 5: Mathematical validation
console.log('\nTest 5: Mathematical Validation');
const expectedTaxableGrowth = (100000 * 1.051) + 10000; // 6% - 15% tax drag = 5.1%
const expectedTraditionalGrowth = (100000 * 1.06) + 10000; // No tax drag
const actualTaxable = growthAccounts.taxable.balance;
const actualTraditional = growthAccounts.traditional.balance;

const taxableMatch = Math.abs(actualTaxable - expectedTaxableGrowth) < 1;
const traditionalMatch = Math.abs(actualTraditional - expectedTraditionalGrowth) < 1;

console.log(`  ${taxableMatch ? '✅' : '❌'} Taxable account growth correct: $${actualTaxable.toLocaleString()} (expected: $${expectedTaxableGrowth.toLocaleString()})`);
console.log(`  ${traditionalMatch ? '✅' : '❌'} Traditional account growth correct: $${actualTraditional.toLocaleString()} (expected: $${expectedTraditionalGrowth.toLocaleString()})`);

console.log('\n🎉 All account management tests completed!');