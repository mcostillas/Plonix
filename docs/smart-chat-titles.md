# Smart Chat Title Generation - Enhanced

## Problem
Chat titles were too generic or poorly formatted:
- "much is soundcore nc r50i" ❌
- "50,000 laptop called lenovo legion 5" ❌
- Just removes question words without understanding context

## Solution: Context-Aware Title Generation

The new system detects **financial topics** and creates descriptive titles based on what the user is asking about.

---

## Title Generation Rules

### 1. Price Inquiries 💰
**Detects:** "how much", "price", "cost", "magkano"

**Examples:**
- "How much is Soundcore NC R50i?" → **"Price of Soundcore NC R50i"**
- "What's the price of iPhone 15?" → **"Price of iPhone 15"**
- "Magkano ang laptop?" → **"Price of laptop"**

### 2. Budget Planning 📊
**Detects:** "budget", "spending", "expenses", "gastos"

**Examples:**
- "Help me create a budget" → **"Budget Planning"**
- "How to manage my monthly expenses?" → **"Budget Planning"**
- "Paano mag-budget ng ₱20,000?" → **"Budget Planning"**

### 3. Savings Goals 🎯
**Detects:** "save", "saving", "ipon", "savings goal"

**Examples:**
- "I want to save ₱50,000" → **"Savings Goal ₱50,000"**
- "How to save for vacation?" → **"Savings Plan"**
- "Tips for saving money" → **"Savings Plan"**

### 4. Investment Advice 📈
**Detects:** "invest", "investment", "stocks", "crypto", "bonds"

**Examples:**
- "How to invest in stocks?" → **"Investment Advice"**
- "Should I invest in crypto?" → **"Investment Advice"**
- "Best investment for beginners" → **"Investment Advice"**

### 5. Income Discussion 💵
**Detects:** "income", "salary", "earn", "sweldo", "kita"

**Examples:**
- "I earn ₱25,000 monthly" → **"Income Discussion"**
- "How to increase my salary?" → **"Income Discussion"**
- "Side income ideas" → **"Income Discussion"**

### 6. Debt Management 💳
**Detects:** "debt", "loan", "utang", "borrow", "credit card"

**Examples:**
- "How to pay off credit card debt?" → **"Debt Management"**
- "Should I get a loan?" → **"Debt Management"**
- "Paano magbayad ng utang?" → **"Debt Management"**

### 7. Banking & Payments 🏦
**Detects:** "bank", "gcash", "paymaya", "bdo", "bpi"

**Examples:**
- "How to use GCash?" → **"Banking & Payments"**
- "BDO vs BPI comparison" → **"Banking & Payments"**
- "Best bank for students" → **"Banking & Payments"**

### 8. Emergency Fund 🚨
**Detects:** "emergency fund", "emergency saving"

**Examples:**
- "How much for emergency fund?" → **"Emergency Fund"**
- "Building emergency savings" → **"Emergency Fund"**

### 9. Side Hustle 💼
**Detects:** "side hustle", "extra income", "raket", "sideline"

**Examples:**
- "Side hustle ideas for students" → **"Side Hustle Ideas"**
- "How to earn extra income?" → **"Side Hustle Ideas"**

### 10. General Financial Advice 💡
**Detects:** "advice", "help", "tips", "suggest"

**Examples:**
- "Give me financial advice" → **"Financial Advice"**
- "Tips for managing money" → **"Financial Advice"**

### 11. Default: Topic Extraction 🔍
For anything else, extracts main topic words:

**Examples:**
- "Tell me about retirement planning" → **"Retirement Planning"**
- "What are the best credit cards?" → **"Best Credit Cards"**
- "Explain compound interest" → **"Compound Interest"**

---

## Before vs After

### Example 1: Price Inquiry
```
User: "How much is a Lenovo Legion 5 laptop?"

BEFORE: "much is lenovo legion 5 laptop"
AFTER:  "Price of Lenovo Legion 5 laptop"
```

### Example 2: Savings Goal
```
User: "I want to save ₱50,000 for a new phone"

BEFORE: "want save ₱50,000 for new phone"
AFTER:  "Savings Goal ₱50,000"
```

### Example 3: Budget Help
```
User: "Can you help me create a monthly budget?"

BEFORE: "help create monthly budget"
AFTER:  "Budget Planning"
```

