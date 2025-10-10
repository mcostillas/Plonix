# Test Prompts for Learning Resources Feature

## 🧪 Use these prompts to test the new learning resources feature

### ✅ Test Case 1: General Freelancing Interest
**Prompt:**
```
I want to do freelancing but I'm not really good at it
```

**Expected Response:**
- AI should detect lack of skills
- Call `suggest_learning_resources` tool
- Suggest beginner-friendly skills (VA, Content Writing, Social Media)
- Provide 3-5 resources per skill with clickable links
- Mention earning potential and learning timeline

---

### ✅ Test Case 2: Specific Skill Request
**Prompt:**
```
Where can I learn graphic design?
```

**Expected Response:**
- AI should call `suggest_learning_resources("graphic design")`
- Return 5-6 graphic design resources
- Include: Canva tutorials, design courses, free tools
- Show difficulty levels and durations
- Mention ₱1,000-5,000 per project earning potential

---

### ✅ Test Case 3: Multiple Skill Comparison
**Prompt:**
```
What's easier to learn: video editing or content writing?
```

**Expected Response:**
- AI should compare both skills
- Call `suggest_learning_resources` for both
- Compare learning times (2-4 months vs 2-3 months)
- Compare earning potential
- Provide resources for both options

---

### ✅ Test Case 4: Goal-Oriented Learning
**Prompt:**
```
I need to earn ₱20,000 in 3 months but I don't have any skills. What should I learn?
```

**Expected Response:**
- AI should calculate: ₱20K ÷ 3 months = ₱7K/month
- Suggest fast-learning skills (VA, Tutoring, Social Media)
- Provide realistic timeline:
  - Month 1: Learn
  - Month 2: Apply + first client
  - Month 3: Reach goal
- Include learning resources with links

---

### ✅ Test Case 5: Lack of Specific Skill
**Prompt:**
```
I want to be a web developer but I don't know coding
```

**Expected Response:**
- AI should detect interest in web development
- Call `suggest_learning_resources("web development")`
- Provide beginner resources:
  - freeCodeCamp
  - The Odin Project
  - HTML/CSS tutorials
  - JavaScript courses
- Mention 6-12 month learning timeline
- Show ₱2,000-10,000 per project potential

---

### ✅ Test Case 6: Quick Money Need
**Prompt:**
```
What's the fastest skill I can learn to start earning money?
```

**Expected Response:**
- AI should suggest immediate-start skills:
  - Virtual Assistant (1-2 months)
  - Online Tutoring (immediate if qualified)
  - Social Media Management (1-2 months)
- Provide learning resources for top recommendation
- Emphasize realistic expectations

---

### ✅ Test Case 7: Mobile-Friendly Learning
**Prompt:**
```
I only have a phone. What can I learn with just a smartphone?
```

**Expected Response:**
- Suggest mobile-friendly skills:
  - Social Media Management (Canva mobile)
  - Video Editing (CapCut)
  - Content Writing (Google Docs)
  - Online Tutoring (Zoom mobile)
- Provide mobile app recommendations
- Include mobile-compatible learning resources

---

### ✅ Test Case 8: Zero Budget Learning
**Prompt:**
```
I have no money to spend on courses. Where can I learn for free?
```

**Expected Response:**
- AI should emphasize FREE resources
- Suggest completely free options:
  - YouTube tutorials
  - freeCodeCamp
  - Google Digital Garage
  - HubSpot Academy (free certs)
- Mention all resources are free
- No paid course recommendations

---

### ✅ Test Case 9: Follow-up After Suggestion
**First prompt:**
```
I want to learn freelancing
```
**Then follow up with:**
```
Tell me more about content writing
```

**Expected Response:**
- AI should remember context from first prompt
- Provide detailed content writing resources
- Include:
  - YouTube tutorials (Ahrefs, HubSpot)
  - Tools (Hemingway, Grammarly)
  - Free courses with certificates
  - Earning breakdown (₱500-2,000/article)

---

### ✅ Test Case 10: Skill for Specific Goal
**Prompt:**
```
I need a side hustle that I can do after my 9-5 job. What should I learn?
```

**Expected Response:**
- Suggest flexible-schedule skills:
  - Content Writing (work anytime)
  - Graphic Design (project-based)
  - Social Media Management (schedule posts)
  - Video Editing (async work)
- Provide learning resources
- Mention time management tips
- Connect to evening/weekend learning schedule

---

## 🔍 What to Check in Responses

### ✅ Quality Checklist
- [ ] AI calls `suggest_learning_resources` tool
- [ ] Resources include **clickable links** (formatted as `**[Name](URL)**`)
- [ ] Shows earning potential (e.g., "₱X-Y per month/project/hour")
- [ ] Mentions learning timeline (e.g., "2-3 months to proficiency")
- [ ] Prioritizes FREE resources
- [ ] Includes difficulty levels (Beginner/Intermediate/Advanced)
- [ ] Provides 3-5 resources per skill
- [ ] Connects learning to financial goals
- [ ] Encourages action with clear next steps
- [ ] Maintains financial literacy focus

---

## 🚫 Negative Test Cases (Should NOT trigger learning resources)

### ❌ Test Case 1: Already Has Skills
**Prompt:**
```
I'm a graphic designer, where can I find clients?
```
**Expected:** Work platform suggestions, NOT learning resources

---

### ❌ Test Case 2: Just Asking for Jobs
**Prompt:**
```
Show me freelancing websites
```
**Expected:** Work platforms list, NOT learning resources

---

### ❌ Test Case 3: General Question
**Prompt:**
```
What is freelancing?
```
**Expected:** Definition/explanation, NOT automatic learning resources

---

## 📊 Response Time Check
- Tool call should complete in < 3 seconds
- Resources should be formatted properly
- Links should be valid and clickable
- No duplicate resources in single response

---

## 🎯 Success Criteria

A successful implementation will:
1. ✅ Detect when user lacks skills and wants to learn
2. ✅ Call the `suggest_learning_resources` tool automatically
3. ✅ Return relevant, high-quality resources
4. ✅ Format links as clickable Markdown
5. ✅ Show earning potential and timelines
6. ✅ Prioritize free resources
7. ✅ Connect learning to user's financial goals
8. ✅ Provide actionable next steps
9. ✅ Maintain encouraging, empowering tone
10. ✅ Stay within financial literacy context

---

## 🐛 Debugging Tips

If tool doesn't trigger:
- Check system prompt includes "LEARNING RESOURCES FRAMEWORK"
- Verify tool is in tools array
- Confirm function is in switch statement
- Check import of learning-resources.ts

If resources don't show:
- Verify `findLearningResources()` function works
- Check skill keywords match database
- Ensure proper JSON formatting
- Validate URL formats

If links aren't clickable:
- Check Markdown format: `**[Text](URL)**`
- Verify ReactMarkdown component in frontend
- Test with simple link first

---

## 📝 Testing Checklist

Before marking feature complete:
- [ ] Test all 10 positive scenarios
- [ ] Verify 3 negative scenarios work correctly
- [ ] Check link formatting in UI
- [ ] Confirm earning potentials are accurate
- [ ] Validate all resource URLs are working
- [ ] Test on mobile view
- [ ] Verify tool call logs in console
- [ ] Check response times < 5 seconds
- [ ] Test with different user contexts
- [ ] Verify follow-up questions work

---

## 🎉 Ready to Test!

1. Open the AI Assistant page
2. Start a new chat
3. Try the test prompts above
4. Check that responses match expected behavior
5. Report any issues or improvements

**Happy Testing! 🚀**
