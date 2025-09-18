# Create a retirement simulation spreadsheet with scenarios and projections
import xlsxwriter
from datetime import datetime

path = "/mnt/data/Retirement_Simulation.xlsx"
wb = xlsxwriter.Workbook(path)

# ===== Formats =====
title_fmt = wb.add_format({"bold": True, "font_size": 14})
hdr = wb.add_format({"bold": True, "bg_color": "#EEEEEE", "border": 1})
num = wb.add_format({"num_format": "#,##0"})
curr = wb.add_format({"num_format": "$#,##0"})
perc = wb.add_format({"num_format": "0.0%"})
wrap = wb.add_format({"text_wrap": True})
bold = wb.add_format({"bold": True})
note = wb.add_format({"font_color": "#555555", "italic": True})

# ===== Scenarios Sheet =====
sc = wb.add_worksheet("Scenarios")
sc.write("A1", "Scenario Name", hdr)
sc.write("B1", "Investment Return (nominal)", hdr)
sc.write("C1", "Inflation", hdr)
sc_list = [
    ("Conservative", 0.04, 0.02),
    ("Moderate", 0.06, 0.025),
    ("Aggressive", 0.08, 0.03),
    ("Custom (edit)", 0.055, 0.023),
]
for i, (name, ret, inf) in enumerate(sc_list, start=2):
    sc.write(f"A{i}", name)
    sc.write_number(f"B{i}", ret, perc)
    sc.write_number(f"C{i}", inf, perc)
# Create a named range for scenario names
wb.define_name("ScenarioNames", "=Scenarios!$A$2:$A$5")

# ===== Assumptions Sheet =====
ass = wb.add_worksheet("Assumptions")
ass.set_column("A:A", 34)
ass.set_column("B:B", 20)
ass.write("A1", "Retirement Simulation — Assumptions", title_fmt)
ass.write("A3", "Current Year")
ass.write_number("B3", datetime.now().year, num)

ass.write("A4", "Current Age (edit)")
ass.write_number("B4", 30, num)

ass.write("A5", "Retirement Age (edit)")
ass.write_number("B5", 60, num)

ass.write("A6", "Life Expectancy Age (edit)")
ass.write_number("B6", 90, num)

ass.write("A8", "Starting Portfolio Balances (edit)", bold)
ass.write("A9",  "Taxable")
ass.write_number("B9", 50000, curr)
ass.write("A10", "401(k) / Traditional")
ass.write_number("B10", 150000, curr)
ass.write("A11", "Roth (IRA/401k)")
ass.write_number("B11", 30000, curr)
ass.write("A12", "HSA")
ass.write_number("B12", 10000, curr)
ass.write("A13", "Cash (treated as invested)")
ass.write_number("B13", 20000, curr)
ass.write("A14", "Starting Total (auto)")
ass.write_formula("B14", "=SUM(B9:B13)", curr)

ass.write("A16", "Annual Contributions While Working (edit)", bold)
ass.write("A17", "Taxable contribution")
ass.write_number("B17", 12000, curr)
ass.write("A18", "401(k) employee")
ass.write_number("B18", 23000, curr)
ass.write("A19", "401(k) employer")
ass.write_number("B19", 10000, curr)
ass.write("A20", "Roth contribution")
ass.write_number("B20", 6500, curr)
ass.write("A21", "HSA employee")
ass.write_number("B21", 4000, curr)
ass.write("A22", "HSA employer")
ass.write_number("B22", 1000, curr)
ass.write("A23", "Total Contributions While Working (auto)")
ass.write_formula("B23", "=SUM(B17:B22)", curr)

ass.write("A25", "Income (edit)", bold)
ass.write("A26", "Current base salary")
ass.write_number("B26", 150000, curr)
ass.write("A27", "Annual bonus")
ass.write_number("B27", 15000, curr)
ass.write("A28", "Annual salary growth")
ass.write_number("B28", 0.03, perc)

ass.write("A30", "Selected Scenario (choose)", bold)
ass.write("B30", "Moderate")
ass.data_validation("B30", {"validate": "list", "source": "=ScenarioNames"})

ass.write("A31", "Investment Return (from scenario)")
ass.write_formula("B31", "=INDEX(Scenarios!$B$2:$B$5, MATCH(B30, Scenarios!$A$2:$A$5, 0))", perc)

ass.write("A32", "Inflation (from scenario)")
ass.write_formula("B32", "=INDEX(Scenarios!$C$2:$C$5, MATCH(B30, Scenarios!$A$2:$A$5, 0))", perc)

