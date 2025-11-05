# MemeDo Frontend Specification

**Version:** 1.0  
**Date:** October 28, 2025  
**Author:** Qlirim Elezi  
**Purpose:** Detailed UX/UI implementation guide for MemeDo frontend development

---

## Table of Contents

1. [UX Design Principles](#ux-design-principles)
2. [UI Design Goals](#ui-design-goals)
3. [Behavioral Specifications](#behavioral-specifications)
4. [Visual Design System](#visual-design-system)
5. [Component Library](#component-library)
6. [Screen Specifications](#screen-specifications)
7. [Interaction Patterns](#interaction-patterns)
8. [Performance & Accessibility](#performance--accessibility)

---

## UX Design Principles

These core principles guide all design decisions for MemeDo:

### **1. Clarity Over Flash**

_"Every element must serve the user's decision-making process"_

- **No crypto gimmicks:** Avoid neon colors, moon emojis, or hype aesthetics
- **Information hierarchy:** Most critical data (price, security, liquidity) always above the fold
- **Plain language:** "This token is safe" not "Smart contract verification score: 87.3"
- **Visual emphasis on risk:** Red flags (🚨) for danger, yellow (⚠️) for caution, green (✅) for safe

**Why:** Vigilant Degens are paranoid and time-sensitive. They need instant understanding, not pretty charts.

---

### **2. Trust Through Transparency**

_"Show your work — users trust what they can verify"_

- **Source attribution:** Every data point shows "Data from [Provider] — last fetched X minutes ago"
- **Confidence indicators:** Clear visual distinction between high-confidence (multiple sources) and low-confidence (single source) data
- **Graceful degradation:** When data is missing, explain why ("DexScreener timeout — sources attempted: [list]")
- **No black boxes:** Users should understand where conclusions come from

**Why:** After losing $1.5k to fake liquidity locks, users distrust "trust me bro" platforms. Transparency = competitive moat.

---

### **3. Speed as a Feature**

_"Every second saved = higher conversion"_

- **Instant feedback:** Loading states with progress indicators ("Fetching from DexScreener...")
- **Progressive disclosure:** Show Overview tab results first, other tabs load in background
- **Smart caching:** Display cached data immediately with "Last updated X min ago" notice
- **Keyboard shortcuts:** Power users can paste address + hit Enter (no mouse clicks)
- **Minimal page transitions:** Single-page app feel, no full reloads

**Why:** Users are racing against FOMO. If analysis takes >15 seconds, they'll tab away and ape in blindly.

---

### **4. Mobile-Aware, Web-First**

_"Optimize for desktop traders, ensure mobile usability"_

- **Primary viewport:** Desktop (1920x1080 and MacBook 1440x900)
- **Secondary viewport:** Mobile (375x667 iPhone SE and 414x896 iPhone 11+)
- **Responsive tabs:** Horizontal tabs on desktop, vertical accordion on mobile
- **Touch-friendly:** Buttons min 44x44px on mobile, tooltips become tap-to-reveal
- **Copy-friendly:** Easy tap-to-copy for contract addresses

**Why:** 70% of active traders use desktop for serious analysis, but 30% check on mobile during commutes. Don't lose mobile users, but don't compromise desktop UX.

---

### **5. Accessibility Without Compromise**

_"Readable for all, but not at the expense of power users"_

- **WCAG AA compliance:** 4.5:1 contrast ratio for body text, 3:1 for large text
- **Keyboard navigation:** All actions accessible via keyboard (Tab, Enter, Esc)
- **Screen reader support:** Semantic HTML, ARIA labels for dynamic content
- **No reliance on color alone:** Icons + text for all status indicators (not just red/green)

**Why:** Some crypto traders use dark mode + night shift due to long hours. Readability = retention.

---

## UI Design Goals

### **Platform & Technology**

**Primary Platform:** Web (React + TypeScript + Vite)  
**Target Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+  
**Responsive Breakpoints:**

- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: 320px - 767px

**Design System:** Custom lightweight system (not Material UI or Ant Design — too heavy)  
**Styling:** Tailwind CSS (utility-first, fast prototyping)  
**Component Library:** Headless UI (accessibility built-in) + custom components

---

### **Core Screen Structure**

#### **1. Landing Page (Pre-Auth)**

- Hero section with value prop: "90 minutes → 30 seconds"
- Live example analysis (demo mode, no login required)
- Social proof: "Used by 10,000+ traders" + testimonials
- Clear CTA: "Try Free Analysis" → triggers registration

#### **2. Registration/Login Flow**

- Minimal fields: Email + Password (no "Confirm Password" — slows down degens)
- Inline validation with clear error messages
- "Resend verification email" prominent if email not received
- Social login (optional future): "Continue with Google/Twitter"

#### **3. Dashboard (Main Hub)**

- **Top Nav:**
  - Logo (top left)
  - Search bar (center, always visible): "Paste contract address..."
  - User menu (top right): Settings, Subscription, Logout
  - Analysis quota indicator: "19 analyses remaining" (free) or "Unlimited" (premium)
- **Main Content:**
  - Recent analyses (cards with token name, chain, date, quick summary)
  - "Analyze New Token" prominent CTA
- **Future widgets** (Phase 2):
  - "Top 5 Bullish Coins This Week"
  - "Your Watchlist"

#### **4. Analysis Results Page**

- **Header:**
  - Token name + symbol (e.g., "Bonk • $BONK")
  - Chain badge (Solana / Ethereum / Base / BSC)
  - Quick status indicator: 🟢 Safe / 🟡 Caution / 🔴 High Risk
- **Tab Navigation:**
  - Horizontal tabs: Overview | Security | Tokenomics | Liquidity | Social
  - Active tab: Bold + underline
  - Each tab shows completeness icon (✅ Full data / ⚠️ Partial / ❌ No data)
- **Tab Content:**
  - Grid layout: 2-3 columns on desktop, single column on mobile
  - Data cards with clear labels, values, and source attribution
  - Tooltips on hover/tap: "Last fetched 3 minutes ago from DexScreener"
  - Copy-to-clipboard buttons for addresses
- **Action Bar (Bottom):**
  - "Share Analysis" button (social sharing for viral growth)
  - "Analyze Another Token" button
  - "Add to Watchlist" button (Phase 2)

#### **5. Settings Page**

- Sections: Profile, Security, Subscription, Danger Zone
- Profile: Email (read-only after verification), display name (optional)
- Security: Change password, view active sessions (future)
- Subscription: Current plan, usage stats, upgrade/cancel buttons
- Danger Zone: Export data, delete account (requires re-auth)

#### **6. Admin Panel (Admin Role Only)**

- Sidebar navigation: Users, Analyses, API Health, Settings
- **API Health Dashboard:**
  - Per-provider success rate (real-time line charts)
  - Average latency (bar charts)
  - Fallback trigger frequency (stacked area chart)
  - "Manually disable provider" toggle for maintenance

---

## Behavioral Specifications

### **Micro-Refinements (Critical UX Improvements)**

#### **1. Session Memory + Continuity**

**Requirement:** When returning to the dashboard, the app should persist the last search and show cached results instantly, even if the user closes the browser.

**Implementation:**

- Store `lastAnalyzedToken` in localStorage: `{ address: "0x...", chain: "ethereum", timestamp: 1234567890 }`
- On dashboard mount, check if `lastAnalyzedToken` exists and was analyzed <24 hours ago
- If yes, display: "Your last analysis: [Token Name] on [Chain] — [View Results]" with prominent link
- Cache results served immediately from Redis (1-5 min for price, 24h for metadata)

**Why:** Traders often multitask between DEXs, Telegram, and MemeDo. Session continuity = perceived reliability.

---

#### **2. Visual Data Integrity Indicator**

**Requirement:** A small status dot in the header ("🟢 Live / 🟡 Cached / 🔴 Partial") should reflect API completeness for current analysis.

**Implementation:**

- Calculate `data_completeness_score` (0-100) based on which tabs returned full data:
  - Overview: 20 points
  - Security: 30 points (most important)
  - Tokenomics: 20 points
  - Liquidity: 20 points
  - Social: 10 points
- Display status dot next to token name:
  - 🟢 **Live (90-100):** "All data from live sources"
  - 🟡 **Cached (70-89):** "Showing cached data (updated X min ago)"
  - 🔴 **Partial (<70):** "Some data unavailable (sources attempted: [list])"
- Tooltip on hover: "Data completeness: 85/100 — Last updated 3 minutes ago"

**Why:** Reinforces "transparency = trust" visually, no words required.

---

#### **3. UX Safety Guardrails**

**Requirement:** If user pastes an invalid or unsupported contract, immediately show validation feedback ("Invalid or unsupported chain address").

**Implementation:**

- Client-side validation (before API call):
  - Ethereum: `/^0x[a-fA-F0-9]{40}$/` (42 chars, 0x prefix + 40 hex)
  - Solana: Base58, 32-44 chars, no special chars
  - Show inline error below input: "⚠️ Invalid address format. Example: 0x123... (Ethereum) or 7xKXt... (Solana)"
- On paste, auto-detect chain and show preview: "Detected: Ethereum ERC-20"
- If unsupported chain (e.g., Polygon), show: "❌ Chain not supported yet. Supported: Ethereum, Solana"

**Why:** Prevents friction and wasted API calls.

---

#### **4. Micro-Conversion Hooks**

**Requirement:** Every "⚠️ Caution" or "🔴 Risk" message should end with "Learn Why →" linking to a short internal help modal.

**Implementation:**

- For each risk flag (e.g., "Freeze authority present"), append clickable link: "Learn Why →"
- Opens lightweight modal (not new page) with:
  - **Title:** "What is Freeze Authority?"
  - **Explanation:** "Solana tokens with freeze authority can be frozen by the owner, locking your funds. This is a red flag unless the project is verified."
  - **Risk Level:** High / Medium / Low
  - **Action:** "View all security terms" (links to `/help/security-glossary`)
- Modal closes on click outside or Esc key

**Why:** Educates users + retains them instead of letting them bounce to Google.

---

#### **5. Empty-State Monetization**

**Requirement:** When free users hit quota (20 analyses/mo), replace "Analyze" button with "Upgrade to Unlimited →" modal.

**Implementation:**

- On analysis attempt when `user.analyses_this_month >= 20`:
  - **Button state:** "Analyze" becomes "Upgrade to Unlimited" (orange/premium color)
  - On click, show modal:

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

  - Track conversion funnel: Modal shown → "Upgrade Now" clicked → Payment completed

**Why:** Converts frustration into revenue.

---

#### **6. Lightweight Help Overlay**

**Requirement:** Include a "?" icon in header → opens 1-minute product tour or hotkey list (built with Intro.js or custom).

**Implementation:**

- Help icon (?) in top-right header (next to user menu)
- On first login, auto-trigger tour (dismissible, never shown again)
- Tour steps:
  1. "Welcome to MemeDo! Paste a contract address here to start."
  2. "We'll analyze it across 5 tabs in <60 seconds."
  3. "Look for 🟢 Safe, 🟡 Caution, or 🔴 Risk indicators."
  4. "All data shows sources and timestamps for transparency."
  5. "You have 20 free analyses/month. Upgrade for unlimited!"
- Manual access: Click "?" → shows hotkey list:
  - `Ctrl/Cmd + K`: Focus search bar
  - `Esc`: Close modal
  - `Tab`: Navigate tabs

**Why:** Reduces onboarding drop-off by 20-30% for SaaS MVPs.

---

#### **7. Data Visualization**

**Requirement:** Use minimal charts only where clarity beats tables — e.g., holder distribution pie (Tokenomics), liquidity over 24h sparkline (Liquidity tab).

**Implementation:**

- **Tokenomics tab → Holder Distribution:**
  - Pie chart (Chart.js or Recharts):
    - Top 10 holders: Individual slices
    - Others: Single "Others" slice
  - Legend: Address (truncated) + % held
  - Tooltip: Full address + exact token amount
- **Liquidity tab → Liquidity Over 24h:**
  - Sparkline (mini line chart, no axes):
    - X-axis: Time (hourly)
    - Y-axis: Liquidity USD
    - Show trend (↑ +12% or ↓ -8%)
  - Tooltip on hover: "3pm: $890k liquidity"

- **Keep minimal:** No candles, no indicators, no TradingView clones
- **Mobile:** Charts scale down, pie becomes horizontal bar on small screens

**Why:** Keeps visual rhythm without turning dashboard into TradingView.

---

### **Additional Behavioral Rules**

#### **Analysis Input Behavior**

- Global search bar (always accessible in top nav)
- Paste contract address → auto-detect chain → show preview ("Ethereum: 0x123...")
- "Analyze" button or press Enter
- Loading state: Progress bar + "Fetching from DexScreener..." messages
- Error handling: Clear message + suggested action ("Check address format" / "Try again in 1 minute")

#### **Tooltips**

- Hover (desktop) or tap (mobile) to reveal
- Show data source, timestamp, confidence level
- Example: "Data from GoPlus • Last fetched 2 minutes ago • High confidence (verified by 2 sources)"

#### **Empty States**

- "No recent analyses yet" → CTA to analyze first token
- "No data available" → Explanation of sources attempted + suggestion to try again

#### **Loading States**

- Skeleton screens (not spinners) for predictable layout
- Progressive loading: Show Overview tab first, then Security, then rest
- Never block entire UI — show cached data with "Updating..." indicator

#### **Error States**

- Inline errors (form validation): Red text below input
- Toast notifications (API errors): Top-right corner, auto-dismiss in 5s
- Full-page errors (500): "Something went wrong" with "Try again" button

---

## Visual Design System

### **Color Palette**

**Primary Colors:**

- **Primary:** Deep blue `#0066FF` — trustworthy, professional (buttons, links, focus states)
- **Success:** Green `#10B981` — safe token indicators, positive feedback
- **Warning:** Yellow `#F59E0B` — caution flags, partial data warnings
- **Danger:** Red `#EF4444` — high-risk alerts, destructive actions
- **Neutral:** Gray scale `#F9FAFB` (lightest) → `#111827` (darkest) — background, text, borders

**Semantic Colors:**

- **Background:** `#FFFFFF` (white) for cards, `#F9FAFB` (off-white) for page background
- **Text:**
  - Primary: `#111827` (near-black)
  - Secondary: `#6B7280` (medium gray)
  - Tertiary: `#9CA3AF` (light gray)
- **Borders:** `#E5E7EB` (light gray) for subtle dividers

### **Typography**

**Font Family:**

- **Sans-serif:** Inter (headings + body) — geometric, clean, excellent readability
- **Monospace:** JetBrains Mono (contract addresses, code snippets)

**Font Sizes:**

```css
--text-xs: 12px; /* Small labels, timestamps */
--text-sm: 14px; /* Body text, secondary info */
--text-base: 16px; /* Primary body text, emphasis */
--text-lg: 18px; /* Large body, subheadings */
--text-xl: 20px; /* h3 */
--text-2xl: 24px; /* h2 */
--text-3xl: 30px; /* h1 (mobile) */
--text-4xl: 36px; /* h1 (desktop) */
```

**Font Weights:**

- Regular: 400 (body text)
- Medium: 500 (emphasis, labels)
- Semibold: 600 (subheadings, buttons)
- Bold: 700 (headings, critical info)

**Line Heights:**

- Body text: 1.5 (24px for 16px text)
- Headings: 1.2 (tighter for impact)

### **Spacing**

**Base Unit:** 4px (Tailwind default)

**Common Spacing Values:**

```
1 = 4px    (xs)
2 = 8px    (sm)
3 = 12px   (md)
4 = 16px   (base)
6 = 24px   (lg)
8 = 32px   (xl)
12 = 48px  (2xl)
16 = 64px  (3xl)
```

**Component Padding:**

- Cards: 16px (mobile), 24px (desktop)
- Buttons: 12px horizontal, 8px vertical (md size)
- Inputs: 12px horizontal, 10px vertical
- Modals: 24px (mobile), 32px (desktop)

### **Border Radius**

```
--radius-sm: 4px;     /* Small elements, badges */
--radius-md: 8px;     /* Buttons, inputs, cards */
--radius-lg: 12px;    /* Large cards, modals */
--radius-full: 9999px; /* Pills, avatar badges */
```

### **Shadows**

```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);        /* Subtle elevation */
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);         /* Card elevation */
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);       /* Modal, dropdown */
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);      /* High elevation */
```

---

## Component Library

### **Buttons**

**Primary Button:**

```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
  Analyze Token
</button>
```

- Use for primary actions (Analyze, Upgrade, Save)
- Hover: Darken by 1 shade
- Active: Darken by 2 shades + scale(0.98)
- Disabled: Opacity 0.5, cursor not-allowed

**Secondary Button:**

```tsx
<button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md">
  Cancel
</button>
```

- Use for secondary actions (Cancel, Maybe Later)

**Danger Button:**

```tsx
<button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">
  Delete Account
</button>
```

- Use for destructive actions (Delete, Remove)

**Ghost Button:**

```tsx
<button className="text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md">
  Learn More
</button>
```

- Use for tertiary actions (Learn More, View Details)

### **Inputs**

**Text Input:**

```tsx
<input
  type="text"
  placeholder="Paste contract address..."
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

- Focus: Blue ring (2px), remove default border color
- Error: Red border + red ring
- Disabled: Gray background, cursor not-allowed

**Label + Input Combo:**

```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Email</label>
  <input type="email" className="..." />
</div>
```

### **Cards**

**Standard Card:**

```tsx
<div className="bg-white rounded-lg shadow-md p-6 space-y-4">
  <h3 className="text-lg font-semibold text-gray-900">Token Overview</h3>
  <div className="space-y-2">{/* Card content */}</div>
</div>
```

- White background, subtle shadow
- 12px border radius (lg)
- 24px padding (desktop), 16px (mobile)

### **Badges**

**Status Badge:**

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  ✅ Safe
</span>
```

- Variants: Green (safe), Yellow (caution), Red (danger)
- Pill shape (9999px radius)
- Small caps text (uppercase optional)

### **Tabs**

**Tab Navigation:**

```tsx
<div className="border-b border-gray-200">
  <nav className="flex space-x-8">
    <button className="border-b-2 border-blue-600 text-blue-600 font-semibold py-4">
      Overview
    </button>
    <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4">
      Security
    </button>
  </nav>
</div>
```

- Active: Blue underline (2px), blue text
- Inactive: Transparent underline, gray text
- Hover: Darker gray text

### **Tooltips**

**Tooltip (Headless UI):**

```tsx
<Tooltip>
  <TooltipTrigger>
    <span className="text-gray-500 cursor-help">ℹ️</span>
  </TooltipTrigger>
  <TooltipContent className="bg-gray-900 text-white text-xs px-3 py-2 rounded-md max-w-xs">
    Data from DexScreener — last fetched 3 minutes ago
  </TooltipContent>
</Tooltip>
```

- Dark background (gray-900), white text
- Max width 300px
- Arrow pointing to trigger (optional)

### **Loading States**

**Skeleton Screen:**

```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

- Use for predictable layouts (cards, tables)
- Gray background (200), subtle pulse animation

**Spinner:**

```tsx
<svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  />
</svg>
```

- Use for indeterminate loading (API calls)

---

## Screen Specifications

### **1. Landing Page**

**Layout:**

```
┌─────────────────────────────────────────┐
│  [Logo]              [Login] [Sign Up]  │
├─────────────────────────────────────────┤
│                                         │
│    90 minutes → 30 seconds             │
│    Analyze meme coins with confidence   │
│                                         │
│        [Try Free Analysis →]            │
│                                         │
├─────────────────────────────────────────┤
│  [Demo Analysis Preview]                │
│  ┌────────┬────────┬────────┐          │
│  │Overview│Security│Tokenomi│          │
│  └────────┴────────┴────────┘          │
├─────────────────────────────────────────┤
│  Used by 10,000+ traders • $1M saved   │
└─────────────────────────────────────────┘
```

**Components:**

- Hero section: Centered, large heading (48px desktop, 32px mobile)
- CTA button: Primary (blue), prominent, above fold
- Demo: Live example analysis (read-only, no login required)
- Social proof: Numbers + testimonials (carousel)

---

### **2. Dashboard**

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ [Logo]  [Search: Paste contract...]  [👤 Menu] [19] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Recent Analyses                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ BONK     │ │ PEPE     │ │ WIF      │           │
│  │ Solana   │ │ Ethereum │ │ Solana   │           │
│  │ 🟢 Safe  │ │ 🟡 Caution│ │ 🔴 Risk  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  [+ Analyze New Token]                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components:**

- Top nav: Fixed, sticky on scroll
- Search bar: Always visible, auto-focus on `/` key
- Quota indicator (top-right): "19 analyses remaining" badge
- Recent analyses: Grid (3 cols desktop, 1 col mobile), card layout
- CTA: Large button, above fold

---

### **3. Analysis Results**

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ BONK • $BONK [Solana] 🟢 Safe                       │
├─────────────────────────────────────────────────────┤
│ [Overview] [Security] [Tokenomics] [Liquidity] [..] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Price: $0.0042 (+12% 24h)          [✅ Live]      │
│  Liquidity: $890k                                   │
│  24h Volume: $1.2M                                  │
│  Market Cap: $42M                                   │
│  ℹ️ Data from DexScreener • 2 min ago              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Share Analysis] [Analyze Another] [+ Watchlist]  │
└─────────────────────────────────────────────────────┘
```

**Components:**

- Header: Token name, chain badge, status dot
- Tabs: Horizontal (desktop), accordion (mobile)
- Tab content: 2-3 col grid, responsive
- Source attribution: Below each data section
- Action bar: Fixed bottom (mobile), inline (desktop)

---

## Interaction Patterns

### **Copy to Clipboard**

**Pattern:**

```tsx
<button onClick={() => copyToClipboard(address)} className="...">
  {copied ? '✓ Copied' : '📋 Copy'}
</button>
```

- On click: Copy to clipboard, show "Copied!" for 2 seconds
- Toast notification (optional): "Address copied to clipboard"

### **Progressive Disclosure**

**Pattern:**

- Load Overview tab first (most important)
- Show skeleton for other tabs
- Load Security → Tokenomics → Liquidity → Social in background
- Update tabs as data arrives (no waiting for all to complete)

### **Keyboard Shortcuts**

- **Cmd/Ctrl + K:** Focus search bar
- **Esc:** Close modal, clear search
- **Tab:** Navigate between tabs (in analysis)
- **Enter:** Submit form, trigger analyze

---

## Performance & Accessibility

### **Performance Budget**

- **Initial page load:** <2s (Time to Interactive)
- **Analysis results display:** <12s (API orchestration)
- **Tab switching:** <100ms (instant, no loading)
- **Image optimization:** WebP format, lazy loading
- **JavaScript bundle:** <200KB gzipped
- **CSS bundle:** <50KB gzipped

### **Accessibility Standards**

**WCAG 2.1 Level AA Compliance:**

- **Color contrast:** 4.5:1 for body text, 3:1 for large text/icons
- **Semantic HTML:** `<nav>`, `<main>`, `<article>`, `<section>`
- **ARIA labels:** Dynamic content announced to screen readers
  ```tsx
  <button aria-label="Analyze token">Analyze</button>
  ```
- **Focus management:** Visible focus rings, logical tab order
- **Keyboard shortcuts:** Document in help section
- **Screen reader:** Test with VoiceOver (macOS), NVDA (Windows)

### **Responsive Design**

**Breakpoints:**

```css
/* Mobile: 320px - 767px */
@media (max-width: 767px) {
  /* Single column, stacked layout */
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2-column layout, compact nav */
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  /* 3-column layout, full nav */
}
```

---

## Future-Proofing

### **Dark Mode Preparation**

Even if not implemented in MVP, design with dark mode in mind:

```css
/* Add data-theme attribute early */
<html data-theme="light">

/* Define CSS variables */
:root[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #111827;
}

:root[data-theme='dark'] {
  --color-bg: #111827;
  --color-text: #f9fafb;
}
```

**Cost:** Zero (just structure CSS properly)  
**Payoff:** Huge when dark mode becomes priority (Phase 2)

### **Localization Hooks**

Even if English-only, wrap copy in simple translation function:

```tsx
// Instead of:
<button>Analyze Token</button>

// Use:
<button>{t('analyze_token')}</button>
```

**Cost:** Minimal (wrapper function)  
**Payoff:** Easy to add Spanish, Portuguese, Chinese later

---

## Design Deliverables (To Be Created)

These will be created during dedicated UX workflow (post-PRD):

1. **Component Library** (Figma or Storybook)
   - All button variants, inputs, cards, badges
   - Interactive states (hover, focus, active, disabled)

2. **Wireframes** (Low-fidelity)
   - Landing page, dashboard, analysis results, settings

3. **High-Fidelity Mockups** (Optional for MVP)
   - Can be deferred to Phase 2
   - Developers can build from wireframes + this spec

4. **Interaction Specifications**
   - Animation durations (200ms hover, 300ms tab transition)
   - Transition types (ease-in-out, spring)
   - Micro-interactions (success checkmarks, error shakes)

---

**Prepared for:** Frontend development team using React + TypeScript + Tailwind  
**Success Criteria:** Beautiful, fast, accessible UI that converts free → premium at 15-20% rate
