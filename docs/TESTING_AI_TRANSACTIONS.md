# Testing AI Transaction Management

## Quick Test Guide

### How to Test

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Go to AI Assistant page**:
   - Navigate to http://localhost:3000/ai-assistant
   - Make sure you're logged in

### Test Scenarios

#### 1. List All Transactions
**What to say**:
- "Show me my transactions"
- "List my expenses"  
- "What are my recent transactions?"

**Expected Result**:
```
Here are your recent transactions:

📥 Income (₱XX,XXX)
- ₱XXX - [Source] - [Category] - [Date]

📤 Expenses (₱XX,XXX)
- ₱XXX - [Merchant] - [Category] - [Date]
- ₱XXX - [Merchant] - [Category] - [Date]

Summary:
Total Income: ₱XXX
Total Expenses: ₱XXX  
Net Balance: ₱XXX
```

#### 2. Filter by Category
**What to say**:
- "Show my food expenses"
- "List my transportation costs"
- "What did I spend on bills?"

**Expected Result**:
AI will show only transactions from that specific category

#### 3. Edit a Transaction
**What to say**:
- "Edit my transaction"
- "Change the amount of my last expense"
- "Fix the category for my Jollibee purchase"

**Expected Flow**:
1. AI shows your recent transactions
2. AI asks which transaction to edit
3. You identify it (e.g., "the Jollibee one" or "number 1")
4. AI asks what to change
5. You say what to update (e.g., "change amount to 450")
6. AI updates and confirms the change

**Example Conversation**:
```
You: "Edit my transaction"

AI: "Sure! Let me show your recent transactions:
1. ₱500 - Jollibee - Food & Dining - Jun 15
2. ₱150 - Grab - Transportation - Jun 14
3. ₱200 - 7-Eleven - Shopping - Jun 13

Which transaction would you like to edit?"

You: "The Jollibee one"

AI: "What would you like to change? (amount, category, date, description, payment method)"

You: "Change amount to 450"

AI: "✓ Updated!
Before: ₱500 - Jollibee - Food & Dining
After: ₱450 - Jollibee - Food & Dining

Your food category total is now ₱X,XXX this month."
```

### What You Can Edit

When editing a transaction, you can change:
- **Amount**: "change amount to 450"
- **Category**: "change category to Shopping"
- **Merchant/Description**: "change description to McDonald's"
- **Date**: "change date to June 14"
- **Payment Method**: "change payment method to Cash"
- **Notes**: "add note: lunch with friends"
- **Type**: "change type to income" (if you made a mistake)

### Tips

1. **Be specific**: When identifying transactions, mention the amount or merchant
   - Good: "the 500 pesos Jollibee expense"
   - Good: "the Jollibee one"
   - Good: "number 1"

2. **Natural language works**: You don't need exact commands
   - "Show my transactions" ✓
   - "Can you list my expenses?" ✓
   - "What did I buy?" ✓
   - "Let me see what I spent" ✓

3. **Filter by date** (coming soon): 
   - "Show transactions from last week"
   - "What did I spend in May?"

### Troubleshooting

**Problem**: AI doesn't show transactions
- **Solution**: Make sure you have transactions in your account. Add some first from the Transactions page.

**Problem**: AI can't find the transaction to edit
- **Solution**: Be more specific about which transaction. Use the amount or merchant name.

**Problem**: Edit doesn't work
- **Solution**: Make sure you're using the correct transaction ID. Let AI show you the list first.

### Advanced Usage

#### Combine with Financial Summary
```
You: "Show me my transactions and give me advice"

AI: [Shows transactions]
    [Analyzes spending]
    [Provides personalized advice based on your data]
```

#### Check Category Totals
```
You: "How much did I spend on food?"

AI: [Shows food transactions]
    [Calculates total]
    [Compares to budget if available]
```

## Next Steps

After testing, you can:
1. View transactions on the Transactions page (http://localhost:3000/transactions)
2. Verify edits were saved correctly
3. Check if categories and amounts match what AI told you

## New Features Enabled

✅ List transactions via AI chat
✅ Filter transactions by category  
✅ Edit transaction amount
✅ Edit transaction category
✅ Edit transaction merchant/description
✅ Edit transaction date
✅ Edit transaction payment method
✅ Edit transaction notes
✅ Change transaction type (income/expense)
✅ Get transaction summary statistics
✅ Get spending insights from AI

## Date
December 2024
