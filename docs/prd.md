# MemeDo Product Requirements Document (PRD)

**Author:** Qlirim Elezi  
**Date:** October 28, 2025  
**Project Level:** Level 3 (Sophisticated SaaS Platform)  
**Target Scale:** 50,000 users, $25k MRR by Month 12

---

## Goals and Background Context

### 🎯 Product Goals

- Deliver multi-chain token analysis (Ethereum, Solana, Base, BSC) in under 60 seconds with 95%+ data completeness, using an intelligent multi-API fallback system.

- Achieve $5k MRR by Month 6 to validate product–market fit.

- Reach 50,000 total users and 10,000 paying subscribers (20% conversion) by Month 12.

- Position MemeDo as the #1 trusted meme coin intelligence platform, aiming to prevent over $1M in user losses through automated risk detection.

### 🧠 User Goals

- Reduce token analysis time from 90 minutes to <60 seconds — without sacrificing depth.

- Provide clear, actionable risk ratings ("Safe", "Caution", "Avoid") with confidence scores and natural-language explanations.

- Make multi-chain due diligence accessible — no blockchain expertise required.

- Ensure 99.9% uptime with seamless fallback behavior (no "API failed" messages ever seen by users).

### 💼 Business Goals

- Validate pricing willingness ($29/month target) by reaching 100 paying users in Month 3.

- Build a technical moat around reliability — via a proprietary "API Health & Reliability Index" and user trust signals.

- Achieve cash-flow break-even by Month 5, and $25k MRR by Month 12 to justify Year 2 expansion.

### ⚡ Background Context

#### The Problem

Meme coin traders suffer from information fragmentation and risk blindness.

In 2024 alone, over $3.4 billion was lost to rug pulls — often preventable with proper analysis.

A single token evaluation currently requires 30–90 minutes and 5–10 separate tools (DexScreener, Etherscan, GoPlus, RugCheck, Helius, etc.).

Even with this effort, traders still miss critical red flags like hidden mint permissions or blacklists.

**Existing tools are:**

- ❌ Single-chain limited (no unified cross-chain analysis)
- ⚠️ Unreliable (frequent API failures, no fallbacks)
- 📉 Non-contextual (raw data dumps without conclusions)

As a result, traders either spend hours researching or gamble blindly.

#### Why Now

Three macro forces make this the perfect storm moment:

1. **Explosion of meme tokens** — thousands launched daily across Solana, Ethereum, Base, and BSC.

2. **Scam sophistication** — fake audits, hidden mint functions, proxy contracts, and dynamic taxes are becoming mainstream.

3. **Retail influx** — FOMO-driven newcomers lack technical skill and fall victim to manipulation.

Manual due diligence is no longer feasible — the volume and complexity of tokens exceed human capacity.

#### Our Insight

**Reliability is the new edge.**

Where other platforms fail 20–40% of the time due to missing APIs or timeouts, MemeDo's multi-layered fallback system ensures continuous data flow from primary and backup providers.

This foundation allows:

- Chain-aware security models (e.g., Solana authorities vs. EVM contract patterns)
- AI-assisted risk summaries (clarity for non-developers)
- Continuous improvement as data scales (trust network effects)

**MemeDo = 10× faster, 10× more reliable, and 10× more informative than current tools** — turning chaotic meme coin speculation into confident decision-making.

---

## Requirements

### Functional Requirements

#### **User Management & Authentication**

**FR001:** The system shall allow users to register with email address and password  
**FR002:** The system shall enforce password strength requirements (minimum 8 characters, at least one uppercase letter, one number)  
**FR003:** The system shall send email verification link upon registration and block login until email is confirmed  
**FR004:** The system shall provide "Resend verification email" functionality if user does not receive initial email  
**FR005:** The system shall authenticate users via JWT tokens with 24-hour expiry and refresh token capability  
**FR006:** The system shall support password reset via secure email link with token expiry (1 hour)  
**FR007:** The system shall track user role (free, premium) and enforce tier-based access limits  
**FR008:** The system shall allow users to delete their account from settings page  
**FR009:** The system shall allow users to export their analysis history before account deletion (GDPR compliance)

