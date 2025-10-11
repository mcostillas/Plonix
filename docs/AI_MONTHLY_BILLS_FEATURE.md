# AI Monthly Bills Feature

## Overview
The AI assistant (Fili) can now automatically add and manage recurring monthly bills for users through natural conversation.

## Implementation Date
October 11, 2025

## Components Created

### 1. API Endpoint
**File**: `app/api/monthly-bills/add/route.ts`

**Purpose**: Handle monthly bill creation requests from the AI agent

**Endpoint**: `POST /api/monthly-bills/add`

**Request Body**:
```json
{
  "userId": "user-uuid",
  "name": "Rent",
  "amount": 8000,
  "category": "Housing",
  "dueDay": 5,
  "description": "Monthly apartment rent",
  "isActive": true
}
```

**Validations**:
- userId is required
- name, amount, category, dueDay are required
- amount must be positive number
- dueDay must be between 1-31
- category must be one of: Housing, Utilities, Subscriptions, Transportation, Insurance, Other

**Response**:
```json
{
  "success": true,
  "message": "Monthly bill \"Rent\" added successfully. It will be due on day 5 of each month.",
  "bill": { /* bill object */ }
}
```

### 2. AI Agent Tool
**File**: `lib/langchain-agent.ts`

**Tool Name**: `add_monthly_bill`

**Description**: Allows the AI to add recurring monthly bills when users mention them in conversation

**Parameters**:
- `name` (required): Bill name
- `amount` (required): Monthly amount
- `category` (required): Bill category
- `dueDay` (required): Day of month (1-31)
- `description` (optional): Additional details
- `isActive` (optional): Whether bill is active (default: true)

**Categories Supported**:
1. **Housing**: Rent, mortgage
2. **Utilities**: Electricity, water, internet, gas
3. **Subscriptions**: Netflix, Spotify, gym, magazines
4. **Transportation**: Car payment, gas, parking
5. **Insurance**: Health insurance, car insurance
6. **Other**: Miscellaneous recurring bills

## Usage Examples

### Natural Language Examples

**Example 1: Basic rent bill**
```
User: "My rent is 8000 every 5th of the month"
AI: → Calls add_monthly_bill({name: "Rent", amount: 8000, category: "Housing", dueDay: 5})
    → "✓ Set up monthly rent bill of ₱8,000 due on day 5. I'll help you track this every month!"
```

**Example 2: Utility bill**
```
User: "I pay 3000 for electricity on the 15th"
AI: → Calls add_monthly_bill({name: "Electricity", amount: 3000, category: "Utilities", dueDay: 15})
    → "✓ Added your ₱3,000 electricity bill due on day 15. This will be tracked monthly!"
```

**Example 3: Subscription**
```
User: "Netflix charges me 549 on the 1st"
AI: → Calls add_monthly_bill({name: "Netflix", amount: 549, category: "Subscriptions", dueDay: 1})
    → "✓ Netflix subscription tracked! ₱549 due on day 1 each month."
```

**Example 4: Multiple bills**
```
User: "I have rent 8000 on the 5th, internet 1500 on the 10th, and Netflix 549 on the 1st"
AI: → Calls add_monthly_bill three times
    → "✓ Added all your monthly bills:
       - Rent: ₱8,000 (day 5)
       - Internet: ₱1,500 (day 10)  
       - Netflix: ₱549 (day 1)
       Total monthly bills: ₱10,049"
```

## Integration with Existing System

### Database Table
Uses existing `scheduled_payments` table:
```sql
CREATE TABLE scheduled_payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Frontend Display
Bills are displayed in:
- **Transactions Page**: MonthlyBillsManager component
- Shows all bills with toggle active/inactive
- Shows total monthly bill amount
- Allows manual editing and deletion

## AI Prompt Updates

Added to system prompt:
```
**Monthly Bills:**
- Use add_monthly_bill when user mentions recurring expenses
- Examples: rent, electricity, water, internet, phone, Netflix, Spotify, insurance
- Automatically set up bills so they're tracked every month
- Categories: Housing, Utilities, Subscriptions, Transportation, Insurance, Other
- Ask for due day (1-31) if not mentioned
```

## Tool Execution Flow

1. User mentions a recurring expense in chat
2. AI detects it's a monthly bill
3. AI extracts: name, amount, category, due day
4. AI calls `add_monthly_bill` function
5. Function calls API endpoint `/api/monthly-bills/add`
6. API validates and saves to database
7. API returns success/error
8. AI receives result and informs user
9. User sees bill in MonthlyBillsManager component

## Error Handling

### Invalid Category
```
Error: "Invalid category. Must be one of: Housing, Utilities, Subscriptions, Transportation, Insurance, Other"
```

### Invalid Due Day
```
Error: "Due day must be between 1 and 31"
```

### Invalid Amount
```
Error: "Amount must be a positive number"
```

### Missing Required Fields
```
Error: "Missing required fields: name, amount, category, and dueDay are required"
```

## Testing Scenarios

### Test 1: Single Bill
- Input: "My rent is 8000 on the 5th"
- Expected: Bill created with correct details

### Test 2: Multiple Bills
- Input: "I have rent 8000, Netflix 549, and internet 1500"
- Expected: AI asks for due dates, then creates all bills

### Test 3: Variations
- "I pay 3000 for electricity every 15th"
- "Netflix subscription is 549 monthly"
- "Set up my internet bill 1500 pesos"

### Test 4: Auto-Category Detection
- "My rent" → Housing
- "Electricity bill" → Utilities
- "Netflix" → Subscriptions
- "Car insurance" → Insurance

## Future Enhancements

1. **Automatic Reminders**: Notify users X days before due date
2. **Auto-Payment**: Automatically create expense transactions on due date
3. **Bill History**: Track payment history for each bill
4. **Bill Prediction**: Predict utility bills based on past amounts
5. **Bill Splitting**: Split bills with roommates
6. **Recurring Patterns**: Learn patterns (e.g., "every first Friday")

## Benefits

### For Users
- ✅ Natural language bill setup
- ✅ No manual form filling
- ✅ Quick conversation-based tracking
- ✅ AI remembers all their bills
- ✅ Automatic monthly tracking

### For Developers
- ✅ Reuses existing scheduled_payments table
- ✅ Clean API architecture
- ✅ Proper validation and error handling
- ✅ Easy to extend with new categories

## Related Files
- `app/api/monthly-bills/add/route.ts` - API endpoint
- `lib/langchain-agent.ts` - AI tool implementation
- `components/MonthlyBillsManager.tsx` - Frontend display
- `app/transactions/page.tsx` - Page that shows bills

## Notes
- Bills are tied to user_id for security
- Default isActive = true
- Amount stored as numeric in database
- Category names are normalized (capitalized)
- Due day validation prevents invalid dates
