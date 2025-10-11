# Learning Reflections - Quick Setup Guide

## What This Feature Does
Every time a user completes a learning module reflection, their answers are saved to the database. The AI assistant then reads these reflections to provide personalized advice based on what the user learned, their goals, and their challenges.

## Setup Steps

### 1. Create Database Table
Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content from:
-- docs/learning-reflections-schema.sql
```

Or directly:
```sql
CREATE TABLE IF NOT EXISTS learning_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('learn', 'apply', 'reflect')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  module_title TEXT,
  step_number INTEGER,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'concerned', 'motivated', 'confused')),
  extracted_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_reflections_user_id ON learning_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_reflections_module_id ON learning_reflections(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_reflections_created_at ON learning_reflections(created_at DESC);

ALTER TABLE learning_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on learning_reflections" ON learning_reflections FOR ALL USING (true);
```

### 2. Test the Feature

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Log in to your account** (required for reflections to save)

3. **Go to Learning Hub:**
   - Navigate to `/learning`
   - Click on any module (e.g., "Budgeting Mastery")

4. **Complete the Reflect phase:**
   - Go through Learn → Apply steps
   - When you reach Reflect, answer at least 2 questions
   - Type meaningful responses (20+ characters)
   - You'll see: "✓ Your reflection has been saved and will help the AI understand you better"

5. **Test AI Integration:**
   - Open the AI Assistant (floating button)
   - Ask something related to your reflection
   - Example: "How can I stick to my budget?"
   - AI should reference your learning module completion and reflections

### 3. Verify Database

Check if reflections are being saved:

```sql
-- In Supabase SQL Editor
SELECT 
  module_title,
  question,
  answer,
  sentiment,
  extracted_insights,
  created_at
FROM learning_reflections
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Check AI Context

The AI now includes learning reflections in its context. You can verify by:
1. Completing a module reflection
2. Chatting with AI about that topic
3. AI should mention or reference your module completion

## How It Works (User Perspective)

### Before
- User completes learning modules
- User chats with AI
- AI has no knowledge of what user learned
- User has to re-explain their situation each time

### After
- User completes learning modules
- Reflections auto-save to database
- User chats with AI
- AI knows:
  - Which modules user completed
  - User's goals mentioned in reflections
  - Challenges user is facing
  - User's financial situation
  - User's sentiment (motivated, concerned, etc.)
- AI provides personalized advice referencing their learning journey

## Example

**User completes Budgeting module, reflects:**
> "I want to save ₱30,000 for emergency fund using 50-30-20 rule with my ₱15,000 monthly allowance."

**Database saves:**
- Question & Answer
- Extracted goals: ["emergency fund"]
- Extracted amounts: ["₱30,000", "₱15,000"]
- Sentiment: "motivated"
- Topics: ["budgeting", "saving"]

**Later, user chats with AI:**
> User: "How can I save money?"

**AI responds:**
> "Hey! I see you completed the Budgeting Mastery module and mentioned wanting to save ₱30,000 for an emergency fund using the 50-30-20 rule with your ₱15,000 allowance. That's awesome! Here's how to make it work..."

## Files Changed

1. **Database Schema:**
   - `docs/learning-reflections-schema.sql` - New table

2. **API Endpoint:**
   - `app/api/learning-reflections/route.ts` - New API

3. **Frontend:**
   - `app/learning/[topicId]/page.tsx` - Auto-save reflections

4. **AI Memory:**
   - `lib/ai-memory.ts` - Read & use reflections

5. **Documentation:**
   - `docs/LEARNING_REFLECTIONS_AI_INTEGRATION.md` - Full docs
   - `docs/LEARNING_REFLECTIONS_SETUP.md` - This file

## Troubleshooting

### Reflections Not Saving
- ✅ Check if user is logged in (required)
- ✅ Check browser console for errors
- ✅ Verify Supabase table exists
- ✅ Check network tab for API call to `/api/learning-reflections`

### AI Not Using Reflections
- ✅ Complete at least one module reflection first
- ✅ Check if `getLearningReflections` returns data
- ✅ Verify AI context includes "Learning Journey & Reflections" section
- ✅ Check console logs for AI memory retrieval

### TypeScript Errors
- ✅ Run `npm run build` to check for errors
- ✅ Ensure all types are properly imported
- ✅ Check `lib/ai-memory.ts` for method definitions

## Next Steps

After verifying the feature works:

1. **Monitor Usage:**
   - Check how many reflections are being saved
   - Review extracted insights for accuracy
   - Improve sentiment detection keywords

2. **Improve AI Prompts:**
   - Refine how AI references reflections
   - Add more context about learning progress
   - Test different phrasings

3. **Add Analytics:**
   - Track completion rates
   - Monitor which modules get most reflections
   - Identify common themes

4. **User Feedback:**
   - Ask users if AI feels more personalized
   - Check if AI correctly references their learning
   - Improve based on feedback

## Benefits Summary

✅ **For Users:**
- AI remembers what they learned
- No need to repeat information
- More personalized advice
- Connected learning experience

✅ **For Platform:**
- Richer user profiles
- Better AI responses
- Engagement tracking
- Data-driven improvements

---

**Status:** Ready to test! 🚀

Just run the database migration and start using the learning modules while logged in.
