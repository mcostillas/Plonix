# AI Module Creator - Web Research & Auto-Generation

## Overview
The AI Module Creator is an intelligent assistant that researches topics from credible sources on the web and automatically generates complete learning modules. This eliminates manual content creation and ensures modules are based on verified, up-to-date information.

## Workflow

### 1. **Tell AI Your Topic**
Instead of filling out forms manually, you simply tell the AI what you want to teach:

**Examples:**
- "Create a module about NFTs for beginners"
- "I want to teach students about cryptocurrency investing"
- "Make a module explaining DeFi (Decentralized Finance)"
- "Create content about credit card management"

### 2. **AI Researches Credible Sources**
The AI uses Tavily Search (advanced web research) to find:
- ✅ Educational articles from trusted sources
- ✅ Financial education websites
- ✅ Government and regulatory resources
- ✅ Expert guides and tutorials
- ✅ Up-to-date information (not outdated content)

**Search Depth:** Advanced (goes beyond basic search results)  
**Number of Sources:** Up to 5 credible sources per topic

### 3. **AI Auto-Fills the Module**
Based on researched sources, AI generates:

#### Basic Information
- Module ID (URL-friendly)
- Compelling title
- Clear description
- Estimated duration
- Appropriate category (core/essential/advanced)
- Relevant icon and color scheme

#### Learn Section
- 400-600 words of educational content
- Filipino context (₱, GCash, local banks, etc.)
- 4-6 key points
- Sources attribution

#### Apply Section
- Realistic Filipino scenario
- Interactive quiz (auto-selects best test type)
- 4 answer options OR True/False OR fill-in-blank
- Correct answer with detailed explanation

#### Reflect Section
- 3-4 thought-provoking questions
- 3-5 actionable steps students can take today

#### Metadata
- 5-7 key concepts
- 4-5 main takeaways
- 5-7 practical tips
- 4-5 common mistakes to avoid

### 4. **You Review & Approve**
The AI presents the complete module in a preview panel showing:
- All content sections
- Test type and quiz details
- Credible sources used (with links)

**You decide:**
- ✅ **Approve & Publish** - Module goes live + sources added to Resource Hub
- ❌ **Reject** - Try a different topic or refine the request

### 5. **Auto-Publish to Resource Hub**
When you approve, the system automatically:
1. Creates the learning module
2. Adds all credible sources to Resource Hub
3. Links sources to the module for student reference

---

## User Interface

### Split Screen Design

**Left Side: AI Chat Assistant**
- Conversational interface
- Ask questions, give instructions
- AI clarifies requirements if needed
- Real-time processing status

**Right Side: Module Preview**
- Live preview of generated content
- All sections visible
- Credible sources with clickable links
- Approve/Reject buttons

---

## AI Conversation Flow

### Initial Request
```
You: "Create a module about NFTs"
```

### AI Clarification (if needed)
```
AI: "I'd love to help! Should this module focus on:
     - NFT basics for complete beginners?
     - How to buy/sell NFTs?
     - NFT investment risks?
     
     What level would be most helpful?"
```

### User Refinement
```
You: "NFT basics for beginners, focus on safety"
```

### AI Research Phase
```
AI: "🔍 Researching credible sources about NFT basics and safety...
     ✓ Found 5 educational resources
     ✓ Generating comprehensive module content
     ✓ Creating Filipino-contextualized scenarios"
```

### AI Presents Module
```
AI: "✅ I've researched and created a complete module about 'NFT Basics: Safe Introduction'!

     📚 Found 5 credible sources
     ⏱️ Estimated completion time: 20 min
     🎯 Category: essential
     
     Please review the module preview. If you approve, I'll publish it and 
     add the 5 source(s) to your Resource Hub automatically."
```

---

## Technical Implementation

### API Endpoint
**Route:** `/api/admin/ai-module-research`  
**Method:** POST  
**Max Duration:** 60 seconds (for thorough research)

### Request Body
```json
{
  "topic": "Create a module about NFTs",
  "conversationHistory": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ]
}
```

### Response
```json
{
  "message": "AI's conversational response",
  "moduleData": {
    // Complete module object if ready
    // OR null if AI needs more clarification
  }
}
```

### Technologies Used

1. **OpenAI GPT-4 Turbo** (`gpt-4-turbo-preview`)
   - Temperature: 0.7 (creative but coherent)
   - Generates comprehensive educational content
   - Filipino-contextualized responses

2. **Tavily Search API**
   - Advanced web research
   - Credible source identification
   - Real-time information gathering
   - Returns: title, URL, content summary

3. **LangChain**
   - @langchain/openai for GPT integration
   - Conversation management
   - Prompt engineering

---

## Environment Variables Required

Add to `.env.local`:

```bash
# OpenAI API Key (for GPT-4 content generation)
OPENAI_API_KEY=sk-...

# Tavily API Key (for web research)
TAVILY_API_KEY=tvly-...
```

### Get API Keys

**OpenAI (GPT-4):**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into `.env.local`