ass.write("A34", "Retirement Withdrawal (today’s $)", bold)
ass.write("A35", "Base annual withdrawal (edit)")
ass.write_number("B35", 60000, curr)
ass.write("A36", "Index withdrawals with inflation? (Yes/No)")
ass.write("B36", "Yes")
ass.data_validation("B36", {"validate": "list", "source": ["Yes", "No"]})

# Helpful notes
ass.write("A38", "Notes", bold)
ass.write(
    "A39",
    "Edit the shaded values in column B. Choose a scenario or edit the 'Custom' row on the Scenarios sheet.\n"
    "Starting Total and Total Contributions are calculated automatically.\n"
    "Withdrawals are applied post-retirement and grow with inflation if set to Yes.",
    wrap
)

# Name key cells for easier formulas elsewhere
wb.define_name("StartYear",      "=Assumptions!$B$3")
wb.define_name("StartAge",       "=Assumptions!$B$4")
wb.define_name("RetireAge",      "=Assumptions!$B$5")
wb.define_name("LifeAge",        "=Assumptions!$B$6")
wb.define_name("StartBalance",   "=Assumptions!$B$14")
wb.define_name("ContrAnnual",    "=Assumptions!$B$23")
wb.define_name("BaseSalary",     "=Assumptions!$B$26")
wb.define_name("Bonus",          "=Assumptions!$B$27")
wb.define_name("SalaryGrowth",   "=Assumptions!$B$28")
wb.define_name("ReturnRate",     "=Assumptions!$B$31")
wb.define_name("Inflation",      "=Assumptions!$B$32")
wb.define_name("BaseWithdrawal", "=Assumptions!$B$35")
wb.define_name("IndexWithdraw",  "=Assumptions!$B$36")

# ===== Projection Sheet =====
proj = wb.add_worksheet("Projection")
proj.freeze_panes(1, 0)
proj.set_column("A:A", 7)
proj.set_column("B:B", 6)
proj.set_column("C:C", 10)
proj.set_column("D:D", 14)
proj.set_column("E:E", 12)
proj.set_column("F:F", 14)
proj.set_column("G:G", 15)
proj.set_column("H:H", 12)
proj.set_column("I:I", 17)
proj.set_column("J:J", 10)
proj.set_column("K:K", 16)
proj.set_column("L:L", 16)
proj.set_column("M:M", 18)
proj.set_column("N:N", 11)

headers = [
    "Year", "Age", "Working?", "Salary", "Bonus", "Total Income",
    "Contributions", "Price Index", "Withdrawal (Nominal)",
    "Return", "Start Balance", "End Balance", "End Balance (Real)", "Depleted?"
]
for c, h in enumerate(headers):
    proj.write(0, c, h, hdr)

# Build formulas for rows 2..N
N = 75  # years to project
for r in range(2, N+2):  # Excel rows start at 1; our header is row 1
    row = r  # Excel row number
    prev_row = r-1

    # A: Year
    proj.write_formula(row-1, 0, "=StartYear + ROW()-2", num)
    # B: Age
    proj.write_formula(row-1, 1, "=StartAge + ROW()-2", num)
    # C: Working?
    proj.write_formula(row-1, 2, "=B{r}<RetireAge".format(r=row))
    # D: Salary
    proj.write_formula(row-1, 3, "=IF(C{r}, BaseSalary*(1+SalaryGrowth)^(ROW()-2), 0)".format(r=row), curr)
    # E: Bonus
    proj.write_formula(row-1, 4, "=IF(C{r}, Bonus, 0)".format(r=row), curr)
    # F: Total Income
    proj.write_formula(row-1, 5, "=D{r}+E{r}".format(r=row), curr)
    # G: Contributions (annual total while working)
    proj.write_formula(row-1, 6, "=IF(C{r}, ContrAnnual, 0)".format(r=row), curr)
    # H: Price Index
    if r == 2:
        proj.write_formula(row-1, 7, "=1")
    else:
        proj.write_formula(row-1, 7, "=H{pr}*(1+Inflation)".format(pr=prev_row))
    # I: Withdrawal (nominal)
    proj.write_formula(
        row-1, 8,
        "=IF(C{r}, 0, IF(IndexWithdraw=\"Yes\", BaseWithdrawal*H{r}, BaseWithdrawal))".format(r=row),
        curr
    )
    # J: Return
    proj.write_formula(row-1, 9, "=ReturnRate", perc)
    # K: Start Balance
    if r == 2:
        proj.write_formula(row-1, 10, "=StartBalance", curr)
    else:
        proj.write_formula(row-1, 10, "=L{pr}".format(pr=prev_row), curr)
    # L: End Balance
    proj.write_formula(row-1, 11, "=MAX(0, K{r} + G{r} - I{r} + K{r}*J{r})".format(r=row), curr)
    # M: End Balance (Real)
    proj.write_formula(row-1, 12, "=IF(H{r}=0,0, L{r}/H{r})".format(r=row), curr)
    # N: Depleted?
    proj.write_formula(row-1, 13, "=L{r}<=0".format(r=row))

