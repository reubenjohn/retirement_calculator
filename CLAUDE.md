# Retirement Planning Calculator

A comprehensive retirement planning simulator with interactive web interface, detailed projections, and robust testing.

## 📁 Project Structure

```
retirement_calculator/
├── README.md                       # Project overview and setup instructions
├── CLAUDE.md                      # This file - development context for Claude
├── package.json                   # Node.js dependencies and scripts
├── .gitignore                     # Git ignore rules for Node.js projects
│
├── retirement-calculator.js       # 🧠 Core calculation logic (universal module)
├── retirement_simulator.html      # 🌐 Main web interface
├── styles.css                     # 🎨 All CSS styling
├── script.js                      # ⚡ Frontend JavaScript logic
│
├── test_calculator.js            # 🧪 Unit tests for calculation logic
├── test_e2e.js                   # 🤖 End-to-end browser tests with Puppeteer
└── create_spreadsheet.py         # 📊 Python script for Excel export (untracked)
```

## 🚀 Features

### Core Functionality
- **Interactive Web Interface**: Clean, responsive design with real-time calculations
- **Comprehensive Financial Modeling**: Salary growth, investment returns, inflation, multiple account types
- **Scenario Planning**: Pre-configured conservative/moderate/aggressive scenarios plus custom options
- **Visual Analytics**: Chart.js powered portfolio balance visualization (nominal vs real)
- **Detailed Projections**: Year-by-year breakdown table showing all financial variables

### Account Types Supported
- Taxable investment accounts
- 401(k) / Traditional retirement accounts
- Roth IRA/401(k) accounts
- Health Savings Account (HSA)
- Cash reserves (treated as invested)

### Calculation Features
- Salary growth with annual increases
- Annual bonuses
- Employer 401(k) matching
- Inflation-adjusted withdrawals
- Real vs nominal value tracking
- Portfolio depletion detection

## 🛠 Technical Architecture

### Universal Module Design
- **`retirement-calculator.js`**: Core calculation engine that works in both browser and Node.js
- Uses UMD (Universal Module Definition) pattern for maximum compatibility
- No duplicate code between web interface and test suite

### Separated Concerns
- **HTML**: Structure and content only
- **CSS**: All styling in external `styles.css`
- **JavaScript**: Interactive logic in external `script.js`
- **Calculations**: Shared module for consistent logic

### Testing Strategy
- **Unit Tests**: Mathematical validation of calculation logic
- **E2E Tests**: Browser automation with Puppeteer
- **Error Monitoring**: Console and page error detection
- **Functional Validation**: UI interaction testing

## 🧪 Testing & Quality Assurance

### Running Tests
```bash
npm run test          # Unit tests for calculation logic
npm run test:e2e      # End-to-end browser tests
npm run test:all      # Run all tests
```

### Test Coverage
- ✅ **Mathematical Accuracy**: Validates balance calculations, growth rates, withdrawals
- ✅ **Scenario Testing**: Tests all predefined financial scenarios
- ✅ **Edge Cases**: Early retirement, high withdrawals, portfolio depletion
- ✅ **UI Functionality**: Button clicks, form inputs, chart rendering, table population
- ✅ **Error Detection**: JavaScript errors, console errors, page crashes
- ✅ **Browser Compatibility**: Puppeteer-based testing ensures cross-browser functionality

### Quality Features
- **Console Error Monitoring**: E2E tests catch JavaScript errors that were missed before
- **Real-time Error Reporting**: Immediate feedback on any browser-side issues
- **Comprehensive Validation**: Tests cover both calculation accuracy and UI functionality

## 💻 Development Context

### Recent Major Changes
1. **Code Deduplication**: Extracted shared calculation logic to universal module
2. **Enhanced Testing**: Added comprehensive error monitoring to E2E tests
3. **File Organization**: Separated HTML/CSS/JS into discrete files
4. **Projection Table**: Added detailed year-by-year breakdown matching original spreadsheet
5. **Error Prevention**: Fixed chart destruction issues and improved error handling

### Browser Compatibility
- **Local File Support**: Works when opened directly from Windows file system
- **No CORS Issues**: Uses standard script tags instead of ES6 modules
- **Chart.js Integration**: Professional financial visualizations
- **Responsive Design**: Mobile-friendly interface

### Code Style & Patterns
- **No Comments**: Code is self-documenting as requested
- **Consistent Formatting**: Professional styling throughout
- **Error-First Design**: Robust error handling and validation
- **Separation of Concerns**: Clean architecture with single responsibility

## 🔧 Development Commands

```bash
# Test the calculation logic
npm run test

# Test the full web interface
npm run test:e2e

# Run all tests
npm run test:all
```

## 📊 Key Metrics

The simulator provides:
- **75-year projections**: Complete lifetime financial modeling
- **Multiple scenarios**: Conservative (4%/2%), Moderate (6%/2.5%), Aggressive (8%/3%)
- **Real-time updates**: Instant recalculation on input changes
- **Detailed breakdown**: Every year's salary, contributions, withdrawals, gains, balances
- **Depletion detection**: Identifies when/if portfolio runs out

## 🎯 Usage Notes

### For Local Development
- Open `retirement_simulator.html` directly in browser (no server required)
- All external dependencies (Chart.js) loaded via CDN
- Files work together via relative paths

### For Testing & Validation
- Unit tests validate mathematical accuracy
- E2E tests ensure UI functionality and catch browser errors
- Enhanced error monitoring catches issues that were previously missed

This codebase represents a complete retirement planning solution with professional-grade testing, clean architecture, and comprehensive financial modeling capabilities.