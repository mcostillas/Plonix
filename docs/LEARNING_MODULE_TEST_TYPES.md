# Learning Module Test Types

## Overview
The admin learning module management system now supports **5 different test types** in the Apply section, allowing for more diverse and engaging assessments.

## Available Test Types

### 1. Multiple Choice (default)
**Use Case**: Testing knowledge with clear options  
**Format**: Question with 4 answer choices (A, B, C, D)

**Example**:
- Question: "What percentage should you save according to the 50-30-20 rule?"
- Options:
  - A. 10%
  - B. 20% ✓
  - C. 30%
  - D. 50%

**Best For**:
- Concept verification
- Decision-making scenarios
- Financial calculations with specific options

---

### 2. True or False
**Use Case**: Quick concept checks and fact verification  
**Format**: Statement with True/False options

**Example**:
- Statement: "The 50-30-20 rule means 50% for needs, 30% for wants, and 20% for savings"
- Answer: True ✓

**Best For**:
- Verifying understanding of definitions
- Confirming facts
- Quick comprehension checks

---

### 3. Fill in the Blank
**Use Case**: Testing specific knowledge recall  
**Format**: Sentence with a missing word/number (marked with ___)

**Example**:
- Question: "You should save ___ percent of your income according to the 50-30-20 rule"
- Answer: 20

**Best For**:
- Testing specific numbers/percentages
- Key term recall
- Formula components

---

### 4. Scenario-Based Question
**Use Case**: Real-world application and decision making  
**Format**: Detailed scenario + question with 4 contextual options

**Example**:
- Scenario: "Jana earns ₱15,000 monthly. Her rent is ₱4,000, food ₱3,000, wants ₱5,000, and she saves ₱3,000..."
- Question: "What should Jana do to improve her financial situation?"
- Options: (4 detailed scenario-specific choices)

**Best For**:
- Practical application
- Complex decision making
- Real-world problem solving

---

### 5. Calculation/Math Problem
**Use Case**: Testing computational skills  
**Format**: Math problem requiring calculation

**Example**:
- Question: "If you earn ₱15,000 and want to save 20%, how much should you save?"
- Answer: ₱3,000

**Best For**:
- Budget calculations
- Percentage problems
- Financial math practice

---

## How to Use in Admin Panel

### Creating a Module

1. **Navigate to Admin → Learning Modules**
2. **Click "Create New Module"**
3. **Fill in Basic Info** (Title, Description, etc.)
4. **Go to "Apply" Tab**
5. **Select Test Type** from the dropdown:
   - Multiple Choice (4 options)
   - True or False
   - Fill in the Blank
   - Scenario-Based Question
   - Calculation/Math Problem

### Dynamic Form Behavior

The form automatically adjusts based on selected test type:

- **Multiple Choice & Scenario-Based**: Shows options textarea (4 lines)
- **True/False**: Shows options textarea (2 lines - True/False)
- **Fill in Blank & Calculation**: Hides options field (answer goes directly in correct answer)

### Field Descriptions

Each field shows contextual help text based on the test type:

**Question/Task Field**:
- Multiple Choice: "What should Jana allocate for savings?"
- True/False: "Statement to verify"
- Fill Blank: "Sentence with ___ for the blank"
- Calculation: "Math problem with clear numbers"

**Correct Answer Field**:
- Multiple Choice/Scenario: "Must match one option exactly"
- True/False: "Either True or False"
- Fill Blank: "The exact word/number"
- Calculation: "The calculated result (include ₱ if needed)"

---

## AI Generator Integration

The AI module generator now supports all test types:

1. **Select your preferred test type** before generating
2. **Click "AI Generate"** button
3. AI will create content matching your chosen test format

**How it works**:
- Test type is passed to GPT-4
- AI generates appropriate question format
- Options are auto-populated (or left empty for fill-blank/calculation)
- Correct answer follows the test type format

---

## Database Schema

**Table**: `learning_module_content`  
**New Column**: `test_type`

```sql
test_type TEXT DEFAULT 'multiple_choice'
CHECK (test_type IN ('multiple_choice', 'true_false', 'fill_blank', 'scenario_based', 'calculation'))
```

### Migration Script
Run: `scripts/add-test-type-to-modules.sql`

---

## Best Practices

### Test Type Selection Guide

| Learning Objective | Recommended Test Type |
|-------------------|----------------------|
| Recall specific numbers/percentages | Fill in the Blank |
| Verify understanding of facts | True or False |
| Test decision-making skills | Scenario-Based |
| Practice calculations | Calculation/Math |
| General knowledge check | Multiple Choice |

### Content Creation Tips

1. **Multiple Choice**:
   - Make all options plausible
   - Avoid "all of the above" or "none of the above"
   - Include common misconceptions as distractors

2. **True/False**:
   - Keep statements clear and unambiguous
   - Avoid double negatives
   - Test one concept per statement

3. **Fill in Blank**:
   - Make the blank unambiguous
   - Accept reasonable variations (AI can help validate)
   - Use ___ to mark the blank clearly

4. **Scenario-Based**:
   - Use realistic Filipino contexts
   - Include relevant details
   - Make options reflect real choices

5. **Calculation**:
   - Provide all needed numbers
   - Be clear about units (₱, %, etc.)
   - Round answers appropriately

---

## Student Experience

Students will see different interfaces based on test type:

- **Multiple Choice/Scenario**: Radio buttons with 4 options
- **True/False**: Two large buttons (True/False)
- **Fill Blank**: Text input field
- **Calculation**: Number input field (with ₱ symbol if relevant)

All types show:
- ✓ Correct feedback with explanation
- ✗ Incorrect feedback with the right answer
- Detailed explanation after submission

---

## Analytics

Track which test types are most effective:

- Completion rates by test type
- Average score by test type
- Time spent per test type
- User feedback on difficulty

*Future enhancement: Test type analytics in admin dashboard*

---

## Examples by Module

### Budgeting Module
- **Test Type**: Calculation
- **Why**: Students need to practice actual budget calculations

### Saving Module
- **Test Type**: Multiple Choice
- **Why**: Teaching different saving strategies and options

### Investment Module
- **Test Type**: Scenario-Based
- **Why**: Investment decisions require real-world context

### Banking Module
- **Test Type**: True/False
- **Why**: Verifying understanding of banking concepts

---

## Summary

The test type feature provides:
- ✅ **5 diverse assessment formats**
- ✅ **Dynamic form with contextual help**
- ✅ **AI generator support**
- ✅ **Better learning outcomes**
- ✅ **Engaging student experience**

Choose the test type that best matches your learning objectives for maximum educational impact!
