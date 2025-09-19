// Test the retirement calculation logic using shared module
const RetirementCalculator = require('./retirement-calculator.js');

// Use shared calculation function
const { calculateRetirement } = RetirementCalculator;

// Test cases
function runTests() {
    console.log('🧪 Running Retirement Calculator Tests\n');

    // Test 1: Default parameters (matching HTML defaults)
    console.log('Test 1: Default Parameters');
    const defaultParams = {
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 90,
        baseSalary: 150000,
        bonus: 15000,
        salaryGrowth: 0.03,

        // Individual account balances
        taxableBalance: 50000,
        traditional401k: 150000,
        rothBalance: 30000,
        hsaBalance: 10000,
        cashBalance: 20000,

        // Individual contributions
        taxableContrib: 12000,
        employee401k: 23000,
        employer401k: 10000,
        rothContrib: 6500,
        hsaEmployee: 4000,
        hsaEmployer: 1000,

        investmentReturn: 0.04, // Conservative scenario
        inflation: 0.02,
        baseWithdrawal: 60000,
        indexWithdrawals: true
    };

    const result1 = calculateRetirement(defaultParams);
    const retirementProjection = result1.projections.find(p => p.age === 60);
    const lifeExpectancyProjection = result1.projections.find(p => p.age === 90);

    console.log(`  ✅ Retirement balance at 60: $${retirementProjection?.endBalance.toLocaleString() || 'N/A'}`);
    console.log(`  ✅ Balance at life expectancy (90): $${lifeExpectancyProjection?.endBalance.toLocaleString() || 'N/A'}`);
    console.log(`  ✅ Portfolio depletion year: ${result1.depletionYear || 'Never'}`);

    // Test 2: Aggressive scenario
    console.log('\nTest 2: Aggressive Scenario');
    const aggressiveParams = { ...defaultParams, investmentReturn: 0.08, inflation: 0.03 };
    const result2 = calculateRetirement(aggressiveParams);
    const retirementProjection2 = result2.projections.find(p => p.age === 60);

    console.log(`  ✅ Retirement balance at 60: $${retirementProjection2?.endBalance.toLocaleString() || 'N/A'}`);
    console.log(`  ✅ Portfolio depletion year: ${result2.depletionYear || 'Never'}`);

    // Test 3: Edge case - early retirement, high withdrawals
    console.log('\nTest 3: Early Retirement + High Withdrawals');
    const earlyRetireParams = {
        ...defaultParams,
        retirementAge: 45,
        baseWithdrawal: 100000,
        investmentReturn: 0.06,
        inflation: 0.025
    };
    const result3 = calculateRetirement(earlyRetireParams);
    const retirementProjection3 = result3.projections.find(p => p.age === 45);

    console.log(`  ✅ Retirement balance at 45: $${retirementProjection3?.endBalance.toLocaleString() || 'N/A'}`);
    console.log(`  ✅ Portfolio depletion year: ${result3.depletionYear || 'Never'}`);

    // Test 4: Validation checks
    console.log('\nTest 4: Validation Checks');

    // Check that balance grows during working years
    const workingYears = result1.projections.filter(p => p.isWorking);
    const balanceGrows = workingYears.every((year, i) =>
        i === 0 || year.endBalance >= workingYears[i-1].endBalance
    );
    console.log(`  ${balanceGrows ? '✅' : '❌'} Balance grows during working years`);

    // Check that withdrawals start at retirement
    const retiredYears = result1.projections.filter(p => !p.isWorking);
    const withdrawalsCorrect = retiredYears.every(year => year.withdrawal > 0);
    console.log(`  ${withdrawalsCorrect ? '✅' : '❌'} Withdrawals occur during retirement`);

    // Check inflation indexing
    const inflationIndexed = retiredYears.every((year, i) =>
        i === 0 || year.withdrawal >= retiredYears[i-1].withdrawal
    );
    console.log(`  ${inflationIndexed ? '✅' : '❌'} Withdrawals increase with inflation`);

    // Test 5: Mathematical consistency
    console.log('\nTest 5: Mathematical Consistency');

    // Verify account-based calculations with tax drag
    const testYear = result1.projections[5]; // 6th year
    const accounts = testYear.accounts;

    // Calculate expected balance considering tax treatments
    let expectedTotal = 0;
    Object.values(accounts).forEach((account) => {
        expectedTotal += account.balance;
    });

    const balanceMatches = Math.abs(testYear.endBalance - expectedTotal) < 0.01;
    console.log(`  ${balanceMatches ? '✅' : '❌'} Account-based calculations are consistent`);
    console.log(`    Calculated: $${expectedTotal.toLocaleString()}, Actual: $${testYear.endBalance.toLocaleString()}`);

    console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests();