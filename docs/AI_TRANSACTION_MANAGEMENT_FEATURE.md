# AI Transaction Management Feature

## Overview
The AI Assistant (Fili) can now list and edit transactions directly through conversation. Users can ask to see their transaction history and modify existing transactions without leaving the chat interface.

## New Features

### 1. List Transactions
**What it does**: Shows user's transaction history with filtering options

**Trigger phrases**:
- "Show me my transactions"
- "List my expenses"
- "What did I buy this month?"
- "Show my spending history"
- "What are my recent transactions?"
- "List all my income"
- "Show transactions for food category"

**Example interaction**:
```
User: "Show me my transactions"

AI: "Here are your recent transactions:

📥 **Income (₱25,000)**
- ₱25,000 - Salary from Company - Jun 1, 2025

📤 **Expenses (₱8,500)**
- ₱2,000 - Jollibee - Food & Dining - Jun 15
- ₱1,500 - Grab - Transportation - Jun 14  
- ₱5,000 - Bills Payment - Utilities - Jun 10

**Summary:**
Total Income: ₱25,000
Total Expenses: ₱8,500
Net Balance: ₱16,500

Your food spending (₱2,000) is within budget! Would you like tips on reducing transportation costs?"
```

**Features**:
- Shows up to 50 recent transactions by default
- Includes transaction type, amount, merchant, category, date
- Provides summary totals (income, expenses, net balance)
- Can filter by category, date range
- AI provides insights and observations

### 2. Edit/Update Transactions  
**What it does**: Allows users to modify existing transaction details

**Trigger phrases**:
- "Edit my transaction"
- "Change the amount to 500"
- "Update my last expense"
- "Fix the category for my Jollibee purchase"
- "Modify the date of my transaction"
- "Change the payment method"

**Example interaction**:
```
User: "Edit my transaction"

AI: "Sure! Let me show your recent transactions first:

1. ₱500 - Jollibee - Food & Dining - Jun 15
2. ₱150 - Grab - Transportation - Jun 14
3. ₱200 - 7-Eleven - Shopping - Jun 13

Which transaction would you like to edit?"

User: "The Jollibee one"

AI: "What would you like to change? (amount, category, date, description, payment method)"

User: "Change amount to 450"

AI: "✓ Updated!
Before: ₱500 - Jollibee - Food & Dining  
After: ₱450 - Jollibee - Food & Dining

Your food category total is now ₱1,950 this month."
```

**Updatable fields**:
- Amount
- Category
- Merchant/Description
- Date
- Payment method
- Notes
- Transaction type (income/expense)

## Technical Implementation

### New API Endpoints

#### 1. `/api/transactions/list` (POST)
**Purpose**: Fetch user's transactions with filtering

**Request body**:
```json
{
  "limit": 50,
  "offset": 0,
  "category": "food",  // optional
  "startDate": "2025-01-01",  // optional
  "endDate": "2025-12-31"  // optional
}
```

**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "transaction_type": "expense",
      "amount": 500,
      "merchant": "Jollibee",
      "category": "Food & Dining",
      "date": "2025-06-15",
      "payment_method": "GCash",
      "notes": "Lunch"
    }
  ],
  "summary": {
    "totalIncome": 25000,
    "totalExpenses": 8500,
    "netIncome": 16500,
    "transactionCount": 10
  },
  "categoryBreakdown": {
    "Food & Dining": { "count": 5, "total": 2000 },
    "Transportation": { "count": 3, "total": 1500 }
  }
}
```

#### 2. `/api/transactions/update` (POST)
**Purpose**: Update an existing transaction

**Request body**:
```json
{
  "transactionId": "uuid",
  "amount": 450,  // optional
  "category": "Food & Dining",  // optional
  "merchant": "Jollibee Updated",  // optional
  "date": "2025-06-15",  // optional
  "paymentMethod": "Cash",  // optional
  "notes": "Updated notes",  // optional
  "transactionType": "expense"  // optional
}
```

**Response**:
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "amount": 450,
    "merchant": "Jollibee Updated",
    "category": "Food & Dining",
    "date": "2025-06-15",
    "payment_method": "Cash",
    "notes": "Updated notes",
    "transaction_type": "expense"
  },
  "message": "Transaction updated successfully"
}
```

