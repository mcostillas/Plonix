# AI Monthly Bills Data Retrieval

## Overview
Enhanced the `get_financial_summary` tool to include monthly bills (recurring scheduled payments) data, enabling Fili to provide comprehensive budgeting advice that accounts for both one-time transactions and recurring financial obligations.

## Why This Enhancement?

**Problem:**
- AI could only see one-time income/expense transactions
- Could not account for recurring monthly bills in budgeting advice
- Could not answer "What are my monthly bills?" or "How much are my fixed expenses?"
- Incomplete financial picture led to less accurate savings recommendations

**Solution:**
- Added scheduled_payments table query to get_financial_summary tool
- Calculate total monthly obligations and categorize by type
- Identify upcoming bills for payment reminders
- Include monthly bills in comprehensive budget advice

## Database Structure

Monthly bills are stored in the `scheduled_payments` table:

```typescript
scheduled_payments {
  id: uuid
  user_id: uuid (FK to users)
  name: string           // e.g., "Apartment Rent"
  amount: decimal        // e.g., 8000.00
  category: string       // Housing, Utilities, Subscriptions, Transportation, Insurance, Other
  due_day: integer       // 1-31 (day of month)
  description: text      // Optional notes
  is_active: boolean     // Default true
  created_at: timestamp
}
```

## Implementation Details

### 1. Query Monthly Bills (`lib/langchain-agent.ts` ~line 408)

```typescript
// Fetch monthly bills (scheduled payments)
const { data: monthlyBills, error: billsError } = await supabase
  .from('scheduled_payments')
  .select('*')
  .eq('user_id', queryData.userId)
  .order('due_day', { ascending: true })

if (billsError) {
  console.error('❌ Error fetching monthly bills:', billsError)
}
```

### 2. Calculate Statistics (~line 497)

```typescript
// Calculate monthly bills statistics
const activeBills = monthlyBills?.filter(b => b.is_active) || []
const totalMonthlyObligation = activeBills.reduce((sum, b) => sum + (b.amount || 0), 0)

// Group bills by category
const billsByCategory = activeBills.reduce((acc: any, b) => {
  const category = b.category || 'Other'
  if (!acc[category]) {
    acc[category] = { count: 0, total: 0, bills: [] }
  }
  acc[category].count++
  acc[category].total += b.amount
  acc[category].bills.push({
    name: b.name,
    amount: b.amount,
    dueDay: b.due_day
  })
  return acc
}, {})

// Get upcoming bills (next 7 days)
const today = new Date().getDate()
const upcomingBills = activeBills.filter(b => {
  const daysUntilDue = b.due_day - today
  return daysUntilDue >= 0 && daysUntilDue <= 7
}).map(b => ({
  name: b.name,
  amount: b.amount,
  category: b.category,
  dueDay: b.due_day,
  daysUntil: b.due_day - today
}))
```

### 3. Return Data Structure

```typescript
monthlyBills: {
  total: 4,                          // Total number of active bills
  totalMonthlyAmount: 12000,         // Total monthly obligation
  byCategory: {                      // Bills grouped by category
    Housing: {
      count: 1,
      total: 8000,
      bills: [{ name: "Apartment Rent", amount: 8000, dueDay: 5 }]
    },
    Utilities: {
      count: 2,
      total: 2000,
      bills: [
        { name: "Electric Bill", amount: 1500, dueDay: 10 },
        { name: "Water Bill", amount: 500, dueDay: 10 }
      ]
    },
    // ... other categories
  },
  upcoming: [                        // Bills due in next 7 days
    { name: "Health Insurance", amount: 1500, category: "Insurance", dueDay: 1, daysUntil: 2 }
  ],
  allBills: [                        // All active bills
    { name: "Apartment Rent", amount: 8000, category: "Housing", dueDay: 5, description: null },
    // ... all other bills
  ]
}
```

## AI Usage Examples

### Example 1: Checking Monthly Bills

**User:** "What are my monthly bills?"

**AI Response:**
```
Here are your monthly bills:

🏠 **Housing (₱8,000)**
- Apartment Rent: ₱8,000 (due 5th)

⚡ **Utilities (₱2,000)**
- Electric Bill: ₱1,500 (due 10th)
- Water Bill: ₱500 (due 10th)

📱 **Subscriptions (₱500)**
- Netflix: ₱500 (due 15th)

🛡️ **Insurance (₱1,500)**
- Health Insurance: ₱1,500 (due 1st)

**Total Monthly Obligation: ₱12,000**

💡 Upcoming bills (next 7 days):
- Health Insurance: ₱1,500 (due in 2 days)

Would you like to set reminders for these bills?
```

### Example 2: Budgeting with Monthly Bills

**User:** "Can I afford to save ₱5,000 per month?"

**AI Process:**
1. Calls `get_financial_summary({userId: "user-id"})`
2. Receives:
   - Income: ₱25,000
   - One-time expenses: ₱8,000
   - Monthly bills: ₱12,000
   - Balance: ₱17,000