#### **Token Analysis Core**

**FR010:** The system shall accept **only** token contract addresses (Ethereum ERC-20) or mint addresses (Solana) as input — **not token names** — with clear helper text to prevent name collision confusion  
**FR011:** The system shall validate contract address format before processing (Ethereum: 0x + 40 hex chars; Solana: base58, 32-44 chars)  
**FR012:** The system shall auto-detect blockchain network from contract address format  
**FR013:** The system shall execute parallel API calls to multiple data sources (DexScreener, Etherscan, Helius, GoPlus, RugCheck, Covalent, BirdEye) for each analysis request  
**FR014:** The system shall implement chain-specific fallback cascades:
- **Ethereum:** DexScreener → Etherscan (ABI scan) → GoPlus → Covalent
- **Solana:** DexScreener + Helius → RugCheck → BirdEye  

**FR015:** The system shall enforce 5-second timeout per external API call and 12-second maximum total analysis time  
**FR016:** The system shall return analysis results within 12 seconds or provide timeout notification  
**FR017:** The system shall display "No data available" when all API sources fail, showing:
- Which sources were attempted
- Timestamp of attempts
- User-friendly explanation (never raw API errors)

#### **Analysis Display & Data Presentation**

**FR018:** The system shall present analysis results across five tabs: **Overview, Security, Tokenomics, Liquidity, Social**  
**FR019:** The system shall display Overview data: price, 24h volume, liquidity, market cap, 24h price change  
**FR020:** The system shall display Security data: honeypot status, buy/sell taxes, ownership status, mint authority (Solana), freeze authority (Solana), blacklist capability (EVM), proxy detection (EVM)  
**FR021:** The system shall display Tokenomics data: total supply, circulating supply, holder count, holder distribution  
**FR022:** The system shall display Liquidity data: DEX pairs, liquidity USD value, liquidity lock status  
**FR023:** The system shall display Social data: website, Twitter, Telegram, Discord links  
**FR024:** The system shall indicate data source for each metric with "Data from [Source]" attribution and **transparency tooltip** showing "Last fetched X minutes ago"  
**FR025:** The system shall display **confidence/source indicators** per tab so users know which API supplied each data point

#### **Caching & Performance**

**FR026:** The system shall cache token analysis results in Redis with chain-prefixed keys (format: `sol:BONK`, `eth:0x...`)  
**FR027:** The system shall implement tiered cache TTL policy:
- **Price & quick metrics:** 1-5 minutes
- **Token metadata, supply, security checks:** 24 hours  

**FR028:** The system shall serve cached results when available instead of re-fetching from APIs

#### **Rate Limiting & Quota Enforcement**

**FR029:** The system shall enforce free tier limit of 20 analyses per month per user  
**FR030:** The system shall allow unlimited analyses for premium tier users  
**FR031:** The system shall display remaining analysis count for free tier users in dashboard  
**FR032:** The system shall implement global per-IP rate limiting (30 requests/minute) to prevent abuse  
**FR033:** The system shall detect and throttle unusual burst patterns (e.g., >10 requests in 10 seconds)  
**FR034:** The system shall support admin override to manually adjust user quota for debugging/onboarding

#### **Payment & Subscription Management**

**FR035:** The system shall integrate with Stripe (primary) and LemonSqueezy (backup) for payment processing  
**FR036:** The system shall offer premium subscription at $29/month with unlimited analyses  
**FR037:** The system shall process Stripe webhooks to update user role from "free" to "premium" upon successful payment  
**FR038:** The system shall allow users to cancel subscription from settings page  
**FR039:** The system shall display current subscription status (active, canceled, expiring date) in user dashboard  
**FR040:** The system shall handle webhook failures gracefully with retry logic and manual reconciliation capability

#### **Dashboard & User Interface**

**FR041:** The system shall display user's recent analyses (last 10) on dashboard  
**FR042:** The system shall provide settings page for password change, email update, and subscription management  
**FR043:** The system shall require re-authentication for sensitive actions (password change, account deletion)