# ===== Summary Dashboard =====
sumsh = wb.add_worksheet("Summary")
sumsh.set_column("A:A", 38)
sumsh.set_column("B:B", 25)
sumsh.write("A1", "Retirement Simulation — Summary", title_fmt)

# Key outputs
sumsh.write("A3", "Chosen retirement age")
sumsh.write_formula("B3", "=RetireAge", num)

sumsh.write("A4", "Total savings at retirement (nominal)")
# Find first row where Age >= RetireAge
sumsh.write_formula(
    "B4",
    "=INDEX(Projection!$L:$L, MATCH(RetireAge, Projection!$B:$B, 0))",
    curr
)

sumsh.write("A5", "Year portfolio depletes (if any)")
sumsh.write_formula(
    "B5",
    "=IFERROR(INDEX(Projection!$A:$A, MATCH(TRUE, Projection!$N:$N, 0)), \"Not depleted\")",
    num
)

sumsh.write("A6", "Years sustainable post-retirement")
sumsh.write_formula(
    "B6",
    "=IF(B5=\"Not depleted\", LifeAge-RetireAge+1, INDEX(Projection!$B:$B, MATCH(TRUE, Projection!$N:$N, 0))-RetireAge)",
    num
)

sumsh.write("A7", "Ending balance at life expectancy (nominal)")
sumsh.write_formula(
    "B7",
    "=INDEX(Projection!$L:$L, MATCH(LifeAge, Projection!$B:$B, 0))",
    curr
)

sumsh.write("A9", "How to use", bold)
sumsh.write(
    "A10",
    "1) Go to the Assumptions sheet and edit values in column B.\n"
    "2) Pick a Scenario or adjust the Custom row on the Scenarios sheet.\n"
    "3) Review the Projection sheet for per-year cashflows and balances.\n"
    "4) Return to this Summary for key answers like balance at retirement and years sustainable.",
    wrap
)

# ===== Simple Chart: Portfolio over Time =====
chart = wb.add_chart({"type": "line"})
chart.add_series({
    "name": "End Balance (Nominal)",
    "categories": "=Projection!$A$2:$A$76",
    "values": "=Projection!$L$2:$L$76",
})
chart.set_title({"name": "Portfolio Balance Over Time"})
chart.set_x_axis({"name": "Year"})
chart.set_y_axis({"name": "Balance"})
sumsh.insert_chart("D3", chart, {"x_offset": 10, "y_offset": 10, "x_scale": 1.2, "y_scale": 1.2})

# ===== README / W2 Helper =====
readme = wb.add_worksheet("README + W2 Helper")
readme.set_column("A:A", 42)
readme.set_column("B:B", 28)
readme.write("A1", "Quick Start", title_fmt)
readme.write(
    "A3",
    "• Edit assumptions on the Assumptions sheet (column B).\n"
    "• Choose a scenario on the Assumptions sheet.\n"
    "• Check the Summary and Projection sheets for results.\n"
    "• This model ignores detailed taxes and account-specific withdrawal ordering to stay simple. "
    "Refine later if needed (e.g., taxable-first withdrawals, RMDs, Social Security).",
    wrap
)

readme.write("A7", "W-2 Mapping Helper (Optional)", bold)
w2_rows = [
    ("Box 1 — Wages, tips, other comp", "Use as your base salary reference for last year."),
    ("Box 12 (Code D) — 401(k) employee", "Total employee pre-tax 401(k) contributions."),
    ("Box 12 (Code W) — HSA contributions", "Employee + employer HSA contributions shown here."),
    ("Box 3 — Social Security wages", "Cap may differ from Box 1; for reference only."),
    ("Box 5 — Medicare wages", "Often higher than Box 1 due to pre-tax deductions."),
]
readme.write("A8", "Field", hdr)
readme.write("B8", "How to use", hdr)
for i, (f, tip) in enumerate(w2_rows, start=9):
    readme.write(f"A{i}", f)
    readme.write(f"B{i}", tip, wrap)

wb.close()

path