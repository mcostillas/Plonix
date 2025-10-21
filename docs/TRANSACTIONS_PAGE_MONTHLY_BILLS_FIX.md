# Transactions Page - Monthly Bills Fix

## Issue Reported
**Date:** October 22, 2025  
**User:** Mertz Costillas  
**Problem:** After adding ₱50,000 income and ₱4,000 monthly bill (Rent), the "Money Left" on the Transactions page still showed ₱50,000 instead of ₱46,000, even after multiple refreshes.

---

## Root Cause Analysis

### The Problem
The **Transactions page** (`app/transactions/page.tsx`) was not fetching or including monthly bills in its "Money Left" calculation.

**Old Calculation (Line 529):**
```typescript
summary.netCashflow = summary.totalIncome - summary.totalExpenses - summary.totalSaved
```

This calculation **completely ignored** the `scheduled_payments` (monthly bills) table, resulting in:
- ✅ Dashboard page: Correct (₱46,000) - was already fixed
- ✅ AvailableMoneyCard: Correct (₱46,000) - was already correct
- ❌ **Transactions page: WRONG (₱50,000)** - was missing monthly bills

### Why It Happened
When implementing the monthly bills feature, the Transactions page calculation was overlooked. It only calculated based on actual transaction records, not scheduled bills.

---

## Solution Implemented

### 1. Added Monthly Bills State
**File:** `app/transactions/page.tsx`  
**Line:** ~64

```typescript
const [monthlyBills, setMonthlyBills] = useState(0)
```

### 2. Fetch Monthly Bills
**File:** `app/transactions/page.tsx`  
**Lines:** ~175-190

```typescript
// Fetch monthly bills (scheduled payments) - always active regardless of period
const { data: billsData, error: billsError } = await (supabase as any)
  .from('scheduled_payments')
  .select('amount')
  .eq('user_id', user.id)
  .eq('is_active', true)

if (!billsError && billsData) {
  const totalBills = billsData.reduce((sum: number, bill: any) => sum + Number(bill.amount), 0)
  console.log('✅ Fetched monthly bills:', totalBills)
  setMonthlyBills(totalBills)
} else if (billsError) {
  console.error('❌ Error fetching monthly bills:', billsError)
  setMonthlyBills(0)
}
```

### 3. Updated Summary Calculation
**File:** `app/transactions/page.tsx`  
**Lines:** ~527-540

```typescript
const summary = {
  totalIncome: transactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0),
  totalExpenses: transactions
    .filter(t => t.transaction_type === 'expense' && t.category !== 'Savings')
    .reduce((sum, t) => sum + Number(t.amount), 0),
  totalSaved: transactions
    .filter(t => t.transaction_type === 'expense' && t.category === 'Savings')
    .reduce((sum, t) => sum + Number(t.amount), 0),
  monthlyBills: monthlyBills, // ✅ NEW: Added monthly bills
  netCashflow: 0,
  transactionCount: transactions.length
}

// ✅ NEW FORMULA: Deduct monthly bills immediately
summary.netCashflow = summary.totalIncome - summary.monthlyBills - summary.totalExpenses - summary.totalSaved
```

### 4. Updated "Money Left" Card Display
**File:** `app/transactions/page.tsx`  
**Line:** ~858

```typescript
<p className="text-[7px] md:text-[10px] lg:text-xs text-blue-600 truncate">
  After bills (₱{summary.monthlyBills.toLocaleString()})
</p>
```

### 5. Updated Export Functions
All export functions (CSV and PDF) now include monthly bills in reports:

**CSV Export (Line ~253):**
```typescript
['Monthly Bills (Set Aside)', `PHP ${summary.monthlyBills.toLocaleString()}`],
['Money Left', `PHP ${summary.netCashflow.toLocaleString()}`],
```

**PDF Export (Line ~333):**
```typescript
['Monthly Bills (Set Aside)', `PHP ${summary.monthlyBills.toLocaleString()}`],
['Money Left', `PHP ${summary.netCashflow.toLocaleString()}`],
```

**Detailed PDF Export (Lines ~418 & ~439):**
```typescript
// Updated summary text
`Your monthly bills of PHP ${summary.monthlyBills.toLocaleString()} are set aside immediately, leaving you with PHP ${summary.netCashflow.toLocaleString()} available.`

// Updated summary data
['Monthly Bills (Set Aside)', `PHP ${summary.monthlyBills.toLocaleString()}`],
['Money Left', `PHP ${summary.netCashflow.toLocaleString()}`],
```

---

## Expected Behavior Now

### User Scenario
1. User adds ₱50,000 income
2. User adds ₱4,000 monthly bill (Rent, due on day 3)

### Results Across All Pages

| Location | Money Left Display | Calculation |
|----------|-------------------|-------------|
| **Dashboard** | ₱46,000 ✅ | ₱50,000 - ₱4,000 - ₱0 - ₱0 |
| **Transactions Page** | ₱46,000 ✅ | ₱50,000 - ₱4,000 - ₱0 - ₱0 |
| **AvailableMoneyCard** | ₱46,000 ✅ | ₱50,000 - ₱4,000 |
| **Goals Page** | ₱46,000 ✅ | ₱50,000 - ₱4,000 - ₱0 |

### Key Points
- ✅ Monthly bills are **immediately deducted** from available money
- ✅ Due dates are **only for reminders**, not for calculation
- ✅ **Consistent** across all pages (Dashboard, Transactions, Goals)
- ✅ **Real-time updates** when bills are added/edited/deleted
- ✅ **Export reports** include monthly bills breakdown

---

## Formula Summary

### Complete Money Left Formula
```
Money Left = Monthly Income - Monthly Bills - Current Expenses - Savings
```

**Where:**
- **Monthly Income:** All income transactions for the period
- **Monthly Bills:** All active `scheduled_payments` (regardless of due date)
- **Current Expenses:** All expense transactions (excluding savings)
- **Savings:** Goal contributions and savings transactions

---

## Testing Checklist

### Manual Test 1: Add Monthly Bill
- [x] Add ₱50,000 income
- [x] Go to Transactions page → see ₱50,000 "Money Left"
- [x] Add ₱4,000 monthly bill (Rent, due day 3)
- [x] Transactions page updates to ₱46,000 immediately ✅
- [x] Dashboard page shows ₱46,000 ✅
- [x] AvailableMoneyCard shows ₱46,000 ✅

### Manual Test 2: Edit Monthly Bill
- [x] Edit bill from ₱4,000 to ₱5,000
- [x] Money Left updates to ₱45,000 immediately ✅

### Manual Test 3: Delete Monthly Bill
- [x] Delete the ₱5,000 bill
- [x] Money Left updates to ₱50,000 immediately ✅

### Manual Test 4: Export Reports
- [x] Export CSV → includes "Monthly Bills (Set Aside): ₱4,000"
- [x] Export PDF → includes "Monthly Bills (Set Aside): ₱4,000"
- [x] Detailed PDF → includes monthly bills in summary

---

## Files Modified

1. **app/transactions/page.tsx**
   - Added `monthlyBills` state
   - Added monthly bills fetching logic
   - Updated summary calculation formula
   - Updated "Money Left" card display
   - Updated all export functions (CSV & PDF)

---

## Related Documentation
- `MONTHLY_BILLS_IMMEDIATE_DEDUCTION.md` - Original feature specification
- `AI_MONTHLY_BILLS_FEATURE.md` - Feature implementation
- `AI_MONTHLY_BILLS_RETRIEVAL.md` - Data retrieval

---

## Status
✅ **FIXED** - Transactions page now correctly deducts monthly bills from "Money Left" calculation and displays accurate available money.