#### **Admin Panel (Basic)**

**FR044:** The system shall provide admin panel accessible to admin-role users only  
**FR045:** The system shall display admin dashboard showing:
- Total users (free vs premium breakdown)
- Total analyses performed (daily/weekly/monthly)
- Subscription status overview  

**FR046:** The system shall allow admins to manually set user premium status for debugging/onboarding  
**FR047:** The system shall display **API Health Dashboard** showing per-provider metrics:
- Success rate (%)
- Average latency (ms)
- Last successful call timestamp
- Fallback trigger frequency  

**FR048:** The system shall allow admins to view API consumer quota (heavy users) for trial offers or upsell opportunities

#### **Operational & Development Support**

**FR049:** The system shall validate presence of required environment variables on server startup and **fail fast** if critical keys are missing (DATABASE_URL, REDIS_URL, STRIPE_SECRET_KEY, etc.)  
**FR050:** The system shall provide `.env.example` template listing all required API keys and configuration variables  
**FR051:** The system shall support feature flag for "simulate low-data chains" to enable QA testing of fallback behavior  
**FR052:** The system shall implement database migration system (Drizzle migrations) to track schema changes

---

### Non-Functional Requirements

**NFR001: Performance**  
- Token analysis completion time: **≤12 seconds per request** (target: 6-8 seconds average)
- Individual API call timeout: **5 seconds maximum**
- API response time: <6 seconds average for cached results (1-5 min cache for price data)
- Page load time: <2 seconds (frontend on Vercel edge)
- Support for 100-200 concurrent analyses at scale (Month 12)

**NFR002: Reliability & Availability**  
- System uptime: **99.5% for MVP** (allows ~3.6 hours downtime/month), **99.9% post-PMF** (allows ~43 minutes/month)
- API data completeness: **95%+ successful full analysis rate** through fallback architecture
- **Analysis completeness metric:** Record 0-100 score per analysis based on tab completion, track aggregate "% of analyses with full tabs" — **Goal: 95%+**
- Error rate: <1% across all blockchain networks
- Zero visible raw API failures to end users (graceful degradation with explanatory messaging only)

**NFR003: Security**  
- All data transmission over HTTPS (enforced by Vercel/Render)
- JWT tokens with secure httpOnly cookies
- Input validation on all user-provided data (contract addresses, emails, passwords) using **Zod**
- Password strength enforcement: minimum 8 characters, at least one uppercase letter, one number
- **Two-Factor Authentication (2FA):**
  - **Mandatory TOTP (Time-based One-Time Password) for all admin accounts**
  - Optional 2FA for premium users (Phase 2)
  - TOTP secrets encrypted at rest using AES-256-GCM
  - 30-second time window with ±1 step tolerance (90-second total window)
- Rate limiting:
  - **Global per-IP:** 30 requests/minute
  - **Per-user quota:** 20 analyses/month for free tier (tracked in PostgreSQL)
  - **Abuse prevention:** Captcha or throttle on unusual burst patterns (>10 requests in 10 seconds)
- API secrets stored in environment variables via Vercel/Render secret stores, **never committed to version control**
- **API Key Rotation Schedule (Mandatory):**
  - **90-day rotation** for all external API keys (Helius, Etherscan, GoPlus, RugCheck, Resend)
  - **90-day rotation** for JWT_SECRET and JWT_REFRESH_SECRET (invalidates all sessions)
  - **180-day rotation** for TOTP_ENCRYPTION_KEY (with re-encryption of all TOTP secrets)
  - **On-demand rotation** for Stripe, database, and Redis credentials (only on suspected breach)
  - Automated verification script to test new keys before revoking old keys
  - Rotation log tracked in `logs/key-rotation.log`
- Password hashing using bcrypt with minimum 10 salt rounds
- Secrets management: **Process.env validation** on startup; use production secret stores (Vercel Secrets, Render Env Vars)

