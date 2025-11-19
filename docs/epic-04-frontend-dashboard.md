# Epic 4: Frontend Dashboard - Implementation Plan

**Status:** 🚧 In Progress  
**Priority:** High  
**Estimated Effort:** 3-4 days  
**Dependencies:** Epic 1 ✅, Epic 2 ✅, Epic 3 ✅

---

## 📋 Overview

Build a modern, responsive React frontend dashboard that connects to the MemeDo backend API, providing users with authentication, token analysis, and portfolio management features.

---

## 🎯 Goals

1. **User Authentication** - Complete auth flow (register, login, verify email, 2FA)
2. **Token Analysis** - Multi-chain token search and comprehensive analysis display
3. **Analysis History** - View past analyses with filtering and pagination
4. **User Dashboard** - Profile management, usage stats, and settings
5. **Responsive Design** - Mobile-first, beautiful UI with Tailwind CSS
6. **Type Safety** - 100% TypeScript with shared Zod schemas

---

## 🏗️ Tech Stack (Already Configured)

- ✅ **React 19** - UI framework
- ✅ **TypeScript** - Type safety
- ✅ **Vite** - Build tool
- ✅ **Tailwind CSS** - Styling
- ✅ **React Router v6** - Navigation
- ✅ **React Hook Form** - Form management
- ✅ **Zustand** - State management
- ✅ **Axios** - API client
- ✅ **@memedo/shared** - Shared Zod schemas

---

## 📦 User Stories

### Story 1: API Client & Authentication State ⏳

**As a developer, I need a configured API client and auth state management**

**Acceptance Criteria:**

- [ ] Axios instance with base URL and interceptors
- [ ] Request interceptor adds JWT token to headers
- [ ] Response interceptor handles 401 errors and token refresh
- [ ] Zustand store for auth state (user, isAuthenticated, loading)
- [ ] Auth actions (login, logout, register, refreshToken)
- [ ] Persist auth state to localStorage

**Files to Create:**

- `src/lib/api.ts` - Axios instance
- `src/stores/auth.store.ts` - Zustand auth store
- `src/types/index.ts` - Frontend-specific types

---

### Story 2: Layout & Navigation ⏳

**As a user, I need a consistent layout with navigation**

**Acceptance Criteria:**

- [ ] Main layout component with header, sidebar, and content area
- [ ] Responsive navigation (mobile hamburger menu)
- [ ] User menu with profile dropdown
- [ ] Protected route wrapper component
- [ ] Public route wrapper (redirects if authenticated)

**Files to Create:**

- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/UserMenu.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/PublicRoute.tsx`

---

### Story 3: Authentication Pages ⏳

**As a user, I want to register, login, and manage my account**

**Acceptance Criteria:**

- [ ] Login page with email/password form
- [ ] Register page with validation
- [ ] Email verification page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] 2FA setup page
- [ ] Form validation using React Hook Form + Zod
- [ ] Loading states and error messages
- [ ] Success redirects

**Files to Create:**

- `src/pages/auth/Login.tsx`
- `src/pages/auth/Register.tsx`
- `src/pages/auth/VerifyEmail.tsx`
- `src/pages/auth/ForgotPassword.tsx`
- `src/pages/auth/ResetPassword.tsx`
- `src/pages/auth/Setup2FA.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`

---

### Story 4: Token Analysis Page ⏳

**As a user, I want to search and analyze tokens across multiple chains**

**Acceptance Criteria:**

- [ ] Token search form with chain selector
- [ ] Contract address validation
- [ ] Loading state during analysis (20-30s)
- [ ] Analysis results display with 5 sections:
  - Overview (safety score, risk level, metadata)
  - Security scan (honeypot, mint, blacklist, etc.)
  - Tokenomics (supply, holders, concentration)
  - Liquidity (pools, volume, locked %)
  - Social sentiment (placeholder for now)
- [ ] Color-coded risk indicators
- [ ] Copy contract address button
- [ ] Share analysis button
- [ ] Export to PDF (optional)

**Files to Create:**

- `src/pages/analysis/AnalyzeToken.tsx`
- `src/components/analysis/TokenSearchForm.tsx`
- `src/components/analysis/ChainSelector.tsx`
- `src/components/analysis/AnalysisLoading.tsx`
- `src/components/analysis/AnalysisResults.tsx`
- `src/components/analysis/OverviewTab.tsx`
- `src/components/analysis/SecurityTab.tsx`
- `src/components/analysis/TokenomicsTab.tsx`
- `src/components/analysis/LiquidityTab.tsx`
- `src/components/analysis/SocialTab.tsx`
- `src/components/analysis/SafetyScoreBadge.tsx`
- `src/components/analysis/RiskLevelBadge.tsx`
- `src/stores/analysis.store.ts`

---

### Story 5: Analysis History ⏳

**As a user, I want to view my past token analyses**

**Acceptance Criteria:**

- [ ] List of past analyses (most recent first)
- [ ] Each item shows: token address, chain, safety score, risk level, date
- [ ] Click to view full analysis details
- [ ] Filter by chain
- [ ] Filter by risk level
- [ ] Pagination (10 per page)
- [ ] Empty state if no analyses
- [ ] Delete analysis button

**Files to Create:**

- `src/pages/analysis/AnalysisHistory.tsx`
- `src/components/analysis/AnalysisHistoryList.tsx`
- `src/components/analysis/AnalysisHistoryItem.tsx`
- `src/components/analysis/AnalysisFilters.tsx`
- `src/components/common/Pagination.tsx`
- `src/components/common/EmptyState.tsx`

---

### Story 6: User Dashboard ⏳

**As a user, I want to see my account info and usage stats**

**Acceptance Criteria:**

- [ ] Dashboard page showing:
  - Welcome message with user name
  - Current plan (Free/Premium)
  - Usage stats (analyses this month / limit)
  - Usage chart (optional)
  - Recent analyses (last 5)
  - Quick analyze button
- [ ] Profile page with:
  - Email (read-only)
  - Display name (editable)
  - Change password form
  - Account created date
- [ ] Settings page with:
  - Email preferences
  - 2FA enable/disable
  - Danger zone (delete account)

**Files to Create:**

- `src/pages/dashboard/Dashboard.tsx`
- `src/pages/dashboard/Profile.tsx`
- `src/pages/dashboard/Settings.tsx`
- `src/components/dashboard/WelcomeBanner.tsx`
- `src/components/dashboard/UsageCard.tsx`
- `src/components/dashboard/RecentAnalyses.tsx`
- `src/components/dashboard/QuickAnalyze.tsx`
- `src/components/profile/ProfileForm.tsx`
- `src/components/profile/ChangePasswordForm.tsx`
- `src/components/settings/EmailPreferences.tsx`
- `src/components/settings/TwoFactorSettings.tsx`

---

### Story 7: UI Components Library ⏳

**As a developer, I need reusable UI components**

**Acceptance Criteria:**

- [ ] Button component (variants: primary, secondary, danger, ghost)
- [ ] Input component with label and error display
- [ ] Card component
- [ ] Badge component (colors: green, yellow, red, blue, gray)
- [ ] Modal/Dialog component
- [ ] Toast notification system
- [ ] Loading spinner
- [ ] Tooltip component
- [ ] Tabs component
- [ ] Dropdown menu
- [ ] All components support dark mode (future)

**Files to Create:**

- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/Spinner.tsx`
- `src/components/ui/Tooltip.tsx`
- `src/components/ui/Tabs.tsx`
- `src/components/ui/Dropdown.tsx`
- `src/hooks/useToast.ts`

---

### Story 8: Routing & Navigation ⏳

**As a user, I want intuitive navigation between pages**

**Acceptance Criteria:**

- [ ] Route configuration with React Router v6
- [ ] Public routes (/, /login, /register, /verify-email/:token, /forgot-password, /reset-password/:token)
- [ ] Protected routes (/dashboard, /analyze, /history, /profile, /settings)
- [ ] 404 Not Found page
- [ ] Redirects after auth actions
- [ ] Loading states during navigation

**Files to Create:**

- `src/router/index.tsx` - Route configuration
- `src/pages/NotFound.tsx`
- `src/pages/Home.tsx` - Landing page

---

### Story 9: Error Handling & Loading States ⏳

**As a user, I want clear feedback when things go wrong**

**Acceptance Criteria:**

- [ ] Global error boundary
- [ ] API error handling with user-friendly messages
- [ ] Loading skeletons for data fetching
- [ ] Network error detection
- [ ] Retry logic for failed requests
- [ ] Toast notifications for errors

**Files to Create:**

- `src/components/error/ErrorBoundary.tsx`
- `src/components/error/ErrorMessage.tsx`
- `src/components/loading/Skeleton.tsx`
- `src/utils/error-handler.ts`

---

### Story 10: Landing Page (Optional MVP) ⏳

**As a visitor, I want to understand what MemeDo offers**

