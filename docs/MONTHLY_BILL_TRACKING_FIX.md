# Monthly Bill Tracking Enhancement

## Date: October 11, 2025

## Issue

**Problem:** When users asked Fili to add monthly bills (recurring expenses), the tool wasn't being triggered properly or wasn't clear about what information was needed.

**User Reports:**
- "Add monthly bill if not working as well whenever I ask it to add a monthly bill"

## Root Cause

The `add_monthly_bill` tool existed and was implemented correctly, but:
1. The system prompt lacked explicit instructions on **when** to use this tool
2. No clear examples of the conversation flow for adding monthly bills
3. Tool description wasn't prominent enough with keywords that trigger it
4. Missing guidance on asking for required parameters (name, amount, category, due day)

## Solution

### 1. Added Dedicated Monthly Bill Section in System Prompt

**New section added after transaction flow (~line 1018):**

```typescript
**When to use add_monthly_bill:**
User mentions recurring monthly expenses, bills that repeat every month:
- "My rent is 8000 on the 5th"
- "I pay 2000 for electricity every month on the 10th"
- "My Netflix subscription is 500 monthly"
- "I have a 1500 insurance payment every 1st"
- "Set up my recurring bills"
- "Track my monthly subscriptions"

**Monthly Bill Flow:**
1. Acknowledge the recurring bill
2. **ASK** for missing required details:
   - Name (what bill)
   - Amount (how much)
   - Category (Housing, Utilities, Subscriptions, Transportation, Insurance, Other)
   - Due day (1-31)
3. Call add_monthly_bill tool
4. After success, provide:
   - Confirmation of bill added
   - Reminder about tracking
   - Total monthly obligations if applicable

Example:
User: "My rent is ₱8,000 on the 5th"
Response: "✓ Set up monthly rent bill of ₱8,000 due on day 5. I'll help you track this every month! This will remind you before it's due."

User: "I pay internet 1500 monthly"
Response: "Got it! When is your internet bill usually due each month? (day 1-31)"
User: "Every 15th"
Response: "✓ Set up monthly internet bill of ₱1,500 due on day 15 (Utilities category). You'll get reminders before it's due!"
```

### 2. Enhanced Tool Description

**Before:**
```typescript
description: "Add a recurring monthly bill for the user. Use when user mentions setting up automatic bills..."
```

**After:**
```typescript
description: "**USE THIS TOOL** when user mentions recurring monthly expenses, bills, or subscriptions that repeat every month. Keywords: 'my rent is', 'I pay [amount] every month', 'monthly subscription', 'recurring bill', 'set up bill', 'track my bills', 'electricity bill every', 'Netflix subscription'. Add a recurring monthly bill for the user..."
```

**Key Improvements:**
- Added **USE THIS TOOL** emphasis
- Listed specific keywords that should trigger the tool
- Made it more explicit about when to use

## Keywords That Trigger add_monthly_bill

### Explicit Keywords:
- "my rent is"
- "I pay [amount] every month"
- "monthly subscription"
- "recurring bill"
- "set up bill"
- "track my bills"
- "electricity bill every"
- "Netflix subscription"

### Context Phrases:
- "on the [date]" (indicates due date)
- "every month"
- "monthly"
- "recurring"
- "subscription"
- "automatic payment"

## Required Parameters

The tool requires these fields (will ask if missing):
1. **name**: Bill name (e.g., "Rent", "Electricity", "Netflix")
2. **amount**: Monthly bill amount in pesos
3. **category**: One of:
   - Housing (rent, mortgage)
   - Utilities (electric, water, internet)
   - Subscriptions (Netflix, Spotify, etc.)
   - Transportation (car payment, gas)
   - Insurance (health, car, life)
   - Other
4. **dueDay**: Day of month (1-31)

Optional:
- **description**: Additional notes
- **isActive**: Whether bill is active (defaults to true)

## Example Conversations

### Example 1: Complete Information Provided
```
User: "My rent is ₱8,000 on the 5th"
Fili: "✓ Set up monthly rent bill of ₱8,000 due on day 5. I'll help you track this every month! This will remind you before it's due."
```
✅ All info provided - tool executes immediately