**NFR004: Scalability**  
- Support gradual growth from 0 → 1,000 → 10,000 → 50,000 users over 12 months
- Database: Neon PostgreSQL with connection pooling and autoscaling
- Caching: Redis (Upstash) with chain-prefixed keys (e.g., `sol:BONK`, `eth:0xABC123...`) to reduce API costs by 10x and handle scale
- Cache policy:
  - **Price & quick metrics:** 1-5 minutes TTL
  - **Token metadata, supply, security checks:** 24 hours TTL
- Horizontal scaling capability on Render (1 → 3 instances during traffic spikes)

**NFR005: Data Quality & Consistency**  
- Implement trust hierarchy for conflicting data (DexScreener > Helius > RugCheck for price; Etherscan > GoPlus for security)
- Display data source attribution for transparency ("Data from [Source]")
- Show **transparency tooltips** on each metric: "Sourced from DexScreener — last fetched 3 minutes ago"
- Confidence scoring (high/medium/low) for merged multi-source data (Post-MVP enhancement)

**NFR006: Observability, Monitoring & Logging**  
- **Structured logging:** Use Sentry (or equivalent) for error tracking and diagnostics
- Log external API provider interactions:
  - Provider name
  - Response time (ms)
  - Success/failure status
  - Error details (for internal debugging only)
- **Per-provider metrics stored in database:**
  - Success rate (%)
  - Average latency (ms)
  - Fallback trigger frequency
- **Monitoring alerts:**
  - Alert (Slack/email) when provider success rate drops below 80% for 1 hour
  - Alert on database connection failures
  - Alert on cache (Redis) unavailability
- Internal admin dashboard displaying **API health metrics** (success rate, latency, fallback usage) in real-time

**NFR007: Testing & Quality Assurance**  
- **Integration tests:**
  - Analysis endpoint (happy path + fallback scenarios)
  - Multi-API orchestration with simulated failures
- **Unit tests:**
  - Authentication flows (register, login, email verify, password reset)
  - Quota enforcement logic
  - Cache key generation and TTL behavior
- **Payment webhook tests:**
  - Stripe webhook signature validation
  - Subscription status updates (active → canceled → expired)
  - Edge cases (duplicate webhooks, out-of-order events)
- **Feature flag support:** "Simulate low-data chains" for QA testing of fallback behavior without relying on actual API downtime

---

## User Journeys

### **Journey 1: First-Time User Discovers and Analyzes a Token** 
*(Primary Happy Path - The "Aha Moment")*

**Persona:** Jake, 28, "Vigilant Degen" trader who just heard about MemeDo from crypto Twitter

**Context:** Jake found a new Solana meme coin on Twitter and wants to verify if it's safe before investing $500.

#### **Steps:**

1. **Discovery & Landing**
   - Jake clicks MemeDo link from Twitter thread
   - Lands on homepage, sees value prop: "90 minutes → 30 seconds"
   - Clicks "Try Free Analysis" CTA

2. **Registration (Mandatory for Analysis)**
   - System prompts: "Sign up to analyze your first token"
   - Jake enters email + password
   - System validates password strength (min 8 chars, 1 uppercase, 1 number)
   - **Decision Point:** Password weak?
     - ❌ **Alt Path A:** System shows inline error: "Password must be at least 8 characters with 1 uppercase and 1 number"
     - ✅ **Happy Path:** Password accepted, account created

3. **Email Verification**
   - System sends verification email to Jake
   - Jake opens email, clicks verification link
   - **Decision Point:** Email didn't arrive?
     - ❌ **Alt Path B:** Jake clicks "Resend verification email" from login page
     - System resends email, shows success message
   - ✅ **Happy Path:** Email verified, Jake redirected to dashboard with welcome message

4. **First Analysis**
   - Dashboard shows: "You have 20 free analyses this month"
   - Jake pastes Solana mint address: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
   - System shows helper text: "Paste contract address only (not token name) to avoid confusion"
   - Jake clicks "Analyze"

