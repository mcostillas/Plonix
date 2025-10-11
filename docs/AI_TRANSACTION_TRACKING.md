# AI Transaction Tracking Implementation

## Overview
Added the ability for the AI assistant (Fili) to automatically track user's expenses and income through natural conversation.

## What Was Added

### 1. API Endpoint: `/api/transactions/add`
**File:** `app/api/transactions/add/route.ts`

**Features:**
- Creates transactions (income or expense) in the database
- Uses service role key to bypass RLS
- Auto-detects categories and payment methods
- Validates required fields
- Returns success confirmation

**Required Fields:**
- `userId` (UUID)
- `amount` (number)
- `transactionType` ('income' or 'expense')

**Optional Fields:**
- `merchant` (where money was spent/received from)
- `category` (auto-detected if not provided)
- `paymentMethod` (gcash, maya, card, bank, cash - auto-detected)
- `notes` (additional details)
- `date` (YYYY-MM-DD format, defaults to today)

**Category Auto-Detection:**

*Income Categories:*
- salary, freelance, business, investment, gift, other-income

*Expense Categories:*
- food, transportation, bills, shopping, entertainment, health, education, personal-care, housing, debt, other

**Payment Method Auto-Detection:**
- Detects from merchant/notes: gcash, maya, card, bank, cash
- Defaults to 'cash' if not detected

### 2. AI Tools Added

**Tool: `add_expense`**
- Triggered when user mentions spending money
- Examples: "I spent 500 on food", "I bought a phone for 15000", "Grabbed lunch for 150"
- Automatically records expense in database
- Provides financial insight after recording

**Tool: `add_income`**
- Triggered when user mentions receiving money
- Examples: "I got paid 20000", "Received 5000 from freelance", "My salary came in"
- Automatically records income in database
- Reminds user to save 20% for taxes/emergency fund

### 3. OpenAI Function Definitions
Added function definitions for:
- `add_expense` - with parameters for amount, merchant, category, paymentMethod, notes, date
- `add_income` - with parameters for amount, merchant (source), category, paymentMethod, notes, date

### 4. System Prompt Updates
Added transaction tracking framework to both system prompts:
- When to trigger expense tracking
- When to trigger income tracking
- How to respond after recording
- Examples of natural conversation flows

### 5. Tool Execution Logic
Added switch cases in `langchain-agent.ts`:
- `case "add_expense"` - handles expense creation
- `case "add_income"` - handles income creation
- Both use userId from userContext automatically
- Error handling and logging included

## How It Works

**User Flow Example - Expense:**
```
User: "I spent 500 pesos on jollibee"
AI: 
  1. Detects spending mentioned
  2. Calls add_expense tool
  3. API auto-detects: category=food, paymentMethod=cash, merchant=Jollibee
  4. Records in database
  5. Responds: "✓ Recorded ₱500 expense at Jollibee in food category. Packing lunch could save you ₱100-200 per meal!"
```

**User Flow Example - Income:**
```
User: "I received my 25000 salary today"
AI:
  1. Detects income mentioned
  2. Calls add_income tool
  3. API auto-detects: category=salary, paymentMethod=bank
  4. Records in database
  5. Responds: "✓ Recorded ₱25,000 salary! Set aside 20% (₱5,000) for savings. Want help creating a budget plan?"
```

## Natural Language Triggers

**Expense Triggers:**
- "I spent [amount]"
- "I bought [item]"
- "I paid [amount] for [thing]"
- "Grabbed [item] for [amount]"
- "Purchased [item]"

**Income Triggers:**
- "I got paid [amount]"
- "I received [amount]"
- "I earned [amount]"
- "My salary came in"
- "Freelance payment of [amount]"

## Benefits

1. **Automatic Tracking** - Users don't need to manually add transactions
2. **Natural Conversation** - Just mention spending/earning in chat
3. **Smart Detection** - AI figures out category and payment method
4. **Financial Insights** - Get advice after each transaction
5. **Complete History** - All transactions saved to database
6. **Integrated Budgeting** - Transactions feed into budget analysis

## Testing

To test the feature:
1. Say: "I spent 200 pesos on lunch at jollibee"
2. AI should confirm transaction was recorded
3. Check your Transactions page to verify it appears
4. Try income: "I got paid 15000 today"
5. Check Transactions page again

## Technical Notes

- Uses same Supabase service role key as goal creation
- Transactions table RLS must be disabled or have proper policies
- Auto-detection uses keyword matching (can be improved with AI later)
- Timestamps use Philippine timezone
- Amount validation ensures positive numbers only
- Transaction type validation ensures only 'income' or 'expense'

## Future Enhancements

Possible improvements:
1. Add receipt scanning capability
2. Recurring transaction detection
3. Budget alerts when overspending
4. Category spending summaries
5. Export transactions to Excel/CSV
6. Bill reminder integration
7. Split transaction for shared expenses
8. Multi-currency support