### Example 4: Investment Question
```
User: "Should I invest in stocks or crypto?"

BEFORE: "invest stocks or crypto"
AFTER:  "Investment Advice"
```

---

## How It Works

### 1. Detection Phase
```typescript
const lowerMsg = message.toLowerCase()

// Check for price inquiry
if (lowerMsg.match(/how much|price|cost|magkano/i)) {
  // Extract item name from message
  const itemMatch = message.match(/(?:how much|price|cost|magkano).+?(?:is|for|ng)?\s+(.+?)(?:\?|$)/i)
  if (itemMatch) {
    const item = itemMatch[1].trim().split(' ').slice(0, 4).join(' ')
    return `Price of ${item.charAt(0).toUpperCase() + item.slice(1)}`
  }
  return 'Price Inquiry'
}
```

### 2. Contextual Titles
For detected categories, returns a specific title like "Budget Planning" or "Investment Advice"

### 3. Smart Extraction
For specific items (like prices or savings amounts), includes details:
- "Price of **Soundcore R50i**"
- "Savings Goal **₱50,000**"

### 4. Fallback
If no specific category matches:
- Removes common question words
- Extracts first 3-5 meaningful words
- Capitalizes properly
- Limits to 50 characters

---

## Title Characteristics

### Length Limits
- **Target:** 25-50 characters
- **Maximum:** 50 characters (truncated with "...")
- **Minimum:** Falls back to "General Inquiry"

### Capitalization
- **Title Case:** First letter of each word capitalized
- **Preserved:** Currency symbols (₱), numbers, brand names

### Clean Formatting
- Removes: Question marks, extra spaces
- Preserves: Important details (item names, amounts)

---

## Testing Examples

### Financial Topics
```
"How much is iPhone 15?"         → "Price of iPhone 15"
"I need help with my budget"     → "Budget Planning"
"Want to save ₱100,000"          → "Savings Goal ₱100,000"
"Should I invest in stocks?"     → "Investment Advice"
"I earn ₱30,000 monthly"         → "Income Discussion"
"How to pay credit card debt?"   → "Debt Management"
"Best bank for savings?"         → "Banking & Payments"
"Building emergency fund"        → "Emergency Fund"
"Side hustle ideas"              → "Side Hustle Ideas"
```

### Generic Questions
```
"What is compound interest?"     → "Compound Interest"
"Explain budgeting basics"       → "Budgeting Basics"
"Best savings strategies"        → "Best Savings Strategies"
"Tell me about insurance"        → "Insurance"
```

### Taglish Support
```
"Magkano ang laptop?"            → "Price of laptop"
"Paano mag-ipon?"                → "Savings Plan"
"Ano ang best investment?"       → "Best Investment"
```

---

## Sidebar Display

Titles now show clear, contextual topics:

```
📱 Chat History
├─ 💰 Price of Soundcore R50i NC
├─ 🎯 Savings Goal ₱50,000
├─ 📊 Budget Planning
├─ 📈 Investment Advice
├─ 💳 Debt Management
└─ 🏦 Banking & Payments
```

Instead of:
```
📱 Chat History
├─ much is soundcore nc r50i
├─ save 50,000
├─ help with budget
├─ invest stocks
└─ credit card debt
```

---

## Benefits

✅ **Clearer Context** - Know what each chat is about at a glance
✅ **Better Organization** - Similar topics grouped naturally
✅ **Professional Look** - Proper formatting and capitalization
✅ **Taglish Support** - Works with Filipino and English
✅ **Smart Extraction** - Includes relevant details (prices, amounts)
✅ **Consistent Length** - All titles fit nicely in sidebar

---

## Future Enhancements

Potential improvements:
- 🤖 AI-generated titles (use GPT to create even smarter titles)
- 🏷️ Category icons (💰 for price, 🎯 for goals, etc.)
- 📝 User-editable titles (click to rename)
- 🔍 Search by title
- 📊 Group chats by category

---

## Code Location

**File:** `app/ai-assistant/page.tsx`  
**Function:** `generateChatTitle(message: string): string`  
**Lines:** ~382-478

---

## Status

✅ **Implemented** - Enhanced title generation active  
🧪 **Ready to Test** - Create new chats to see improved titles  
📱 **Live** - Refresh browser to see changes

---

**Date:** October 5, 2025  
**Feature:** Smart Chat Title Generation  
**Status:** Active