5. **Analysis Processing (The Magic Moment)**
   - Loading spinner appears: "Analyzing across multiple sources..."
   - System executes fallback chain (DexScreener + Helius → RugCheck → BirdEye)
   - **Decision Point:** All APIs fail?
     - ❌ **Alt Path C:** System shows: "No data available. Sources attempted: DexScreener (timeout), Helius (rate limit), RugCheck (no data). Try again in 1 minute."
   - ✅ **Happy Path:** Analysis completes in 8 seconds

6. **Results Review (Core Value Delivery)**
   - System displays 5 tabs: Overview, Security, Tokenomics, Liquidity, Social
   - **Overview tab:** Price $0.0042, Liquidity $890k, 24h Volume $1.2M
   - **Security tab:** 
     - ✅ No mint authority
     - ✅ Ownership renounced
     - ⚠️ Freeze authority still active (flagged yellow)
     - Tooltip: "Data from RugCheck — last fetched 2 minutes ago"
   - **Decision Point:** Missing data in a tab?
     - ❌ **Alt Path D:** Social tab shows "No data available from DexScreener" (graceful degradation)
   - ✅ **Happy Path:** All 5 tabs populated with clear indicators

7. **Decision & Next Action**
   - Jake sees freeze authority warning, decides to **avoid** this token
   - Dashboard updates: "19 analyses remaining this month"
   - System prompts: "Share this analysis?" (social sharing button for viral growth)
   - **Decision Point:** Jake wants to analyze another token immediately?
     - ✅ **Repeat:** Jake pastes new address, goes through steps 4-6 again
     - ⏸️ **Exit:** Jake bookmarks MemeDo, leaves satisfied

**Outcome:** Jake avoided a risky investment in <2 minutes. Value delivered. **Aha moment achieved.**

---

### **Journey 2: Free User Hits Quota Limit and Upgrades to Premium**
*(Conversion Path - Critical for Revenue)*

**Persona:** Sarah, 32, active trader analyzing 3-5 tokens daily

**Context:** Sarah has been using MemeDo for 2 weeks, analyzed 20 tokens, now needs to check a hot new token she saw on Discord.

#### **Steps:**

1. **Analysis Attempt While at Quota**
   - Sarah pastes new Ethereum contract address
   - Clicks "Analyze"
   - System checks: `user.analyses_this_month >= 20`
   - **System blocks request**, displays modal:
     ```
     🚫 Monthly Analysis Limit Reached
     
     You've used all 20 free analyses this month.
     
     Upgrade to Premium for:
     ✅ Unlimited analyses
     ✅ Priority support
     ✅ Early access to new features
     
     $29/month • Cancel anytime
     
     [Upgrade Now] [Maybe Later]
     ```