### AI Agent Tools

#### Tool: `list_transactions`
**Function**: Fetch and display transaction history

**Parameters**:
- `category` (optional): Filter by category
- `startDate` (optional): Start date in YYYY-MM-DD
- `endDate` (optional): End date in YYYY-MM-DD  
- `limit` (optional): Max transactions to return (default: 50)

**When AI calls this**:
- User asks to see transactions
- User requests spending history
- User wants to review specific category
- Before editing a transaction (to show options)

#### Tool: `update_transaction`
**Function**: Modify existing transaction

**Parameters**:
- `transactionId` (required): ID of transaction to update
- `amount` (optional): New amount
- `category` (optional): New category
- `merchant` (optional): New description
- `date` (optional): New date in YYYY-MM-DD
- `paymentMethod` (optional): New payment method
- `notes` (optional): New notes
- `transactionType` (optional): Change to income/expense

**When AI calls this**:
- User wants to edit a transaction
- User wants to fix an error
- User wants to update details

## Security Features

1. **Authentication Required**: Both endpoints require Bearer token authentication
2. **User Isolation**: Transactions are filtered by `user_id` - users can only see/edit their own
3. **RLS Protection**: Supabase Row Level Security ensures data isolation
4. **Service Role Access**: AI uses service role key for database queries (bypasses RLS when needed)

## Usage Flow

### Listing Transactions
1. User asks: "Show my transactions"
2. AI calls `list_transactions` tool
3. AI receives transaction data + summary
4. AI formats response in readable format
5. AI provides insights (e.g., "You're within budget for food")

### Editing Transactions
1. User asks: "Edit my transaction"
2. AI calls `list_transactions` to show recent transactions
3. AI asks which transaction to edit
4. User identifies transaction (by amount, date, or merchant)
5. AI asks what to change
6. User specifies changes
7. AI calls `update_transaction` with transaction ID + updates
8. AI confirms change with before/after comparison

## Benefits

1. **Convenience**: No need to leave chat to manage transactions
2. **Natural Language**: Edit transactions by describing them naturally
3. **Context-Aware**: AI provides insights while showing transactions
4. **Quick Fixes**: Easily correct mistakes or update details
5. **Financial Insights**: AI analyzes spending patterns while listing transactions

## Future Enhancements

Potential additions:
- Delete transaction via AI
- Bulk update transactions
- Search transactions by keywords
- Export transactions to CSV/PDF via AI command
- Set up recurring transactions via AI
- Transaction categorization suggestions from AI

## Files Modified

1. **lib/langchain-agent.ts**
   - Added `list_transactions` tool definition
   - Added `update_transaction` tool definition
   - Added case handlers for both tools
   - Updated system prompt with transaction management guidelines

2. **app/api/transactions/list/route.ts** (NEW)
   - POST endpoint for fetching transactions
   - Filtering by category, date range
   - Summary statistics calculation
   - Category breakdown

3. **app/api/transactions/update/route.ts** (NEW)
   - POST endpoint for updating transactions
   - Validates user ownership
   - Partial updates (only provided fields)
   - Returns updated transaction

## Testing

### Test List Transactions
```
User: "Show me my transactions"
Expected: AI shows recent transactions with summary

User: "Show my food expenses"
Expected: AI filters and shows only food category transactions

User: "What did I spend last month?"
Expected: AI shows transactions from last month with totals
```

### Test Update Transaction
```
User: "Edit my transaction"
Expected: AI shows recent transactions and asks which to edit

User: "Change the amount to 450"
Expected: AI updates transaction amount and confirms change

User: "Fix the category to Shopping"
Expected: AI updates category and shows updated transaction
```

## Date
December 2024

## Related Features
- Add transaction (existing)
- Financial summary (existing)
- Monthly bills tracking (existing)
- Transaction page UI (existing - components/EditTransactionModal.tsx)