**Tavily (Web Search):**
1. Go to https://app.tavily.com/
2. Sign up for free account
3. Get your API key from dashboard
4. Copy and paste into `.env.local`

**Free Tier:**
- Tavily: 1,000 searches/month free
- OpenAI: Pay-per-use (GPT-4 Turbo ~$0.01 per module)

---

## Example Use Cases

### 1. Hot Topic: NFTs
```
Admin: "Create a module about NFTs"
AI: Researches latest NFT information, safety concerns, scams
Result: Up-to-date module with current examples
```

### 2. Technical Topic: DeFi
```
Admin: "I want to teach DeFi basics"
AI: Finds beginner-friendly guides, explains complex terms simply
Result: Accessible module for 18-30 year olds
```

### 3. Practical Topic: Credit Cards
```
Admin: "Create content about credit card management for students"
AI: Researches Filipino credit cards (BPI, BDO), local interest rates
Result: Philippines-specific practical guide
```

### 4. Investment Topic: Stocks
```
Admin: "Module about stock market investing"
AI: Finds PSE (Philippine Stock Exchange) resources, local brokers
Result: Locally-relevant investment education
```

---

## Advantages Over Manual Creation

| Manual Method | AI Research Method |
|---------------|-------------------|
| 30-60 minutes per module | 2-3 minutes per module |
| Research required separately | AI researches automatically |
| May miss recent updates | Always current information |
| Manual source tracking | Auto-adds sources to Resource Hub |
| Prone to Filipino context errors | Context-aware AI |
| Need to write all content | AI generates everything |

---

## Quality Assurance

### AI Ensures:
- ✅ Accurate information from credible sources
- ✅ Filipino context (₱ currency, local banks, relatable scenarios)
- ✅ Age-appropriate language (18-30 years old)
- ✅ Practical, actionable advice
- ✅ Engaging scenarios and examples
- ✅ Proper structure (Learn → Apply → Reflect)

### You Control:
- ✅ Final approval before publishing
- ✅ Edit any field if needed (preview allows modification)
- ✅ Reject and try again
- ✅ Request specific focus areas

---

## Access

**URL:** `/admin/ai-module-creator`

**From Admin Dashboard:**
Click the purple "AI Module Creator" button in the Learning Modules card

**Requirements:**
- Admin authentication
- OpenAI API key configured
- Tavily API key configured

---

## Future Enhancements

### Planned Features:
- [ ] Edit module after AI generation before publishing
- [ ] Save drafts for later review
- [ ] Regenerate specific sections only
- [ ] Multi-language support (Tagalog option)
- [ ] Image generation for module headers
- [ ] Video resource suggestions
- [ ] Analytics: Which AI modules perform best

---

## Troubleshooting

### "AI research failed"
**Cause:** API key missing or invalid  
**Fix:** Check `.env.local` has valid TAVILY_API_KEY and OPENAI_API_KEY

### "No sources found"
**Cause:** Topic too specific or niche  
**Fix:** Broaden the topic or rephrase (e.g., "NFT gaming" → "NFT basics")

### "Module generation timeout"
**Cause:** Complex topic requiring more processing  
**Fix:** Try again or simplify the request

### "Failed to parse module"
**Cause:** AI response format error (rare)  
**Fix:** Click reject and try again - AI will regenerate

---

## Cost Estimation

**Per Module Creation:**
- Tavily Search: ~5 searches = $0.005 (free tier)
- GPT-4 Turbo: ~2,000 tokens = $0.01
- **Total:** ~$0.01 per module (or free with monthly limits)

**Monthly Budget (100 modules):**
- Tavily: Free (1,000 searches/month limit)
- OpenAI: ~$1.00 (100 modules)

**ROI:**
- Time saved: 50 hours/month (30 min per module × 100)
- Cost: $1/month
- **Value:** Massive time savings for minimal cost

---

## Best Practices

### Do's ✅
- Be specific about the topic
- Mention target audience if different from default
- Specify focus areas (basics, advanced, safety, etc.)
- Review all generated content before approving
- Check that sources are credible and recent

### Don'ts ❌
- Don't use overly technical jargon in requests
- Don't approve without reviewing
- Don't expect perfection (AI is a tool, you're the expert)
- Don't skip source verification

---

## Success Metrics

Track AI module performance:
- Completion rates vs manual modules
- Student feedback scores
- Time saved per module
- Source quality ratings
- Module update frequency

---

## Summary

The AI Module Creator transforms module creation from a 30-60 minute manual process into a 2-3 minute conversation. The AI:

1. 🔍 **Researches** credible sources from the web
2. ✍️ **Generates** complete Filipino-contextualized content
3. 📚 **Auto-fills** all module fields
4. 🔗 **Adds** sources to Resource Hub
5. ⚡ **Saves** 95% of content creation time

You maintain full control with review and approval, while AI handles the heavy lifting of research and writing.

**Result:** High-quality, research-backed learning modules in minutes instead of hours.
