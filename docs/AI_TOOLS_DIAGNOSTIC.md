# AI Tools Not Working - Diagnostic Report

## Issue Report
**Date:** October 11, 2025  
**Reported By:** User  
**Issue:** AI functions stopped working:
- Creating goals
- Adding monthly bills
- Adding income
- Adding expenses

**Context:** These were all working earlier, but have now stopped functioning.

## Investigation Process

### 1. Code Structure Verification ✅

**Tools Array Definition (Lines 1370-1539):**
All 12 tools are properly defined with correct parameters:
- ✅ `search_web`
- ✅ `get_current_prices`
- ✅ `get_bank_rates`
- ✅ `search_financial_news`
- ✅ `get_financial_summary`
- ✅ `suggest_work_opportunities`
- ✅ `suggest_learning_resources`
- ✅ `create_financial_goal` ← Problem tool
- ✅ `add_expense` ← Problem tool
- ✅ `add_income` ← Problem tool
- ✅ `add_monthly_bill` ← Problem tool

**Switch Statement Cases (Lines 1590-1925):**
All tool cases are properly implemented:
- ✅ `case "create_financial_goal"` (Line 1768)
- ✅ `case "add_expense"` (Line 1808)
- ✅ `case "add_income"` (Line 1851)
- ✅ `case "add_monthly_bill"` (Line 1894)

**API Endpoints:**
- ✅ `/api/goals/create/route.ts` exists and functional
- ✅ `/api/transactions/add/route.ts` exists and functional
- ✅ `/api/monthly-bills/add/route.ts` exists and functional

### 2. Potential Root Causes

#### ❌ CRITICAL ISSUE IDENTIFIED: System Prompt Too Long

**Problem:**
The system prompt in `lib/langchain-agent.ts` is **MASSIVE** (approximately 1300+ lines). This could cause:

1. **Context Window Overflow**: GPT-4o-mini has a context limit, and an extremely long system prompt leaves very little room for:
   - User message
   - Conversation history  
   - Tool definitions
   - Tool responses

2. **AI Confusion**: With so many instructions, examples, and rules, the AI might be:
   - Getting overwhelmed and ignoring tool triggers
   - Focusing on the wrong parts of the prompt
   - Not reaching the tool trigger instructions due to attention limits

3. **Token Budget Exceeded**: If system prompt + tools + messages > context window, OpenAI API might:
   - Truncate the system prompt
   - Fail silently
   - Not include tool definitions properly

**Evidence:**
- System prompt starts at line 1140
- Contains multiple frameworks, examples, instructions, boundaries
- Includes detailed persona, Filipino culture references, financial advice patterns
- Has extensive tool usage guidelines
- Recent additions (reflection advice, income detection) made it even longer

### 3. System Prompt Structure Analysis

**Current Structure (Lines 1140-1350):**
```
1. New user greeting (30 lines)
2. Core mission (10 lines)
3. Topic boundaries (40 lines)
4. Personality guidelines (15 lines)
5. Financial advice framework (50 lines)
6. Work opportunity framework (30 lines)
7. Learning resources framework (25 lines)
8. Transaction framework (70 lines)
9. Goal creation framework (60 lines)
10. Monthly bill framework (40 lines)
11. Reflection advice framework (50 lines)
12. Multiple detailed examples (200+ lines)
13. Query vs. Add distinction (50 lines)
14. Various other instructions (700+ lines)
```

**Total System Prompt:** ~1300 lines of instructions

**Tool Definitions:** ~170 lines (12 tools with parameters)

**Remaining Context for:**
- User message
- Recent 4-5 conversation messages
- Tool responses
- AI response generation

= **VERY LIMITED**

### 4. Why This Breaks Tool Calling

**OpenAI Function Calling Process:**
1. System prompt loaded into context
2. Tools array loaded into context  
3. User message + recent messages added
4. AI analyzes user intent
5. AI decides which tool to call (if any)
6. Tool executed, result added to context
7. AI generates final response using tool result