**Acceptance Criteria:**

- [ ] Hero section with value proposition
- [ ] Features section (multi-chain, fast, reliable, secure)
- [ ] How it works (3 steps)
- [ ] Pricing cards (Free vs Premium)
- [ ] CTA buttons (Get Started, Try Demo)
- [ ] Footer with links

**Files to Create:**

- `src/pages/Home.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/Features.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/Pricing.tsx`
- `src/components/landing/Footer.tsx`

---

## 🎨 Design System

### Colors

```css
/* Primary (Indigo) */
--color-primary-50: #eef2ff;
--color-primary-500: #6366f1;
--color-primary-600: #4f46e5;
--color-primary-700: #4338ca;

/* Success (Green) */
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Warning (Yellow) */
--color-warning-500: #eab308;
--color-warning-600: #ca8a04;

/* Danger (Red) */
--color-danger-500: #ef4444;
--color-danger-600: #dc2626;

/* Gray */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-500: #6b7280;
--color-gray-700: #374151;
--color-gray-900: #111827;
```

### Typography

- **Headings:** font-bold
- **Body:** font-normal
- **Mono:** font-mono (for addresses)

### Spacing

- **Container:** max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- **Card padding:** p-6
- **Button padding:** px-4 py-2

---

## 📁 Project Structure

```
frontend/src/
├── assets/              # Images, icons
├── components/
│   ├── analysis/        # Token analysis components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── error/           # Error handling
│   ├── landing/         # Landing page components
│   ├── layout/          # Layout components
│   ├── loading/         # Loading states
│   ├── profile/         # User profile
│   ├── settings/        # Settings
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/
│   ├── api.ts           # Axios configuration
│   └── utils.ts         # Utility functions
├── pages/
│   ├── analysis/        # Analysis pages
│   ├── auth/            # Auth pages
│   ├── dashboard/       # Dashboard pages
│   ├── Home.tsx         # Landing page
│   └── NotFound.tsx     # 404 page
├── router/
│   └── index.tsx        # Route configuration
├── stores/              # Zustand stores
│   ├── auth.store.ts
│   ├── analysis.store.ts
│   └── ui.store.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

---

## 🔄 Implementation Order

### Phase 1: Foundation (Day 1)

1. ✅ Setup API client (`src/lib/api.ts`)
2. ✅ Create auth store (`src/stores/auth.store.ts`)
3. ✅ Build UI component library (`src/components/ui/`)
4. ✅ Create layout components (`src/components/layout/`)
5. ✅ Setup routing (`src/router/index.tsx`)

### Phase 2: Authentication (Day 1-2)

6. ✅ Login page
7. ✅ Register page
8. ✅ Email verification page
9. ✅ Forgot/Reset password pages
10. ✅ Protected route wrapper

### Phase 3: Core Features (Day 2-3)

11. ✅ Token analysis page
12. ✅ Analysis results display
13. ✅ Analysis history page
14. ✅ User dashboard

### Phase 4: Profile & Settings (Day 3)

15. ✅ Profile page
16. ✅ Settings page
17. ✅ 2FA setup

### Phase 5: Polish & Testing (Day 4)

18. ✅ Error handling
19. ✅ Loading states
20. ✅ Responsive design
21. ✅ Landing page (optional)
22. ✅ E2E testing

---

## 🧪 Testing Strategy

### Manual Testing

- [ ] Register new account
- [ ] Verify email
- [ ] Login/logout
- [ ] Analyze Ethereum USDT
- [ ] Analyze Solana BONK
- [ ] View history
- [ ] Update profile
- [ ] Enable 2FA
- [ ] Test on mobile

### Automated Testing (Future)

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

---

## 📊 Success Metrics

- [ ] All 10 user stories completed
- [ ] 100% TypeScript coverage
- [ ] Mobile responsive (375px - 1920px)
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] API integration working
- [ ] Authentication flow complete
- [ ] Token analysis working

---

## 🚀 Deployment

- **Platform:** Render (frontend already configured)
- **Domain:** https://meme-do.com
- **Build:** `pnpm build`
- **Environment Variables:**
  - `VITE_API_URL` - Backend API URL

---

## 📝 Notes

- Use shared Zod schemas from `@memedo/shared` for validation
- All API calls go through `src/lib/api.ts` with proper error handling
- Zustand stores handle all state management
- React Hook Form + Zod for all forms
- Tailwind CSS for all styling
- No external UI libraries (build custom components)

---

**Let's build an amazing dashboard!** 🚀
