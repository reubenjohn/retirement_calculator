// Test the retirement calculation logic using shared module
const RetirementCalculator = require('./retirement-calculator.js');

// Use shared calculation function
const { calculateRetirement } = RetirementCalculator;

// Default test parameters (matching HTML defaults)
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

describe('Retirement Calculator', () => {
    test('calculates default parameters correctly', () => {
        const result = calculateRetirement(defaultParams);
        const retirementProjection = result.projections.find(p => p.age === 60);
        const lifeExpectancyProjection = result.projections.find(p => p.age === 90);

        expect(retirementProjection).toBeDefined();
        expect(retirementProjection.endBalance).toBeGreaterThan(0);
        expect(lifeExpectancyProjection).toBeDefined();
        expect(result.projections.length).toBeGreaterThan(60); // Should cover retirement years
    });

    test('aggressive scenario produces higher balances', () => {
        const aggressiveParams = { ...defaultParams, investmentReturn: 0.08, inflation: 0.03 };
        const aggressiveResult = calculateRetirement(aggressiveParams);
        const defaultResult = calculateRetirement(defaultParams);

        const aggressiveRetirement = aggressiveResult.projections.find(p => p.age === 60);
        const defaultRetirement = defaultResult.projections.find(p => p.age === 60);

        expect(aggressiveRetirement.endBalance).toBeGreaterThan(defaultRetirement.endBalance);
    });

    test('early retirement with high withdrawals', () => {
        const earlyRetireParams = {
            ...defaultParams,
            retirementAge: 45,
            baseWithdrawal: 100000,
            investmentReturn: 0.06,
            inflation: 0.025
        };
        const result = calculateRetirement(earlyRetireParams);
        const retirementProjection = result.projections.find(p => p.age === 45);

        expect(retirementProjection).toBeDefined();
        expect(retirementProjection.endBalance).toBeGreaterThan(0);
        expect(result.projections.find(p => p.age === 45).isWorking).toBe(false);
    });

    test('balance grows during working years', () => {
        const result = calculateRetirement(defaultParams);
        const workingYears = result.projections.filter(p => p.isWorking);

        for (let i = 1; i < workingYears.length; i++) {
            expect(workingYears[i].endBalance).toBeGreaterThanOrEqual(workingYears[i-1].endBalance);
        }
    });

    test('withdrawals occur during retirement', () => {
        const result = calculateRetirement(defaultParams);
        const retiredYears = result.projections.filter(p => !p.isWorking);

        retiredYears.forEach(year => {
            expect(year.withdrawal).toBeGreaterThan(0);
        });
    });

    test('withdrawals increase with inflation', () => {
        const result = calculateRetirement(defaultParams);
        const retiredYears = result.projections.filter(p => !p.isWorking);

        for (let i = 1; i < retiredYears.length; i++) {
            expect(retiredYears[i].withdrawal).toBeGreaterThanOrEqual(retiredYears[i-1].withdrawal);
        }
    });

    test('account-based calculations are mathematically consistent', () => {
        const result = calculateRetirement(defaultParams);
        const testYear = result.projections[5]; // 6th year
        const accounts = testYear.accounts;

        let expectedTotal = 0;
        Object.values(accounts).forEach((account) => {
            expectedTotal += account.balance;
        });

        expect(Math.abs(testYear.endBalance - expectedTotal)).toBeLessThan(0.01);
    });
});