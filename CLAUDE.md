# Retirement Planning Calculator

A comprehensive, tax-aware retirement planning simulator with modular architecture, realistic withdrawal strategies, and professional-grade testing.

## 📁 Project Structure

```
retirement_calculator/
├── README.md                       # Project overview and comprehensive documentation
├── CLAUDE.md                      # This file - development context for Claude
├── package.json                   # Node.js dependencies and test scripts
├── .gitignore                     # Git ignore rules (includes config.js)
│
├── accounts.js                    # 🏦 Account management module (NEW!)
├── retirement-calculator.js       # 🧠 Core calculation orchestration
├── index.html      # 🌐 Main web interface with tax settings
├── styles.css                     # 🎨 Complete styling including table layouts
├── script.js                      # ⚡ Frontend logic and table rendering
│
├── config.js                      # 🔐 User configuration (git-ignored)
├── config.example.js              # 📋 Configuration template
│
├── test_calculator.js            # 🧪 Unit tests for calculation logic
├── test_accounts.js              # 🏦 Account management tests (NEW!)
├── test_e2e.js                   # 🤖 End-to-end browser tests with Puppeteer
└── create_spreadsheet.py         # 📊 Python script for Excel export (untracked)
```

## 🚀 Advanced Features

### **Tax-Aware Simulation** (Major Enhancement)
- **Capital Gains Tax**: 15% tax on gains portion of taxable account withdrawals
- **Ordinary Income Tax**: 22% tax on Traditional 401k withdrawals
- **Tax-Free Withdrawals**: Roth and HSA accounts remain tax-free
- **Tax Drag Modeling**: Configurable annual tax on taxable account growth (default 5%)
- **Net vs Gross Analysis**: Shows actual spending power after taxes

### **Smart Withdrawal Strategy** (Professional-Grade)
- **Tax-Efficient Ordering**: Taxable → Traditional → Roth (preserves tax-advantaged accounts)
- **Account-Level Tracking**: Detailed breakdown of which accounts accessed each year
- **Real-Time Tax Calculation**: Taxes owed calculated for each withdrawal
- **Strategy Visualization**: Table shows withdrawal execution by account type

### **Modular Account Management** (Clean Architecture)
- **accounts.js Module**: Dedicated account data structures and operations
- **Separation of Concerns**: Account logic separated from projection calculation
- **Comprehensive Testing**: Dedicated test suite for account operations
- **Universal Compatibility**: Works in both Node.js and browser environments

### **Enhanced User Interface** (Professional Presentation)
- **Configurable Tax Settings**: UI panel for tax drag, capital gains, and ordinary income rates
- **Reorganized Projection Table**: Totals first, account balances, then withdrawal details
- **Space-Efficient Headers**: Multi-line headers save horizontal space
- **Account-Level Detail**: Complete visibility into account balances and transactions

### **Account Types Supported**
- **Taxable Investment Accounts**: Subject to capital gains tax and annual tax drag
- **Traditional 401(k)/IRA**: Tax-deferred growth, fully taxable on withdrawal
- **Roth IRA/401(k)**: Tax-free growth and withdrawals
- **Health Savings Account (HSA)**: Tax-free for qualified medical expenses
- **Cash Reserves**: Treated as taxable investments with capital gains treatment

### **Advanced Calculation Features**
- **Realistic Tax Impact**: Annual taxes reduce actual spending power
- **Tax Drag During Growth**: Taxable accounts grow slower due to ongoing taxes
- **Withdrawal Tax Calculations**: Different tax treatments applied correctly
- **75-Year Projections**: Complete lifetime financial modeling
- **Inflation-Adjusted Analysis**: Real vs nominal value tracking throughout

## 🛠 Technical Architecture

### **Modular Design** (Recently Refactored)
- **`accounts.js`**: Account data structures, withdrawal strategies, tax calculations
- **`retirement-calculator.js`**: Projection timeline orchestration and calculation flow
- **`script.js`**: Web interface, form handling, table/chart rendering
- **Universal Module Pattern**: Works seamlessly in both Node.js and browser environments

### **Configuration System** (File-Based)
- **`config.js`**: User-specific settings (git-ignored for privacy)
- **`config.example.js`**: Template showing all available options
- **Automatic Fallback**: Uses example config if user config missing
- **Tax Settings**: Configurable tax drag, capital gains, and ordinary income rates
- **Default Scenarios**: Configurable which scenario loads on startup

### **Testing Strategy** (Comprehensive Coverage)
- **Unit Tests**: Mathematical validation of core calculation logic
- **Account Tests**: Dedicated testing for account management operations
- **E2E Tests**: Full browser automation with Puppeteer
- **Error Monitoring**: Console and page error detection
- **Cross-Environment**: Tests work in both Node.js and browser contexts

## 🧪 Testing & Quality Assurance

### **Running Tests**
```bash
npm run test          # Core calculation logic tests
npm run test:accounts # Account management tests
npm run test:e2e      # End-to-end browser tests
npm run test:all      # All tests in sequence
```

