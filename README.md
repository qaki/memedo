# MemeDo - Multi-Chain Crypto Analysis Platform

**Status:** 🚧 In Development (Epic 1 Complete)  
**Version:** 1.0.0-alpha  
**Tech Stack:** React + TypeScript + Express + PostgreSQL + Redis

---

## Project Overview

MemeDo is a SaaS platform that provides comprehensive multi-chain token analysis (Ethereum, Solana, Base, BSC) with intelligent API fallback orchestration, delivering 95%+ data completeness in under 60 seconds.

**Key Features:**

- Multi-chain token analysis (ETH, SOL, Base, BSC)
- 5-tab analysis dashboard (Overview, Security, Tokenomics, Liquidity, Social)
- Chain-Aware Fallback Orchestrator (CAFO) for 95%+ reliability
- Free tier (20 analyses/month) and Premium tier (unlimited)
- JWT authentication with 2FA for admins
- Stripe + LemonSqueezy payment integration

---

## Project Structure

```
memedo/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/           # React components and pages
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   ├── db/        # Drizzle ORM schemas and migrations
│   │   ├── utils/     # Environment validation, helpers
│   │   └── server.ts  # Express app entry point
│   └── package.json   # Backend dependencies
├── shared/            # Shared Zod validation schemas
│   ├── src/
│   │   ├── schemas/   # Auth, User, Analysis, API schemas
│   │   ├── constants/ # Shared constants (chains, roles, limits)
│   │   └── utils/     # Validation and formatting utilities
│   └── package.json   # Shared package dependencies
├── docs/              # Project documentation
│   ├── prd.md         # Product Requirements Document
│   ├── frontend-spec.md # UI/UX Specifications
│   ├── fullstack-architecture.md # Technical Architecture
│   └── epic-01-project-initialization.md # Epic 1 Implementation
└── package.json       # Root monorepo configuration
```

---

## Prerequisites

- **Node.js**: v20.x LTS or higher
- **pnpm**: v8.x or higher (install with `npm install -g pnpm`)
- **Neon PostgreSQL**: Account at https://neon.tech (free tier available)
- **Upstash Redis**: Account at https://upstash.com (free tier available)

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd memedo

# Install all dependencies (frontend, backend, shared)
pnpm install
```

### 2. Environment Configuration

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your credentials
```

**Required immediately:**

- `DATABASE_URL` - Get from Neon PostgreSQL console
- `REDIS_URL` - Get from Upstash Redis console
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 32`
- `TOTP_ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
- `FRONTEND_URL` - `http://localhost:5173`

**Optional for full functionality:**

- `HELIUS_API_KEY` - Solana blockchain data
- `ETHERSCAN_API_KEY` - Ethereum blockchain data
- `STRIPE_SECRET_KEY` - Payment processing
- `RESEND_API_KEY` - Email notifications

### 3. Database Setup

```bash
# In backend directory
cd backend

# Generate migrations from schema
pnpm db:generate

# Apply migrations to Neon database
pnpm db:migrate

# (Optional) Open Drizzle Studio to view tables
pnpm db:studio
# Opens http://localhost:4983
```

### 4. Development Servers

```bash
# From project root, run both servers concurrently
pnpm dev

# Or run individually:
pnpm dev:frontend  # http://localhost:5173
pnpm dev:backend   # http://localhost:3000
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] Frontend loads at http://localhost:5173 with "Welcome to MemeDo 🚀"
- [ ] Backend health check returns 200: `curl http://localhost:3000/health`
- [ ] Database tables visible: `cd backend && pnpm db:studio`
- [ ] Environment validation passes: `cd backend && pnpm test:env`
- [ ] Linting passes: `pnpm lint`
- [ ] TypeScript compiles: `pnpm type-check`
- [ ] Git hooks prevent bad commits (test with a linting error)

---

## Development Workflows

### Starting Development

```bash
# Start frontend and backend concurrently
pnpm dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Code Quality

```bash
# Run ESLint on all packages
pnpm lint

# Auto-fix ESLint issues
pnpm lint:fix

# Format all code with Prettier
pnpm format

