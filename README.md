# Retirement Planning Calculator

A comprehensive, tax-aware retirement planning simulator with interactive web interface, detailed account-level projections, and realistic withdrawal strategies.

## 🌟 Key Features

### **Comprehensive Tax Simulation**
- **Capital Gains Tax**: 15% tax on gains portion of taxable account withdrawals
- **Ordinary Income Tax**: 22% tax on Traditional 401k withdrawals
- **Tax-Free Withdrawals**: Roth IRA and HSA accounts remain tax-free
- **Tax Drag Modeling**: Annual tax impact on taxable account growth (configurable 5-15%)
- **Net vs Gross Analysis**: Shows actual spending power after taxes

### **Smart Withdrawal Strategy**
- **Tax-Efficient Ordering**: Taxable → Traditional → Roth (preserves tax-advantaged accounts)
- **Real-Time Tax Calculation**: Calculates taxes owed on each withdrawal
- **Account-Level Tracking**: Detailed breakdown of which accounts are accessed each year

### **Multiple Account Types**
- **Taxable Investment Accounts**: Subject to capital gains tax and annual tax drag
- **Traditional 401(k)/IRA**: Tax-deferred growth, fully taxable on withdrawal
- **Roth IRA/401(k)**: Tax-free growth and withdrawals
- **Health Savings Account (HSA)**: Tax-free for medical expenses
- **Cash Reserves**: Treated as taxable investments

### **Advanced Projections**
- **75-Year Timeline**: Complete lifetime financial modeling
- **Inflation Adjustment**: Real vs nominal value tracking
- **Scenario Analysis**: Conservative (4%/2%), Moderate (6%/2.5%), Aggressive (8%/3%)
- **Account-Level Detail**: Year-by-year breakdown of all account balances and transactions

## 🚀 Quick Start

### **Local Usage (No Server Required)**
1. **Download/Clone** the repository
2. **Open** `retirement_simulator.html` directly in your web browser
3. **Configure** your financial parameters in the web interface
4. **Analyze** the detailed projections and tax implications

### **Customization**
1. **Copy** `config.example.js` to `config.js`
2. **Modify** default values and tax settings in `config.js`
3. **Refresh** the page to see your custom defaults

## 🧪 Testing & Development

### **Run All Tests**
```bash
npm install          # Install test dependencies (Puppeteer)
npm run test:all     # Run all tests: unit + accounts + end-to-end
```

### **Individual Test Suites**
```bash
npm run test         # Core calculation logic tests
npm run test:accounts # Account management tests
npm run test:e2e     # Browser automation tests
```

## 📊 What Makes This Calculator Unique

### **Tax-Aware Analysis**
Most retirement calculators ignore taxes entirely. This simulator:
- ✅ **Calculates actual taxes** on each withdrawal
- ✅ **Models tax drag** during accumulation phase
- ✅ **Shows net spending power** after taxes
- ✅ **Uses realistic tax rates** (15% capital gains, 22% ordinary income)

**Example Impact**: A $60k withdrawal results in $6.3k taxes and $53.7k actual spending power.

### **Account-Level Intelligence**
- ✅ **Separate tracking** of all account types
- ✅ **Tax-optimized withdrawal order**
- ✅ **Detailed projections** showing account balances and transactions
- ✅ **Realistic modeling** of different tax treatments

### **Professional-Grade Features**
- ✅ **Comprehensive testing** (unit, integration, E2E)
- ✅ **Modular architecture** (accounts.js, retirement-calculator.js)
- ✅ **Browser compatibility** (works with file:// protocol)
- ✅ **Real-time calculations** with automatic updates

## 🛠 Technical Architecture

### **File Structure**
```
retirement_calculator/
├── retirement_simulator.html    # Main web interface
├── accounts.js                  # Account management module
├── retirement-calculator.js     # Core calculation engine
├── script.js                   # UI interaction logic
├── styles.css                  # Complete styling
├── config.js                   # User configuration (git-ignored)
├── config.example.js           # Configuration template
├── test_calculator.js          # Unit tests
├── test_accounts.js            # Account management tests
└── test_e2e.js                # End-to-end browser tests
```

### **Key Modules**
- **accounts.js**: Account data structures, withdrawal strategies, tax calculations
- **retirement-calculator.js**: Projection timeline and calculation orchestration
- **script.js**: Web interface, form handling, table/chart rendering

## 🎯 Use Cases

### **Personal Financial Planning**
- Model different retirement scenarios and tax strategies
- Compare impact of various contribution levels and account allocations
- Understand tax implications of withdrawal strategies

### **Financial Professional Tool**
- Demonstrate tax-aware retirement planning to clients
- Show realistic projections with actual spending power
- Compare different account allocation strategies

### **Educational Resource**
- Learn about tax-advantaged accounts and withdrawal strategies
- Understand the impact of taxes on retirement planning
- Explore sensitivity to different economic assumptions

## 📈 Sample Output

The calculator provides detailed projections showing:
- **Account-by-account balances** for each year
- **Withdrawal strategy execution** (which accounts accessed when)
- **Tax calculations** and net spending power
- **Real vs nominal values** adjusted for inflation
- **Portfolio depletion analysis** and sustainability metrics

## 🔧 Configuration Options

### **Tax Settings**
- Tax drag rate (annual tax on taxable accounts)
- Capital gains tax rate (for taxable withdrawals)
- Ordinary income tax rate (for Traditional 401k withdrawals)
- Taxable gains ratio (percentage of balance that represents gains)

### **Scenario Presets**
- Conservative, Moderate, Aggressive investment return assumptions
- Custom scenario configuration
- Configurable default scenario selection

## 🤝 Contributing

The codebase uses a modular architecture with comprehensive testing. Key areas for enhancement:
- RMD calculations starting at age 73
- Tax bracket optimization strategies
- Monte Carlo simulations for market volatility
- Additional account types (529, pensions, etc.)

---

**Built with vanilla JavaScript, HTML5, and CSS3. No frameworks required.**
