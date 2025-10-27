# 🎯 DEFENSE CHEAT SHEET - Quick Reference

**For:** Project Defense Presentation  
**Date:** October 22, 2025

---

## 🔒 SECURITY - ONE-LINERS

**Q: How is data secured?**  
A: "Row Level Security at database level + JWT authentication + HTTPS encryption + input validation"

**Q: Can users access other users' data?**  
A: "No. PostgreSQL RLS policies enforce auth.uid() = user_id check at database level"

**Q: Where are API keys stored?**  
A: "Server-side only in .env.local, never exposed to browser, encrypted on Vercel"

**Q: What if someone hacks the database?**  
A: "RLS still applies. Even with database access, they can only query data for their JWT token's user_id"

**Q: How do you prevent SQL injection?**  
A: "Supabase client uses parameterized queries. No raw SQL from user input"

---

## 🤖 AI TECHNOLOGIES - ONE-LINERS

**Q: What AI model do you use?**  
A: "OpenAI GPT-4o-mini - 200x cheaper than GPT-4, 2x faster, 90% quality"

**Q: How does AI access user data?**  
A: "Through tools that call database with user's JWT token. AI cannot access data without authentication"

**Q: What's LangChain?**  
A: "Framework that lets AI decide which tool to use (search web, add transaction, get balance, etc)"

**Q: How do you prevent AI hallucinations?**  
A: "Tool-based architecture - AI MUST call tools to get real data, cannot make up numbers"

**Q: How much does AI cost?**  
A: "~$0.01 per conversation. Freemium users: $0.30/month, Premium: $2-5/month"

---

## 🧠 MEMORY SYSTEM - ONE-LINERS

**Q: How does AI remember conversations?**  
A: "Every message saved to ai_chat_messages table. We fetch last 20 messages + user's financial data for context"

**Q: Where is memory stored?**  
A: "PostgreSQL database with RLS. Users can only access their own conversation history"

**Q: What's the context sent to AI?**  
A: "Recent messages + transactions + goals + learning reflections + monthly bills"

**Q: How do you handle long conversations?**  
A: "Keep last 20 messages, summarize older ones. Stays within 16k token limit"

---

## 🗄️ DATABASE - ONE-LINERS

**Q: What database do you use?**  
A: "PostgreSQL via Supabase - open-source, SQL support, Row Level Security"

**Q: How is data encrypted?**  
A: "AES-256 at rest, TLS 1.3 in transit. All connections HTTPS-only"

**Q: What about backups?**  
A: "Automatic daily backups by Supabase. 7-day point-in-time recovery. Manual export scripts"

**Q: Can you migrate away from Supabase?**  
A: "Yes. Supabase is open-source. Can self-host PostgreSQL anytime"

---

## 🔐 AUTHENTICATION - ONE-LINERS

**Q: How does login work?**  
A: "Supabase Auth with bcrypt hashing + JWT tokens. Access token: 1hr, Refresh: 30 days"

**Q: Where are passwords stored?**  
A: "Hashed with bcrypt (10 rounds) in auth.users table. Cannot be reversed"

**Q: How do you verify users?**  
A: "Email verification required. JWT tokens validated on every API request"

**Q: What's the session timeout?**  
A: "Access token: 1 hour (auto-refresh). Refresh token: 30 days inactive logout"

---

## 📊 KEY METRICS

- **Response Time:** 2-3 seconds average
- **Cost per User:** $0.30-5/month depending on usage
- **Supported Users:** 1000+ concurrent
- **Uptime:** 99.9% (Supabase SLA)
- **Rate Limit:** 50 messages/month (freemium), unlimited (premium)

---

## 💡 WHY THESE TECHNOLOGIES?

**Next.js:** Server-side rendering, built-in API routes, TypeScript support  
**Supabase:** Row Level Security, PostgreSQL power, open-source  
**OpenAI:** GPT-4o-mini is 200x cheaper, sufficient quality  
**LangChain:** Agent system, tool orchestration, memory management

---

## 🎯 DEFENSE STRATEGY

### When Asked About Security:
1. Mention **multiple layers** (database, application, network)
2. Emphasize **Row Level Security** (unique to PostgreSQL/Supabase)
3. Highlight **industry standards** (JWT, bcrypt, HTTPS)

### When Asked About AI:
1. Explain **tool-based approach** (AI cannot make up data)
2. Mention **cost optimization** (GPT-4o-mini vs GPT-4)
3. Emphasize **context awareness** (AI knows user's actual finances)

### When Asked About Privacy:
1. State **data minimization** (only collect necessary data)
2. Explain **GDPR compliance** (right to access, deletion, portability)
3. Highlight **no sensitive data** (no bank accounts, credit cards, IDs)

---

## 🚨 POTENTIAL HARD QUESTIONS

### Q: "What if OpenAI goes down?"
A: "We have fallback responses. AI returns pre-written helpful messages. System still functions for transactions/goals without AI."

### Q: "What if someone DDos your API?"
A: "Rate limiting per user (50/month freemium). Vercel has DDoS protection. Can enable Cloudflare if needed."

### Q: "How do you know AI won't give bad financial advice?"
A: "1) Tool-based (uses real data), 2) Disclaimer (educational not professional advice), 3) Prompt engineering (don't make assumptions), 4) We're teaching financial literacy, not giving investment advice"

### Q: "Why not use Firebase?"
A: "Supabase has Row Level Security (more secure), full SQL support (more powerful), open-source (no vendor lock-in), and more predictable pricing"

### Q: "How do you scale?"
A: "Supabase auto-scales database. Vercel auto-scales frontend. OpenAI handles billions of requests. LangChain is stateless. We can handle 1000+ concurrent users now, more with paid tiers."

---

## 🎤 OPENING STATEMENT (30 SECONDS)

"Plounix is an AI-powered financial literacy platform designed specifically for Filipino students. We built security into every layer:

- **Database Level:** Row Level Security ensures users only access their own data
- **Application Level:** JWT authentication validates every request  
- **AI Layer:** Tool-based architecture prevents hallucinations
- **Privacy:** GDPR-compliant with data export/deletion

Our AI assistant, Fili, uses OpenAI GPT-4o-mini with LangChain to provide personalized financial advice based on actual user data - transactions, goals, and learning reflections. All data is encrypted, authenticated, and isolated per user.

We prioritized three things: **security first, cost-effectiveness second, user experience third.**"

---

## 🏆 CLOSING STATEMENT (15 SECONDS)

"We built a production-ready system that's secure, scalable, and affordable. We follow industry best practices, use enterprise-grade technologies, and respect user privacy. Most importantly, we're helping Filipino students achieve financial literacy through AI that's actually helpful and safe."

---

## 📝 REMEMBER

- **Be Confident:** You built this. You understand it.
- **Be Honest:** If you don't know something, say "That's a good question, I'd need to research that"
- **Be Specific:** Use technical terms but explain them simply
- **Be Proud:** This is a well-architected system

**You got this! 💪**