# Check formatting without changes
pnpm format:check

# TypeScript type checking across all packages
pnpm type-check
```

### Database Operations

```bash
# Navigate to backend
cd backend

# Test database connection
pnpm db:test

# Generate new migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (visual database browser)
pnpm db:studio

# Drop all tables (⚠️ DESTRUCTIVE)
pnpm db:drop
```

### Building for Production

```bash
# Build shared package first, then backend and frontend
pnpm build

# Individual builds:
pnpm build:shared
pnpm build:backend
pnpm build:frontend
```

---

## Git Workflow

### Pre-commit Hooks

Husky is configured to run lint-staged on every commit:

1. **Auto-formats** TypeScript, JSON, Markdown, YAML files with Prettier
2. **Auto-fixes** ESLint issues in TypeScript files
3. **Blocks commit** if unfixable errors exist

Test it:

```bash
# Make a change with a linting error
# Husky will auto-fix or block the commit
git add .
git commit -m "test commit"
```

---

## Architecture Highlights

### 🎯 Novel Pattern: Chain-Aware Fallback Orchestrator (CAFO)

MemeDo's core differentiator is its intelligent API fallback system:

- **Primary → Secondary → Tertiary** failover for each blockchain
- **Parallel execution** of non-overlapping data sources
- **95%+ success rate** vs. 60% for single-provider solutions
- **Sub-60s response** with graceful degradation

See `docs/fullstack-architecture.md` Section 6 for full details.

### 🗄️ Database Schema

- **Users**: Authentication, roles, 2FA, usage tracking
- **Analyses**: Token analysis results with JSONB flexibility
- **Subscriptions**: Stripe/LemonSqueezy integration
- **API Logs**: External API monitoring and fallback tracking

### 🔐 Security

- **JWT** with httpOnly cookies and refresh tokens
- **Mandatory 2FA** for admin accounts (TOTP)
- **bcrypt** password hashing (10 rounds)
- **Zod** input validation on all endpoints
- **Rate limiting**: 30 req/min global, 20 analyses/month for free tier
- **90-day API key rotation** schedule

---

## Epic 1 Completion Summary

✅ **Story 1.1:** Monorepo initialization (pnpm workspaces)  
✅ **Story 1.2:** Frontend setup (React + Vite + TypeScript + Tailwind)  
✅ **Story 1.3:** Backend setup (Express + TypeScript + hot-reload)  
✅ **Story 1.4:** Shared package (Zod schemas, constants, utilities)  
✅ **Story 1.5:** Neon PostgreSQL provisioning  
✅ **Story 1.6:** Drizzle ORM configuration and schema definition  
✅ **Story 1.7:** Database migration execution  
✅ **Story 1.8:** Development tooling (ESLint, Prettier, Husky)  
✅ **Story 1.9:** Environment variable validation (Zod)  
✅ **Story 1.10:** Epic completion verification

**Next Epic:** Authentication & User Management

---

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
cd backend
pnpm db:test

# Check DATABASE_URL format (Neon requires pooler connection string)
# Example: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require
```

### Environment Validation Errors

```bash
# Run environment validation test
cd backend
pnpm test:env

# Check for missing variables
# Ensure JWT_SECRET and JWT_REFRESH_SECRET are at least 32 characters
# Ensure TOTP_ENCRYPTION_KEY is exactly 64 hex characters
```

### Port Already in Use

```bash
# Backend port 3000 in use
PORT=3001 pnpm dev:backend

# Frontend port 5173 in use
# Edit frontend/vite.config.ts and change server.port
```

---

## Documentation

- **PRD**: `docs/prd.md` - Product requirements and user journeys
- **Frontend Spec**: `docs/frontend-spec.md` - UI/UX specifications
- **Architecture**: `docs/fullstack-architecture.md` - Technical decisions
- **Epic 1**: `docs/epic-01-project-initialization.md` - Implementation guide

---

## License

ISC

---

## Contact

For questions or issues, please open a GitHub issue or contact the development team.

---

**🚀 MemeDo - Making crypto token analysis reliable, fast, and accessible.**