**AI Response:**
```
Let me check your monthly obligations first:

💰 **Monthly Breakdown:**
- Income: ₱25,000
- Fixed Bills: ₱12,000 (rent, utilities, subscriptions)
- Variable Expenses: ~₱8,000 (food, transport)
- Remaining: ₱5,000

Perfect! You can absolutely save ₱5,000/month. That's exactly what's left after your bills and expenses!

Your budget follows the 50-30-20 rule:
- 48% Needs (fixed bills)
- 32% Wants (variable expenses)
- 20% Savings (₱5,000) ✓

Great financial planning!
```

### Example 3: Comprehensive Financial Overview

**User:** "How am I doing overall?"

**AI Response includes monthly bills:**
```
Great question! Let me give you a complete picture:

💰 **Financial Health:**
- Total Income: ₱25,000
- Total Expenses: ₱8,000
- Current Balance: ₱17,000
- Monthly Bills: 4 bills totaling ₱12,000/month

📊 **Budget Breakdown:**
- Fixed Bills: ₱12,000 (48%)
- Variable Expenses: ₱8,000 (32%)
- Available: ₱5,000 (20%)

🎯 **Goals Progress:**
- 2 out of 3 goals active
- You've saved ₱3,000 towards your ₱10,000 target (30%)

📚 **Learning Progress:**
- Completed 8 out of 16 modules (50%)

🏆 **Challenges:**
- 2 active challenges
- 3 challenges completed

What would you like to focus on next?
```

## System Prompt Updates

Added monthly bills to the AI's query framework:

```markdown
**MONTHLY BILLS DATA:**
- "What are my monthly bills?"
- "How much do I owe each month?"
- "When are my bills due?"
- "What's my recurring expenses?"
- "Show my subscriptions"
- "What bills do I have?"
- "How much are my fixed expenses?"

**COMBINED DATA:**
- "Can I afford to save [amount]?"
- "How much money is left after bills?"
```

## Tool Description Update

Updated get_financial_summary description:
```typescript
"**CRITICAL: Use this tool when user asks about their current income, expenses, 
balance, financial totals, goals progress, learning progress, challenges, or 
monthly bills.** Fetches comprehensive user data including: transactions, goals, 
learning modules completed, active challenges, and scheduled monthly bills."
```

## Benefits

1. **Complete Financial Picture:**
   - AI now sees both one-time transactions AND recurring obligations
   - Can calculate true discretionary income (income - bills - expenses)

2. **Better Budgeting Advice:**
   - Knows fixed vs. variable expenses
   - Can recommend realistic savings amounts
   - Accounts for upcoming bill payments

3. **Payment Reminders:**
   - Identifies bills due within 7 days
   - Can proactively remind users about upcoming payments

4. **Budget Analysis:**
   - Categorizes bills by type (Housing, Utilities, etc.)
   - Shows spending patterns in fixed expenses
   - Helps identify areas for potential cost reduction

5. **50-30-20 Rule Validation:**
   - Can accurately calculate Needs (fixed bills) vs. Wants (variable expenses)
   - Provides personalized budget recommendations

## User Queries That Now Work

✅ "What are my monthly bills?"
✅ "How much do I owe each month?"
✅ "When is my rent due?"
✅ "Show my subscriptions"
✅ "What are my recurring expenses?"
✅ "Can I afford to save ₱X after bills?"
✅ "How much money is left after my fixed expenses?"
✅ "What bills are due this week?"
✅ "How much do I spend on housing per month?"
✅ "Should I cut down on subscriptions?"

## Related Features

- **Add Monthly Bill:** Users can add bills via `add_monthly_bill` tool
- **Monthly Bills Manager:** Component at `components/MonthlyBillsManager.tsx`
- **API Endpoint:** `app/api/monthly-bills/add/route.ts`
- **Scheduled Payments:** Database table for storing recurring bills

## Technical Notes

- Bills are ordered by `due_day` (ascending) for chronological display
- Only `is_active: true` bills are included in calculations
- Upcoming bills calculated based on current day of month
- Categories match the official bill categories in the API
- Total monthly obligation is sum of all active bill amounts

## Testing Scenarios

1. **User with multiple bills:**
   - Verify all bills returned correctly
   - Check category grouping
   - Confirm total monthly amount calculation

2. **User with upcoming bills:**
   - Verify upcoming bills filter (next 7 days)
   - Check daysUntil calculation
   - Test edge cases (end of month, beginning of month)

3. **Budgeting advice:**
   - Test "Can I afford to save?" with bills included
   - Verify 50-30-20 breakdown accounts for bills
   - Check recommendations consider fixed obligations

4. **Edge cases:**
   - User with no bills (empty array handling)
   - Bills on same day (multiple utilities)
   - Inactive bills (should be filtered out)

## Date Implemented
October 11, 2025

## Status
✅ COMPLETE - Monthly bills data fully integrated into AI financial summary tool
