# AI Tools Not Working - Quick Fix Guide

## 🚨 Problem

**ALL four AI functions stopped working:**
- ❌ Creating financial goals
- ❌ Adding monthly bills  
- ❌ Adding income
- ❌ Adding expenses

**User reports:** "These were all working earlier, what is happening?"

---

## 🔍 Root Cause (Hypothesis)

**System prompt is TOO LONG** (~1300+ lines)

### Why This Breaks Tool Calling:

1. **Context Window Saturation**
   - System prompt: ~5,200 tokens (estimated)
   - Tools array: ~1,000 tokens
   - Messages: ~500 tokens
   - **Total: ~6,700 tokens** just for setup
   - This leaves limited space for AI to process and decide

2. **AI Attention Overload**
   - With 1300+ lines of instructions, the AI loses focus
   - Tool trigger keywords get buried in massive text
   - AI defaults to conversational responses instead of calling tools

3. **Recent Changes Made It Worse**
   - Added reflection advice triggers (50+ lines)
   - Added income detection enhancements (30+ lines)
   - Added multiple detailed examples (100+ lines)
   - Each addition pushed closer to breaking point

---

## ✅ Diagnostic Logging Added

I've added comprehensive logging to help identify the exact issue:

### What the Logs Will Show:

```
📏 TOKEN USAGE DIAGNOSTIC:
  System prompt: ~ X tokens
  Tools array: ~ Y tokens
  Messages: ~ Z tokens
  TOTAL ESTIMATED: ~ Total tokens
  Context limit (gpt-4o-mini): 128,000 tokens
  Usage: X.XX%

🔍 AI RESPONSE ANALYSIS:
  Tool calls present? [true/false]
  Number of tool calls: X
  Tools being called: [tool names]
  OR
  ⚠️ NO TOOLS CALLED - AI responded conversationally
  Response preview: [first 100 chars]
```

### How to Use the Logs:

1. **Open your terminal/console** where the Next.js app is running
2. **Send a test message** like "add 5000 as income"
3. **Look for the diagnostic output:**
   - If "NO TOOLS CALLED" appears → Prompt is overwhelming AI
   - If "Tool calls present? true" → Tools are being called, issue is elsewhere
   - If API errors appear → Configuration issue

---

## 🛠️ Solution: Reduce System Prompt

### Option 1: Quick Test (RECOMMENDED FIRST)

Create a minimal test prompt to verify hypothesis:

**File:** `lib/langchain-agent.ts` around line 1140

**Replace the massive system prompt with this minimal version:**

```typescript
const systemPrompt = `You are Fili - a Filipino financial assistant.

MISSION: Track money, set goals, build financial literacy.

PERSONALITY: Caring, practical, uses Taglish, firm about saving.

**CRITICAL TOOL TRIGGERS - ALWAYS CALL TOOLS:**

INCOME: "add [amount] as income" / "I received [amount]" / "I earned [amount]" → call add_income

EXPENSE: "I spent [amount]" / "I bought [amount]" / "paid [amount]" → call add_expense

GOAL: "I want to save [amount]" → ask deadline → call create_financial_goal

BILL: "my rent is [amount]" / "[amount] every month" → ask due day → call add_monthly_bill

SUMMARY: "what is my [data]" / "show my progress" / "give me advice" → call get_financial_summary

RULES:
1. ALWAYS call tools when triggered - don't just talk about it
2. ASK for missing required parameters only
3. Confirm after successful tool execution

OUT OF SCOPE: Politely refuse politics, religion, medical, legal topics.

${isNewUser ? '🎉 FIRST MESSAGE: Greet warmly, introduce yourself briefly, then help.' : ''}`
```

**Test This:**
1. Replace prompt with minimal version above
2. Test: "add 5000 as income"
3. Check console logs - are tools being called now?
4. If YES → Prompt length was the issue
5. If NO → Issue is elsewhere (API, database, network)

### Option 2: Gradual Reduction

If you don't want to test with minimal prompt, gradually reduce:

**Cut These Sections:**
- ❌ Extensive Filipino culture references (save for docs)
- ❌ Multiple redundant examples (keep 1 per tool max)
- ❌ Long framework explanations (summarize to bullets)
- ❌ Detailed reflection advice (keep triggers only)
- ❌ Repetitive instructions

**Target:** Reduce from 1300 lines to 300-400 lines maximum

---

## 📊 Next Steps

### Step 1: Run the App with Diagnostic Logging

```powershell
# In your terminal
npm run dev
```

### Step 2: Test Each Tool

```
Test 1: "add 5000 as income"
Test 2: "I spent 500 on food"  
Test 3: "I want to save 10000 for laptop"
Test 4: "my rent is 8000 on the 5th"
```

### Step 3: Check Console Output

Look for:
- Token usage percentages
- "Tool calls present?" status
- API errors (if any)
- Which tools are being called

### Step 4: Apply Fix Based on Results

**If logs show "NO TOOLS CALLED":**
→ System prompt is too long, apply minimal prompt test

**If logs show API errors:**
→ Check environment variables, API keys, endpoints

**If logs show tools being called but failing:**
→ Check API routes, Supabase connection, database

---

## 🎯 Expected Results

### After Applying Minimal Prompt:

```
User: "add 5000 as income"

Console Output:
📏 TOKEN USAGE DIAGNOSTIC:
  System prompt: ~ 800 tokens (DOWN from 5200!)
  Tools array: ~ 1000 tokens
  Messages: ~ 500 tokens
  TOTAL ESTIMATED: ~ 2300 tokens
  Usage: 1.80% (DOWN from 5.23%!)

🔍 AI RESPONSE ANALYSIS:
  Tool calls present? true ✅
  Number of tool calls: 1
  Tools being called: add_income ✅

🔧 Tool called: add_income { amount: 5000, userId: "xxx" }
✅ Income added: { ... }
📨 Final response: "✓ I've recorded your ₱5,000 income..."
```

---

## 📝 Documentation

**Full diagnostic report:** `docs/AI_TOOLS_DIAGNOSTIC.md`

**Includes:**
- Complete root cause analysis
- Code structure verification
- Token usage calculations
- Multiple solution approaches
- Testing procedures
- Prevention guidelines

---

## 🔧 Files Modified

1. **lib/langchain-agent.ts**
   - Added token usage diagnostic logging
   - Added AI response analysis logging
   - Added OpenAI API error logging

2. **docs/AI_TOOLS_DIAGNOSTIC.md**
   - Comprehensive 450-line diagnostic report
   - Root cause analysis
   - Multiple solutions
   - Testing procedures

---

## ⚡ TL;DR

**Problem:** AI tools stopped working (goal creation, bills, income, expenses)

**Likely Cause:** System prompt too long (1300+ lines) → AI can't process tool triggers

**Quick Fix:** 
1. Check console logs for diagnostic output
2. If "NO TOOLS CALLED" → Apply minimal prompt test
3. If tools work with minimal prompt → Gradually add back instructions (max 400 lines)

**Status:** 🔍 Diagnostic logging active, awaiting test results

---

**Created:** October 11, 2025  
**Priority:** 🚨 CRITICAL - Core functionality broken  
**Next Action:** Test with diagnostic logs to confirm hypothesis