2. **Decision Point: Upgrade or Wait?**
   - **Alt Path A (Churn Risk):** Sarah clicks "Maybe Later"
     - System shows: "Your quota resets on [date]"
     - Sarah leaves frustrated, **might not return**
   - ✅ **Happy Path:** Sarah clicks "Upgrade Now" (realizes she's already saved $2k by avoiding rugs)

3. **Payment Flow**
   - System redirects to Stripe Checkout
   - Displays plan: "$29/month, unlimited analyses"
   - Sarah enters card details
   - **Decision Point:** Payment fails?
     - ❌ **Alt Path B:** Stripe returns error (card declined)
     - System shows: "Payment failed. Please try another card or contact support."
     - Offers LemonSqueezy backup: "Try alternative payment method?"
   - ✅ **Happy Path:** Payment succeeds

4. **Subscription Activation**
   - Stripe sends webhook to MemeDo backend
   - System updates: `user.role = 'premium'`
   - System resets: `user.analyses_this_month = 0` (unlimited now)
   - Sarah redirected to dashboard with success message:
     ```
     🎉 Welcome to Premium!
     
     You now have unlimited analyses.
     [Analyze Your Token Now]
     ```

5. **Post-Upgrade Analysis**
   - Sarah pastes the Ethereum address she originally wanted to check
   - Analysis runs successfully (no quota block)
   - Dashboard now shows: "Premium • Unlimited analyses"

6. **Long-Term Engagement**
   - Sarah uses MemeDo daily for next 2 months
   - Analyzes 150+ tokens (would have cost $0 with unlimited, but saved her from 5+ rug pulls worth $3k+)
   - **Decision Point:** Sarah wants to cancel?
     - Goes to Settings → Subscription → "Cancel Subscription"
     - System asks: "Are you sure? You'll lose unlimited analyses."
     - If confirmed, subscription cancels at end of billing period (no immediate cutoff)

**Outcome:** Conversion from free → premium. Lifetime value = $240 (12 months avg). Sarah becomes power user.

---

### **Journey 3: Premium User Encounters API Failure and Experiences Fallback Reliability**
*(Reliability Proof - Core Moat Demonstration)*

**Persona:** Marcus, 35, premium user who analyzes 10-20 tokens daily, relies on MemeDo for trading decisions

**Context:** Marcus is analyzing a new Base network token. DexScreener API is experiencing downtime (happens 2-3 times/month in reality).

#### **Steps:**

1. **Analysis Request**
   - Marcus pastes Base contract address: `0x1234...abcd`
   - System detects: EVM chain (Base)
   - Clicks "Analyze"

2. **Primary API Failure (Invisible to User)**
   - System attempts: **DexScreener API** (5s timeout)
   - **Decision Point:** DexScreener times out (internal error)
     - ❌ **Competitor behavior:** Would show "API Error - Try again later"
     - ✅ **MemeDo behavior:** Silently triggers fallback chain
   
3. **Automatic Fallback Cascade**
   - **System logs internally:** `DexScreener timeout (5.1s) → triggering fallback`
   - System attempts: **Etherscan API** (for contract verification + ABI scan)
   - ✅ **Etherscan succeeds** → returns contract data, owner address, verification status
   - System attempts: **GoPlus API** (for security checks)
   - ✅ **GoPlus succeeds** → returns honeypot status, buy/sell taxes, proxy detection
   - System attempts: **Covalent API** (for holder data + supply)
   - ✅ **Covalent succeeds** → returns holder count, top holders

4. **Data Merging & Presentation**
   - System merges data from 3 sources (Etherscan + GoPlus + Covalent)
   - Applies trust hierarchy:
     - Security data: GoPlus (primary) + Etherscan ABI scan (validation)
     - Holder data: Covalent (only source available)
     - Liquidity data: Missing (DexScreener was only source)
   - Analysis completes in 11 seconds (slightly slower than average due to fallback)

5. **Results Display with Transparency**
   - **Overview tab:** Limited data (price missing due to DexScreener failure)
     - Shows: "Price data unavailable — DexScreener is experiencing issues. Try again in 5 minutes for live price."
   - **Security tab:** ✅ Fully populated
     - "Data from GoPlus + Etherscan — last fetched 8 seconds ago"
   - **Tokenomics tab:** ✅ Holder count, distribution
     - "Data from Covalent — last fetched 10 seconds ago"
   - **Liquidity tab:** ⚠️ "No data available (Sources attempted: DexScreener timeout)"
   - **Social tab:** ✅ Links from contract metadata

6. **User Understanding (Transparency Wins Trust)**
   - Marcus sees most tabs populated despite DexScreener being down
   - Notices transparent messaging: "Sources attempted" + timestamps
   - Checks Security + Tokenomics tabs (his main decision factors)
   - Makes informed decision: Token looks safe, will wait 5 min to check price on DexScreener directly

7. **System Self-Healing**
   - After 10 minutes, DexScreener recovers
   - Marcus runs analysis again
   - This time: **All 5 tabs fully populated** in 7 seconds
   - Marcus sees: "Data from DexScreener + GoPlus + Covalent"

**Outcome:** Marcus experiences **zero disruption** despite major API provider downtime. He trusts MemeDo's reliability moat. **Retention secured.**

---

### **Journey 4 (Bonus): Admin Detects API Provider Degradation and Takes Action**
*(Operational Journey - Behind the Scenes)*

**Persona:** You (founder/admin) monitoring MemeDo health

**Context:** It's Month 3, you have 500 active users. You notice complaints on Twitter about "slow analyses."

#### **Steps:**

1. **Alert Triggered**
   - System detects: `Helius API success rate = 72% over last 1 hour` (threshold: 80%)
   - Slack alert fires: "⚠️ Helius API degraded — success rate 72%"

2. **Admin Dashboard Investigation**
   - You log into Admin Panel → API Health Dashboard
   - See metrics:
     - **Helius:** 72% success, avg latency 6.8s (normally 2.3s)
     - **DexScreener:** 98% success, avg latency 1.9s ✅
     - **RugCheck:** 88% success, avg latency 3.1s ✅
   - View logs: Most Helius failures are "rate limit exceeded"

3. **Decision Point: Mitigation Strategy**
   - **Option A:** Upgrade Helius API plan (costs $50/mo more)
   - **Option B:** Increase cache TTL for Solana metadata (24h → 48h) to reduce calls
   - **Option C:** Add BirdEye as earlier fallback (promote in cascade)
   - You choose: **Option C** (free, improves reliability immediately)

4. **Configuration Update**
   - You update fallback chain in `/server/adapters/solana.ts`:
     - **Before:** DexScreener + Helius → RugCheck → BirdEye
     - **After:** DexScreener → BirdEye → Helius → RugCheck
   - Deploy change (takes 2 minutes on Render)

5. **System Recovery**
   - Within 15 minutes, success rate improves to 94%
   - BirdEye handles most requests, Helius only used as fallback
   - User complaints stop
   - You tweet: "We just improved Solana analysis speed by 2 seconds. Our multi-API fallback = zero downtime 🚀"

**Outcome:** Proactive monitoring + admin tools = operational excellence. **Uptime maintained, users never noticed.**

---

## Out of Scope

The following features and capabilities are explicitly **excluded from MVP** and deferred to Phase 2+ releases:

### **Phase 2 Features (Month 4-6)**
- BSC (Binance Smart Chain) and Base network support
- AI-powered risk summaries (natural language explanations beyond manual risk flags)
- Watchlist functionality with real-time price/liquidity alerts
- Dashboard widgets: "Top 5 Bullish Coins This Week", "Liquidity Leaders", "Market Radar"
- Community sentiment and voting system
- Telegram/Discord bot integration for in-chat analysis
- Historical pattern recognition and trend analysis

### **Phase 3+ Features (Month 7-12)**
- "Safe by MemeDo" verified badge for legitimate projects
- Whale movement tracking and alerts
- Cross-chain clone detection (identify copycat tokens)
- Pump & dump pattern detector
- DeFi wallet integration (MetaMask, Phantom, WalletConnect)
- In-app token swaps (buy safe tokens directly)
- Portfolio tracking across chains
- LaunchSafe: Pre-launch token audit service for developers
- Enterprise API for institutional access
- Multi-language support (Spanish, Portuguese, Turkish, Chinese)

### **Not Included in Any Phase**
- Mobile native apps (iOS/Android) — web-first, responsive design only
- Token name search (only contract address to prevent confusion)
- Automated trading or bot functionality
- Financial advice or investment recommendations
- ICO/IDO launch platform
- NFT analysis (different product vertical)
- Tax calculation or reporting features
- Social trading or copy-trading features

### **Technical Limitations (Known Constraints)**
- Chains not supported in MVP: Arbitrum, Polygon, Avalanche, Fantom (can be added post-PMF)
- Historical price data beyond 24 hours (requires premium API tiers)
- Real-time WebSocket price updates (polling only in MVP)
- Advanced charting (TradingView-style candles, indicators)
- Smart contract code review or manual auditing

---

**Next Steps:**

This PRD serves as the strategic foundation. The next phase is:

1. **Epic Breakdown** (in `docs/epics.md`) — tactical implementation roadmap with user stories
2. **Technical Architecture Document** — system design, data flows, API architecture
3. **Frontend Specification** (in `docs/frontend-spec.md`) — detailed UX/UI implementation guide

**Prepared for:** AI-assisted development with Cursor + BMAD Method workflows  
**Success Criteria:** 100 paying users by Month 3, $5k MRR by Month 6, $25k MRR by Month 12