### Example 2: Missing Due Date
```
User: "I pay ₱1,500 for internet monthly"
Fili: "Got it! When is your internet bill usually due each month? (day 1-31)"
User: "Every 15th"
Fili: "✓ Set up monthly internet bill of ₱1,500 due on day 15 (Utilities category). You'll get reminders before it's due!"
```
✅ Fili asks for missing due date

### Example 3: Multiple Bills
```
User: "Set up my bills: rent 8000 on 5th, electricity 2000 on 10th"
Fili: "Perfect! Let me set up both bills for you:
✓ Rent: ₱8,000 due on day 5 (Housing)
✓ Electricity: ₱2,000 due on day 10 (Utilities)

Your total monthly obligations: ₱10,000. I'll remind you before each due date!"
```
✅ Can handle multiple bills

### Example 4: Subscription
```
User: "I have Netflix for ₱500 monthly"
Fili: "Got it! When does Netflix charge you each month?"
User: "Around the 15th"
Fili: "✓ Set up Netflix subscription of ₱500 due on day 15 (Subscriptions). You'll be notified before renewal!"
```
✅ Works with subscriptions

## Categories Explained

| Category | Examples |
|----------|----------|
| **Housing** | Rent, mortgage, condo dues, property tax |
| **Utilities** | Electric, water, internet, phone, gas |
| **Subscriptions** | Netflix, Spotify, gym, software, cloud storage |
| **Transportation** | Car payment, car insurance, gas (if fixed), parking |
| **Insurance** | Health, life, car, home insurance |
| **Other** | Any other recurring monthly expense |

## API Endpoint

**Route:** `/api/monthly-bills/add`  
**Method:** POST  
**Table:** `scheduled_payments`

**Database Schema:**
```typescript
scheduled_payments {
  id: uuid
  user_id: uuid
  name: string
  amount: decimal
  category: string
  due_day: integer (1-31)
  description: text
  is_active: boolean
  created_at: timestamp
}
```

## Testing Scenarios

### Test Case 1: Rent
```
User: "My rent is ₱8,000 on the 5th"
Expected: ✓ Bill added (Housing, due day 5)
```

### Test Case 2: Utilities
```
User: "Electricity bill is ₱2,000 every 10th"
Expected: ✓ Bill added (Utilities, due day 10)
```

### Test Case 3: Subscription
```
User: "Add Netflix ₱500 monthly on the 15th"
Expected: ✓ Bill added (Subscriptions, due day 15)
```

### Test Case 4: Missing Info
```
User: "I pay ₱1,000 for water"
Expected: Fili asks "When is this due each month?"
User: "20th"
Expected: ✓ Bill added (Utilities, due day 20)
```

### Test Case 5: Invalid Due Day
```
User: "Rent is ₱8,000 on the 35th"
Expected: Fili asks "Due day must be between 1-31. When is your rent due?"
```

## Benefits

1. **Clear Triggering:** AI now recognizes monthly bill requests more reliably
2. **Guided Flow:** AI asks for missing required information
3. **Category Auto-Detection:** AI can infer category from context (rent → Housing, Netflix → Subscriptions)
4. **Confirmation:** User gets clear confirmation when bill is added
5. **Reminders:** System can remind users before bills are due
6. **Budget Planning:** Users can see total monthly obligations

## Related Features

- **get_financial_summary**: Shows all monthly bills with totals
- **Dashboard**: Displays upcoming bills due within 7 days
- **Monthly Bills Manager Component**: UI for managing bills

## Files Modified

1. **lib/langchain-agent.ts**
   - Added monthly bill flow section (~line 1018-1040)
   - Enhanced tool description (~line 1520)
   - Added clear examples and keywords

## Status
✅ COMPLETE - Monthly bill tracking flow enhanced with clear instructions and examples

## User Prompts That Now Work

- "My rent is ₱8,000 on the 5th"
- "I pay ₱1,500 for internet every 15th"
- "Add my Netflix subscription ₱500 monthly"
- "Track my electricity bill ₱2,000 on the 10th"
- "Set up my monthly bills"
- "I have insurance payment ₱1,500 on the 1st"
- "My water bill is ₱500 every 20th"
- "Add Spotify subscription ₱200 monthly"

All should now properly trigger the `add_monthly_bill` tool and create entries in the database! 🎯