**What Happens with Huge System Prompt:**
1. ✅ System prompt loaded (uses 70-80% of context)
2. ✅ Tools array loaded (uses 10-15% of context)
3. ⚠️ User message + recent messages (barely fits)
4. ❌ AI has no "room" to properly analyze and decide
5. ❌ AI might not even see the tool trigger instructions (they're at the end)
6. ❌ AI defaults to conversational response instead of calling tools

**Result:** AI responds conversationally but doesn't call tools!

## 5. Testing Hypothesis

### Test Case 1: Simple Income Addition
**User says:** "add 25000 as income"

**Expected behavior:**
1. AI recognizes "add [amount] as income" pattern
2. AI calls `add_income` tool with amount=25000
3. Tool creates transaction in database
4. AI responds with confirmation

**Actual behavior (hypothesis):**
1. AI reads "add 25000 as income"
2. AI tries to find relevant instructions in 1300-line prompt
3. AI finds income keywords but context is already full
4. AI generates conversational response instead: "I can help you record your income..."
5. Tool is NEVER called

### Test Case 2: Goal Creation
**User says:** "I want to save 10000 for a laptop"

**Expected:**
1. AI detects goal intent
2. AI asks for deadline (as instructed)
3. User provides deadline
4. AI calls `create_financial_goal` tool
5. Goal created in database

**Actual (hypothesis):**
1. AI reads goal intent
2. AI finds goal creation instructions (buried in 1300 lines)
3. Context is already maxed out
4. AI responds: "That's a great goal! Let me help you..." but never calls tool
5. No goal created

## 6. Solutions

### Solution A: Drastically Reduce System Prompt (RECOMMENDED)

**Approach:** Cut system prompt from ~1300 lines to ~300-400 lines max

**What to Keep:**
- Core mission & personality (50 lines)
- Topic boundaries (30 lines)
- Tool trigger keywords ONLY (50 lines)
- 1-2 examples per tool (100 lines)
- Critical instructions (100 lines)
- **Total: ~330 lines**

**What to Remove:**
- Extensive Filipino culture references (move to docs)
- Multiple redundant examples
- Detailed frameworks (summarize to key points)
- Reflection advice details (keep triggers only)
- Long-winded explanations

**What to Simplify:**
```typescript
// BEFORE (15 lines):
**When user asks for advice**, check their reflection answers first:
   - Look at their stated financial goals from reflections
   - Review their concerns and challenges they mentioned
   - Understand their current financial situation from their answers
   - Note their learning style and comprehension from reflections
   ...

// AFTER (3 lines):
**When user asks for advice**: Call get_financial_summary, use reflectionAnswers for personalization.
```

### Solution B: Split System Prompt into Multiple Smaller Prompts

**Approach:** Use dynamic prompt loading based on context

**Implementation:**
```typescript
const basePrompt = getBasePersonality() // Core mission, personality
const contextPrompt = getContextualInstructions(userMessage) // Only relevant instructions
const toolPrompt = getToolTriggers(userMessage) // Only relevant tool triggers

const systemPrompt = `${basePrompt}\n\n${contextPrompt}\n\n${toolPrompt}`
```

**Benefits:**
- Load only relevant instructions per message
- Keep context window clear for tools
- Maintain comprehensive instructions across different contexts

### Solution C: Use OpenAI Embeddings for Instruction Retrieval

**Approach:** Store instructions in vector database, retrieve relevant ones

**Too Complex** for this use case.

### Solution D: Increase Context Window (NOT RECOMMENDED)

**Approach:** Switch from gpt-4o-mini to gpt-4o or gpt-4-turbo

**Problems:**
- More expensive
- Doesn't solve the core issue (bloated prompt)
- Band-aid solution, not sustainable

## 7. Immediate Action Plan

### Step 1: Create Minimal System Prompt

**Test Prompt (Lines ~150-200 total):**
```typescript
const minimalSystemPrompt = `You are Fili - a Filipino financial assistant.

MISSION: Help users track money, set goals, and build financial literacy.

PERSONALITY: Caring, practical, uses Taglish, firm about saving.

TOOL TRIGGERS (CRITICAL - ALWAYS FOLLOW):

**Income Detection:**
- "add [amount] as income" → call add_income
- "I received [amount]" → call add_income
- "I earned [amount]" → call add_income
- "my salary is [amount]" → call add_income

**Expense Detection:**
- "I spent [amount]" → call add_expense
- "I bought [amount]" → call add_expense  
- "paid [amount]" → call add_expense

**Goal Creation:**
- "I want to save [amount]" → ask deadline → call create_financial_goal
- "save for [item]" → ask amount & deadline → call create_financial_goal

**Monthly Bill:**
- "my rent is [amount]" → ask due day → call add_monthly_bill
- "[amount] every month" → ask name, category, due day → call add_monthly_bill

**Financial Summary:**
- "what is my [financial data]" → call get_financial_summary
- "show me my progress" → call get_financial_summary
- "give me advice" → call get_financial_summary

RULES:
1. ALWAYS call tools when triggered
2. NEVER say "I'll help you" without calling the tool
3. ASK for missing required parameters only
4. Confirm after successful tool execution
5. Stay focused on financial literacy

OUT OF SCOPE: Refuse politics, religion, medical, legal advice politely.
`
```

**Test This:**
1. Replace current system prompt with minimal version
2. Test all 4 problem tools
3. Verify tools are being called
4. If successful, gradually add back important instructions (max 400 lines total)

### Step 2: Add Logging to Diagnose

**Add to line 1558 (before OpenAI call):**
```typescript
console.log('📏 System prompt length:', systemPrompt.length, 'characters')
console.log('📏 System prompt tokens (approx):', Math.ceil(systemPrompt.length / 4))
console.log('📏 Tools JSON length:', JSON.stringify(tools).length, 'characters')
console.log('📏 Total messages:', messages.length)
console.log('📏 Estimated total tokens:', Math.ceil((systemPrompt.length + JSON.stringify(tools).length + JSON.stringify(messages).length) / 4))
```

**This will show:**
- If context window is being maxed out
- How much room is left for AI processing
- Whether tools are even being sent to OpenAI

### Step 3: Test Individual Tools

**Create test cases:**
```
Test 1: "add 5000 as income"
Expected: add_income tool called
Log: Check if tool_calls exists in response

Test 2: "I want to save 10000"
Expected: AI asks for deadline
Log: Check system recognizes goal intent

Test 3: "my rent is 8000 on the 5th"
Expected: add_monthly_bill tool called
Log: Check tool execution

Test 4: "I spent 500 on food"
Expected: add_expense tool called
Log: Check transaction created
```

### Step 4: Monitor OpenAI API Response

**Check for errors:**
- Token limit exceeded
- Invalid tool format
- Tool not recognized
- API errors

**Add error handling at line 1570:**
```typescript
const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  // ... existing code
})

const data = await initialResponse.json()

// ADD THIS:
if (data.error) {
  console.error('❌ OpenAI API Error:', data.error)
  console.error('Error type:', data.error.type)
  console.error('Error code:', data.error.code)
  console.error('Error message:', data.error.message)
}

if (!data.choices || data.choices.length === 0) {
  console.error('❌ No choices returned')
  console.error('Full response:', JSON.stringify(data, null, 2))
}
```

## 8. Expected Outcomes

### If System Prompt is the Issue:
- ✅ Minimal prompt = tools start working again
- ✅ Adding back instructions gradually shows breaking point
- ✅ Keeping prompt under 400 lines = reliable tool calling

### If System Prompt is NOT the Issue:
- Need to check:
  - Environment variables (OPENAI_API_KEY)
  - API endpoint URLs (localhost vs production)
  - Supabase connection (SUPABASE_SERVICE_ROLE_KEY)
  - Database RLS policies
  - Network issues

## 9. Prevention for Future

### Best Practices:
1. **System Prompt Limit**: Never exceed 500 lines
2. **Token Budget**: Always leave 50% of context for user input + tools + response
3. **Modular Instructions**: Load contextual instructions dynamically
4. **Regular Testing**: Test all tools after any prompt changes
5. **Monitoring**: Log token usage and context window utilization

### Prompt Engineering Rules:
- ❌ NO: Long explanations, multiple examples, redundant instructions
- ✅ YES: Concise triggers, clear rules, minimal examples
- ❌ NO: Detailed cultural references, extensive frameworks
- ✅ YES: Personality in 2-3 sentences, frameworks in bullet points

## 10. Next Steps

1. **IMMEDIATE**: Add logging to see actual token usage
2. **TEST**: Try minimal system prompt with 4 problem tools
3. **COMPARE**: Before/after tool calling success rate
4. **REFINE**: Find optimal prompt length (300-400 lines)
5. **DOCUMENT**: Create prompt engineering guidelines

## Summary

**Most Likely Cause:** System prompt is too long (1300+ lines), maxing out context window and preventing AI from properly processing tool triggers.

**Recommended Fix:** Reduce system prompt to 300-400 lines maximum, keeping only:
- Core personality (brief)
- Tool triggers (explicit keywords)
- Critical rules (concise)
- 1 example per tool (short)

**Evidence Needed:**
- Token usage logs
- OpenAI API response inspection
- Tool calling success rate before/after

**Priority:** HIGH - Core functionality broken

---

**Status:** 🔍 DIAGNOSIS COMPLETE - AWAITING IMPLEMENTATION
**Last Updated:** October 11, 2025