### **Test Coverage** (Comprehensive)
- ✅ **Mathematical Accuracy**: Validates tax calculations, withdrawal strategies, account growth
- ✅ **Account Operations**: Tests initialization, growth, withdrawals, tax calculations
- ✅ **Scenario Testing**: Tests all predefined financial scenarios and custom configurations
- ✅ **Tax Simulation**: Validates capital gains tax, ordinary income tax, tax-free withdrawals
- ✅ **Edge Cases**: Early retirement, high withdrawals, portfolio depletion, account exhaustion
- ✅ **UI Functionality**: Form inputs, auto-calculation, chart rendering, table population
- ✅ **Error Detection**: JavaScript errors, console errors, configuration loading
- ✅ **Browser Compatibility**: Full automation ensures cross-browser functionality

### **Quality Features**
- **Modular Testing**: Each module has dedicated test suite for focused validation
- **Tax Calculation Verification**: Specific tests ensure tax math is correct
- **Withdrawal Strategy Validation**: Tests confirm proper account ordering (Taxable → Traditional → Roth)
- **Real-time Error Monitoring**: E2E tests catch browser-side issues immediately
- **Configuration Testing**: Validates config loading and fallback mechanisms

## 💻 Development Context & Evolution

### **Recent Major Enhancements** (Current State)
1. **Tax Simulation Implementation**: Complete tax calculation system with capital gains and ordinary income
2. **Account Module Extraction**: Clean separation of account management into dedicated module
3. **Withdrawal Strategy Engine**: Professional-grade tax-efficient withdrawal ordering
4. **Enhanced UI Organization**: Reorganized projection table for better information hierarchy
5. **Comprehensive Test Coverage**: Dedicated test suites for all major components
6. **Configuration System**: File-based configuration with privacy and customization support

### **Browser Compatibility** (Production Ready)
- **Local File Support**: Works when opened directly from file system (no server required)
- **No CORS Issues**: Uses standard script tags for all modules
- **Chart.js Integration**: Professional financial visualizations with Chart.js CDN
- **Responsive Design**: Mobile-friendly interface with flexible layouts
- **Cross-Browser Testing**: Validated with Puppeteer automation

### **Code Style & Architecture Principles**
- **Modular Design**: Clear separation between calculation, account management, and UI
- **Universal Modules**: Work in both Node.js and browser environments
- **Clean Interfaces**: Well-defined function signatures and data structures
- **Error-First Design**: Comprehensive error handling and validation
- **Test-Driven Quality**: Each module has dedicated test coverage

## 🔧 Development Commands

```bash
# Core testing
npm run test          # Mathematical validation and calculation logic
npm run test:accounts # Account operations, tax calculations, withdrawal strategies
npm run test:e2e      # Full browser automation and UI validation
npm run test:all      # Complete test suite

# Development workflow
# 1. Modify code
# 2. Run appropriate tests
# 3. Open index.html in browser to validate UI
# 4. Run npm run test:all before committing
```

## 📊 Current Capabilities & Metrics

### **Tax-Aware Projections** (Realistic Modeling)
- **75-year timeline**: Complete lifetime financial modeling with tax impact
- **Account-level tracking**: Detailed breakdown by account type each year
- **Real tax calculations**: Actual taxes owed on each withdrawal
- **Net spending power**: Shows money available after taxes
- **Tax drag modeling**: Growth impact of ongoing taxation

### **Financial Scenarios** (Professional Analysis)
- **Conservative**: 4% return, 2% inflation
- **Moderate**: 6% return, 2.5% inflation
- **Aggressive**: 8% return, 3% inflation
- **Custom**: User-defined parameters with full configuration

### **Account Management** (Complete Coverage)
- **5 account types**: Taxable, Traditional, Roth, HSA, Cash
- **Tax treatments**: Appropriate tax handling for each account type
- **Withdrawal strategy**: Tax-efficient ordering preserves tax-advantaged accounts
- **Growth modeling**: Different effective returns based on tax treatment

## 🎯 Usage Notes & Context

### **For Local Development/Usage**
- **No server required**: Open `index.html` directly in any browser
- **Self-contained**: All dependencies loaded via CDN (Chart.js)
- **Privacy-first**: Sensitive config stored locally and git-ignored
- **Instant updates**: Real-time recalculation as parameters change

### **For Financial Analysis**
- **Professional accuracy**: Tax calculations match real-world scenarios
- **Realistic projections**: Accounts for actual spending power after taxes
- **Strategy validation**: Shows impact of different withdrawal approaches
- **Scenario comparison**: Easy to test different economic assumptions

### **For Future Development**
- **Modular architecture**: Easy to extend with new account types or features
- **Comprehensive testing**: Changes validated across multiple test suites
- **Clean interfaces**: Well-defined APIs between modules
- **Documentation**: README and CLAUDE.md provide complete context

## 🚀 Future Enhancement Areas

### **Advanced Tax Features** (Natural Extensions)
- **RMD calculations**: Required minimum distributions starting at age 73
- **Tax bracket management**: Optimize withdrawals to minimize tax impact
- **Roth conversion strategies**: Identify low-tax years for conversions
- **Social Security taxation**: Model taxation based on total income

### **Enhanced Analysis** (Professional Features)
- **Monte Carlo simulations**: Account for market volatility
- **Sensitivity analysis**: Show impact of parameter changes
- **Goal-based planning**: Target specific retirement income levels
- **Scenario comparison**: Side-by-side analysis of different strategies

This codebase represents a sophisticated, production-ready retirement planning tool with realistic tax modeling, professional-grade architecture, and comprehensive testing. The modular design makes it easy to extend while maintaining quality and accuracy.

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.


      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.