# Epic 1: Project Initialization, Foundational Setup, and Database Deployment

**Epic ID:** MEMEDO-EPIC-01  
**Epic Owner:** Qlirim Elezi (Founder/Developer)  
**Status:** Ready for Implementation  
**Target Completion:** Week 1-2 (10-15 hours)  
**Dependencies:** None (foundational epic)  
**Success Criteria:** Complete monorepo structure with database deployed and first migration applied

---

## Epic Overview

**Goal:** Establish the complete MemeDo project foundation with a fully configured monorepo, TypeScript build pipeline, database infrastructure, and development tooling. By the end of this epic, the project will have:

- ✅ Monorepo structure with `frontend`, `backend`, and `shared` packages
- ✅ TypeScript configuration across all packages
- ✅ Neon PostgreSQL database provisioned and connected
- ✅ Drizzle ORM configured with initial schema and migrations
- ✅ Environment variable management with validation
- ✅ Development tooling (ESLint, Prettier, Husky git hooks)
- ✅ Basic "Hello World" verification for frontend and backend

**Why This Matters:** A solid foundation prevents technical debt and ensures consistent development practices. This epic establishes patterns that will be followed throughout the entire project lifecycle.

---

## User Stories

### Story 1.1: Monorepo Initialization with pnpm Workspaces

**As a** developer  
**I want** a monorepo structure with shared TypeScript configurations  
**So that** I can maintain code consistency and share validation logic between frontend and backend

**Acceptance Criteria:**

- [ ] Project root initialized with `pnpm` workspace
- [ ] Three packages created: `frontend`, `backend`, `shared`
- [ ] Each package has valid `package.json` with correct dependencies
- [ ] Root `pnpm-workspace.yaml` configures workspace packages
- [ ] All packages can be installed with single `pnpm install` command
- [ ] Git repository initialized with appropriate `.gitignore`

**Implementation Steps:**

```bash
# 1. Create project root and initialize pnpm
mkdir memedo && cd memedo
pnpm init
git init

# 2. Create workspace configuration
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'frontend'
  - 'backend'
  - 'shared'
EOF

# 3. Create directory structure
mkdir -p frontend backend shared docs logs tools

# 4. Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Deployment
.vercel/
.render/

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
EOF

# 5. Verify structure
tree -L 2 -a
```

**Definition of Done:**

- All directories created with correct structure
- Git repository initialized with clean status
- `pnpm-workspace.yaml` correctly references all packages
- `.gitignore` prevents secrets and artifacts from being committed

**Time Estimate:** 30 minutes

---

### Story 1.2: Frontend Package Setup (React + Vite + TypeScript)

**As a** frontend developer  
**I want** a modern React development environment with Vite and TypeScript  
**So that** I can build the UI with fast hot-reload and type safety

**Acceptance Criteria:**

- [ ] React 18.2.x + TypeScript 5.3.x installed
- [ ] Vite 5.x configured as build tool
- [ ] Tailwind CSS 3.4.x configured with PostCSS
- [ ] Development server runs on `http://localhost:5173`
- [ ] "Hello MemeDo" placeholder renders successfully
- [ ] TypeScript compilation works with no errors
- [ ] Tailwind utility classes apply correctly

**Implementation Steps:**

```bash
# Navigate to frontend directory
cd frontend

# Initialize Vite React TypeScript project
pnpm create vite@latest . --template react-ts

# Install core dependencies
pnpm install

# Install Tailwind CSS
pnpm add -D tailwindcss@3.4 postcss autoprefixer
pnpx tailwindcss init -p

# Install additional frontend dependencies
pnpm add react-router-dom@6 zustand@4 axios@1 react-hook-form@7 zod@3
pnpm add -D @types/node

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
EOF

# Update src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# Create basic App.tsx
cat > src/App.tsx << 'EOF'
import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MemeDo 🚀
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Multi-chain crypto analysis platform
        </p>
        <div className="space-x-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            React 18
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            TypeScript
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            Vite
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
            Tailwind CSS
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
EOF

# Update tsconfig.json for path aliases
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Add scripts to package.json
cat > package.json << 'EOF'
{
  "name": "memedo-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/node": "^20.10.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0"
  }
}
EOF

# Test dev server
pnpm run dev
```

**Verification:**

```bash
# In frontend directory
pnpm run dev
# Visit http://localhost:5173
# Should see "Welcome to MemeDo 🚀" with Tailwind styling
```

**Definition of Done:**

- Frontend dev server starts without errors
- Tailwind CSS classes render correctly
- TypeScript compilation succeeds
- Hot module replacement works on file changes
- All dependencies installed and locked in `pnpm-lock.yaml`

**Time Estimate:** 1 hour

---

### Story 1.3: Backend Package Setup (Express + TypeScript)

**As a** backend developer  
**I want** an Express API with TypeScript and development hot-reload  
**So that** I can build REST endpoints with type safety and fast iteration

**Acceptance Criteria:**

- [ ] Express 4.18.x + TypeScript 5.3.x installed
- [ ] Development server with hot-reload via `tsx`
- [ ] CORS configured for frontend origin
- [ ] Health check endpoint returns 200 OK
- [ ] Server runs on `http://localhost:3000`
- [ ] Environment variables loaded from `.env`
- [ ] TypeScript compilation works with no errors

**Implementation Steps:**

```bash
# Navigate to backend directory
cd ../backend

# Initialize package
pnpm init

# Install dependencies
pnpm add express@4 cors@2 dotenv@16 bcrypt@5 jsonwebtoken@9 zod@3
pnpm add -D typescript@5 @types/node@20 @types/express@4 @types/cors@2 @types/bcrypt@5 @types/jsonwebtoken@9 tsx@4 nodemon@3

# Initialize TypeScript
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create directory structure
mkdir -p src/{config,middleware,routes,controllers,services,db,utils}

# Create main server file
cat > src/server.ts << 'EOF'
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'memedo-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes placeholder
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'MemeDo API v1',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An error occurred'
        : err.message,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ MemeDo Backend running on http://localhost:${PORT}`);
  console.log(`✅ Frontend allowed from: ${FRONTEND_URL}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "memedo-backend",
  "version": "1.0.0",
  "description": "MemeDo Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.0"
  }
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/memedo

# Redis Cache
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-here-min-32-chars
TOTP_ENCRYPTION_KEY=your-totp-encryption-key-64-hex-chars

# External APIs
DEXSCREENER_API_KEY=
HELIUS_API_KEY=
ETHERSCAN_API_KEY=
GOPLUS_API_KEY=
COVALENT_API_KEY=
RUGCHECK_API_KEY=
BIRDEYE_API_KEY=

# Payment Providers
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
LEMON_SQUEEZY_API_KEY=

# Email Service
RESEND_API_KEY=
FROM_EMAIL=noreply@memedo.io
EOF

# Create initial .env for development
cp .env.example .env

# Test server
pnpm run dev
```

**Verification:**

```bash
# In backend directory
pnpm run dev

# In another terminal
curl http://localhost:3000/health
# Should return JSON with status: "healthy"

curl http://localhost:3000/api
# Should return API info
```

**Definition of Done:**

- Backend server starts without errors on port 3000
- Health check endpoint returns 200 with correct JSON structure
- CORS allows requests from frontend origin
- Hot-reload works when editing TypeScript files
- Environment variables load from `.env` file
- TypeScript compilation succeeds with strict mode

**Time Estimate:** 1.5 hours

---

### Story 1.4: Shared Package Setup (Zod Validation Schemas)

**As a** full-stack developer  
**I want** shared TypeScript types and Zod validation schemas  
**So that** frontend and backend use identical validation logic

**Acceptance Criteria:**

- [ ] Shared package initialized with TypeScript
- [ ] Zod schemas for authentication exported
- [ ] Frontend and backend can import from `@shared/*`
- [ ] TypeScript type inference works across packages
- [ ] No duplication of validation logic

**Implementation Steps:**

```bash
# Navigate to shared directory
cd ../shared

# Initialize package
pnpm init

# Install dependencies
pnpm add zod@3
pnpm add -D typescript@5

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create directory structure
mkdir -p src/schemas

# Create auth validation schemas
cat > src/schemas/auth.schema.ts << 'EOF'
import { z } from 'zod';

// Password validation (FR002)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation
const emailSchema = z.string().email('Invalid email format');

// Register schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  display_name: z.string().max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  totp_token: z.string().length(6).optional(), // For 2FA
});

export type LoginInput = z.infer<typeof loginSchema>;

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Password reset request schema
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

// Password reset confirm schema
export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  new_password: passwordSchema,
});

export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;
EOF

# Create analysis validation schemas
cat > src/schemas/analysis.schema.ts << 'EOF'
import { z } from 'zod';

// Chain validation
export const chainSchema = z.enum(['ethereum', 'solana', 'base', 'bsc']);

export type Chain = z.infer<typeof chainSchema>;

// Contract address validation
export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

export const solanaAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format');

// Analysis request schema
export const analyzeTokenSchema = z.object({
  chain: chainSchema,
  contract_address: z.string().min(1, 'Contract address is required'),
});

export type AnalyzeTokenInput = z.infer<typeof analyzeTokenSchema>;

// Analysis response type (will be expanded in later epics)
export interface AnalysisResult {
  analysis_id: string;
  chain: Chain;
  contract_address: string;
  token_name?: string;
  token_symbol?: string;
  completeness_score: number;
  analysis_duration_ms: number;
  cache_hit: boolean;
  sources_used: string[];
  sources_failed: string[];
  results: {
    overview?: unknown;
    security?: unknown;
    tokenomics?: unknown;
    liquidity?: unknown;
    social?: unknown;
  };
  analyzed_at: string;
  expires_at: string;
}
EOF

# Create index file for exports
cat > src/index.ts << 'EOF'
// Auth schemas
export * from './schemas/auth.schema';

// Analysis schemas
export * from './schemas/analysis.schema';
EOF

# Update package.json
cat > package.json << 'EOF'
{
  "name": "memedo-shared",
  "version": "1.0.0",
  "description": "Shared types and validation schemas for MemeDo",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
EOF

# Build shared package
pnpm run build
```

**Verification:**

```bash
# In shared directory
pnpm run build
# Should compile without errors and generate dist/ folder

# Check generated types
ls -la dist/
# Should see index.js, index.d.ts, and schemas/ folder
```

**Definition of Done:**

- Shared package compiles to JavaScript with TypeScript declarations
- All Zod schemas export correctly
- Type inference works (TypeScript can infer types from Zod schemas)
- Frontend and backend can import schemas (verified in later stories)

**Time Estimate:** 1 hour

---

### Story 1.5: Neon PostgreSQL Database Provisioning

**As a** developer  
**I want** a Neon PostgreSQL database provisioned and accessible  
**So that** I can store user data and analysis results

**Acceptance Criteria:**

- [ ] Neon account created (or existing account used)
- [ ] New database created: `memedo-dev`
- [ ] Connection string obtained and stored in `.env`
- [ ] Database connection tested successfully
- [ ] Connection pooling enabled

**Implementation Steps:**

**Step 1: Create Neon Database**

1. Visit https://console.neon.tech
2. Sign in or create account
3. Click "New Project"
4. Configure project:
   - **Project name**: `memedo`
   - **Database name**: `memedo_dev`
   - **Region**: Choose closest to you (e.g., US East (Ohio) or EU (Frankfurt))
   - **Compute size**: Free tier (0.25 vCPU, sufficient for MVP)
5. Click "Create Project"
6. Copy the connection string from dashboard

**Step 2: Update Backend .env**

```bash
# In backend directory, update .env
# Replace DATABASE_URL with your Neon connection string

DATABASE_URL=postgresql://[user]:[password]@[hostname]/[database]?sslmode=require

# Example (DO NOT USE THIS, USE YOUR OWN):
# DATABASE_URL=postgresql://memedo_owner:abc123xyz@ep-cool-water-12345678.us-east-2.aws.neon.tech/memedo_dev?sslmode=require
```

**Step 3: Test Connection**

```bash
# In backend directory
cd backend

# Install PostgreSQL client for testing
pnpm add pg
pnpm add -D @types/pg

# Create test connection script
cat > src/config/database.test.ts << 'EOF'
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log('📅 Server time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].pg_version);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
EOF

# Run test
pnpx tsx src/config/database.test.ts
```

**Expected Output:**

```
✅ Database connection successful!
📅 Server time: 2025-10-28T10:30:00.123Z
🐘 PostgreSQL version: PostgreSQL 16.0 on x86_64-pc-linux-gnu...
```

**Definition of Done:**

- Neon database created and accessible
- Connection string stored securely in `.env`
- Test connection script succeeds
- Database appears in Neon console dashboard

**Time Estimate:** 30 minutes

---

### Story 1.6: Drizzle ORM Configuration and Schema Definition

**As a** backend developer  
**I want** Drizzle ORM configured with the complete MemeDo schema  
**So that** I can perform type-safe database operations

**Acceptance Criteria:**

- [ ] Drizzle ORM and Drizzle Kit installed
- [ ] Database schema defined for all tables (users, analyses, subscriptions, api_logs)
- [ ] Drizzle configuration file created
- [ ] Schema compiles without TypeScript errors
- [ ] Drizzle Studio can connect to database

**Implementation Steps:**

```bash
# In backend directory
cd backend

# Install Drizzle ORM and Drizzle Kit
pnpm add drizzle-orm@0.29 postgres
pnpm add -D drizzle-kit@0.20

# Create Drizzle config
cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

export default {
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
EOF

# Create schema directory
mkdir -p src/db/schema

# Create users table schema
cat > src/db/schema/users.ts << 'EOF'
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),

  // Profile
  display_name: varchar('display_name', { length: 100 }),

  // Role & Status
  role: varchar('role', { length: 20 }).notNull().default('free'), // 'free' | 'premium' | 'admin'
  email_verified: boolean('email_verified').notNull().default(false),
  email_verification_token: varchar('email_verification_token', { length: 255 }),
  email_verification_expires: timestamp('email_verification_expires'),

  // Password Reset
  password_reset_token: varchar('password_reset_token', { length: 255 }),
  password_reset_expires: timestamp('password_reset_expires'),

  // Usage Tracking (Free Tier)
  analyses_this_month: integer('analyses_this_month').notNull().default(0),
  analyses_reset_date: timestamp('analyses_reset_date').notNull().defaultNow(),

  // Premium Features (Phase 2)
  saved_alerts_config: jsonb('saved_alerts_config').notNull().default('{}'),

  // 2FA (Admin mandatory, Premium optional)
  totp_secret: text('totp_secret'), // Encrypted TOTP secret
  totp_enabled: boolean('totp_enabled').notNull().default(false),
  token_version: integer('token_version').notNull().default(0), // For JWT invalidation

  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  last_login_at: timestamp('last_login_at'),
  deleted_at: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));
EOF

# Create analyses table schema
cat > src/db/schema/analyses.ts << 'EOF'
import { pgTable, uuid, varchar, jsonb, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Token Identification
  chain: varchar('chain', { length: 20 }).notNull(), // 'ethereum' | 'solana' | 'base' | 'bsc'
  contract_address: varchar('contract_address', { length: 100 }).notNull(),
  token_name: varchar('token_name', { length: 100 }),
  token_symbol: varchar('token_symbol', { length: 20 }),

  // Analysis Results (JSONB for flexibility)
  results: jsonb('results').notNull(),

  // Data Quality Metrics
  completeness_score: integer('completeness_score').notNull(), // 0-100
  sources_used: jsonb('sources_used').notNull(),
  sources_failed: jsonb('sources_failed'),

  // Performance Metrics
  analysis_duration_ms: integer('analysis_duration_ms').notNull(),
  cache_hit: boolean('cache_hit').notNull().default(false),

  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  expires_at: timestamp('expires_at').notNull(), // Cache expiry
}, (table) => ({
  userIdIdx: index('analyses_user_id_idx').on(table.user_id),
  chainAddressIdx: index('analyses_chain_address_idx').on(table.chain, table.contract_address),
  createdAtIdx: index('analyses_created_at_idx').on(table.created_at),
  expiresAtIdx: index('analyses_expires_at_idx').on(table.expires_at),
}));
EOF

# Create subscriptions table schema
cat > src/db/schema/subscriptions.ts << 'EOF'
import { pgTable, uuid, varchar, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Provider Information
  provider: varchar('provider', { length: 20 }).notNull(), // 'stripe' | 'lemon_squeezy'
  provider_subscription_id: varchar('provider_subscription_id', { length: 255 }).notNull().unique(),
  provider_customer_id: varchar('provider_customer_id', { length: 255 }).notNull(),

  // Subscription Details
  status: varchar('status', { length: 20 }).notNull(), // 'active' | 'canceled' | 'past_due' | 'expired'
  plan_name: varchar('plan_name', { length: 50 }).notNull(),
  amount_cents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),

  // Billing Cycle
  current_period_start: timestamp('current_period_start').notNull(),
  current_period_end: timestamp('current_period_end').notNull(),
  cancel_at_period_end: boolean('cancel_at_period_end').notNull().default(false),
  canceled_at: timestamp('canceled_at'),

  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.user_id),
  providerSubIdIdx: index('subscriptions_provider_sub_id_idx').on(table.provider_subscription_id),
  statusIdx: index('subscriptions_status_idx').on(table.status),
}));
EOF

# Create api_logs table schema
cat > src/db/schema/api_logs.ts << 'EOF'
import { pgTable, uuid, varchar, integer, boolean, timestamp, text, jsonb, index } from 'drizzle-orm/pg-core';

export const api_logs = pgTable('api_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Request Context
  analysis_id: uuid('analysis_id'), // References analyses.id (nullable if analysis failed)
  chain: varchar('chain', { length: 20 }).notNull(),
  contract_address: varchar('contract_address', { length: 100 }),

  // API Provider
  provider: varchar('provider', { length: 50 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }),

  // Performance & Status
  success: boolean('success').notNull(),
  response_time_ms: integer('response_time_ms').notNull(),
  http_status_code: integer('http_status_code'),

  // Error Details
  error_message: text('error_message'),
  error_type: varchar('error_type', { length: 50 }),

  // Fallback Tracking
  was_fallback: boolean('was_fallback').notNull().default(false),
  fallback_level: integer('fallback_level').default(0),

  // Metadata
  request_metadata: jsonb('request_metadata'),

  // Timestamp
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  providerIdx: index('api_logs_provider_idx').on(table.provider),
  successIdx: index('api_logs_success_idx').on(table.success),
  createdAtIdx: index('api_logs_created_at_idx').on(table.created_at),
  chainIdx: index('api_logs_chain_idx').on(table.chain),
}));
EOF

# Create index file for schema exports
cat > src/db/schema/index.ts << 'EOF'
export * from './users';
export * from './analyses';
export * from './subscriptions';
export * from './api_logs';
EOF

# Add Drizzle scripts to package.json
# (This updates the existing package.json with new scripts)
```

Update `backend/package.json` to add these scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop"
  }
}
```

**Verification:**

```bash
# In backend directory

# Check TypeScript compilation
pnpm run type-check
# Should compile without errors

# Launch Drizzle Studio (visual database browser)
pnpm run db:studio
# Opens browser at http://localhost:4983
# Should show database connection (no tables yet)
```

**Definition of Done:**

- All schema files compile without TypeScript errors
- Drizzle config correctly references DATABASE_URL
- Drizzle Studio successfully connects to Neon database
- Schema exports are available for import in backend code

**Time Estimate:** 2 hours

---

### Story 1.7: Database Migration Execution

**As a** developer  
**I want** the initial database migration applied to Neon PostgreSQL  
**So that** all tables are created with correct schema and indexes

**Acceptance Criteria:**

- [ ] Initial migration generated from Drizzle schema
- [ ] Migration includes all tables: users, analyses, subscriptions, api_logs
- [ ] Migration includes all indexes and constraints
- [ ] Migration successfully applied to Neon database
- [ ] Tables visible in Drizzle Studio
- [ ] UUID extension enabled
- [ ] Trigger function for `updated_at` timestamp created

**Implementation Steps:**

```bash
# In backend directory
cd backend

# Generate migration from schema
pnpm run db:generate
# This creates a new migration file in src/db/migrations/

# Review generated migration
# File will be at src/db/migrations/0000_initial_schema.sql (or similar timestamp name)
cat src/db/migrations/0000_*.sql

# Push migration to database
pnpm run db:push

# Verify in Drizzle Studio
pnpm run db:studio
# Open http://localhost:4983
# Should see all 4 tables: users, analyses, subscriptions, api_logs
```

**Manual SQL Script (If needed for custom triggers):**

Create `src/db/migrations/0001_triggers.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset monthly analysis quota
CREATE OR REPLACE FUNCTION reset_monthly_analyses()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET
    analyses_this_month = 0,
    analyses_reset_date = NOW() + INTERVAL '1 month'
  WHERE analyses_reset_date <= NOW();
END;
$$ LANGUAGE plpgsql;
```

Execute this manually in Neon SQL Editor or via psql:

```bash
# Option 1: Neon Console SQL Editor
# 1. Go to https://console.neon.tech
# 2. Open your project
# 3. Click "SQL Editor"
# 4. Paste the trigger SQL
# 5. Click "Run"

# Option 2: Via psql (if installed)
psql $DATABASE_URL < src/db/migrations/0001_triggers.sql
```

**Verification:**

```bash
# Test database schema
cat > src/db/test-schema.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

async function testSchema() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    // Test 1: Query tables (should return empty arrays)
    const usersCount = await db.select().from(schema.users);
    const analysesCount = await db.select().from(schema.analyses);
    const subscriptionsCount = await db.select().from(schema.subscriptions);
    const apiLogsCount = await db.select().from(schema.api_logs);

    console.log('✅ Database schema verified!');
    console.log(`📊 Users: ${usersCount.length}`);
    console.log(`📊 Analyses: ${analysesCount.length}`);
    console.log(`📊 Subscriptions: ${subscriptionsCount.length}`);
    console.log(`📊 API Logs: ${apiLogsCount.length}`);

    // Test 2: Insert test user (will rollback)
    await db.transaction(async (tx) => {
      const [user] = await tx.insert(schema.users).values({
        email: 'test@memedo.io',
        password_hash: 'dummy_hash',
        role: 'free',
        email_verified: true,
      }).returning();

      console.log('✅ Test insert successful:', user.id);

      // Rollback test data
      throw new Error('Rollback test data');
    }).catch(() => {
      console.log('✅ Transaction rollback successful');
    });

  } catch (error) {
    console.error('❌ Schema test failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testSchema();
EOF

# Run schema test
pnpx tsx src/db/test-schema.ts
```

**Expected Output:**

```
✅ Database schema verified!
📊 Users: 0
📊 Analyses: 0
📊 Subscriptions: 0
📊 API Logs: 0
✅ Test insert successful: 550e8400-e29b-41d4-a716-446655440000
✅ Transaction rollback successful
```

**Definition of Done:**

- Initial migration generated and applied successfully
- All 4 tables exist in Neon database
- All indexes created correctly
- UUID extension enabled
- Triggers for `updated_at` working
- Drizzle Studio shows all tables with correct schema
- Test queries execute without errors

**Time Estimate:** 1.5 hours

---

### Story 1.8: Development Tooling Setup (ESLint, Prettier, Husky)

**As a** developer  
**I want** consistent code formatting and linting  
**So that** code quality is maintained and merge conflicts are minimized

**Acceptance Criteria:**

- [ ] ESLint configured for TypeScript across all packages
- [ ] Prettier configured with consistent rules
- [ ] Husky git hooks prevent commits with linting errors
- [ ] Format on save works in VS Code
- [ ] All existing code passes linting

**Implementation Steps:**

```bash
# Navigate to project root
cd /path/to/memedo

# Install shared dev tools at root
pnpm add -D -w eslint@8 prettier@3 @typescript-eslint/parser@6 @typescript-eslint/eslint-plugin@6 husky@8 lint-staged@15

# Initialize Husky
pnpm dlx husky-init
pnpm install

# Create ESLint config at root
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "node": true,
    "es2020": true
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off"
  }
}
EOF

# Create Prettier config
cat > .prettierrc.json << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOF

# Create .prettierignore
cat > .prettierignore << 'EOF'
node_modules
dist
build
.next
coverage
pnpm-lock.yaml
*.log
.env*
EOF

# Configure lint-staged
cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
EOF

# Update Husky pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
EOF

chmod +x .husky/pre-commit

# Add root scripts to package.json
cat > package.json << 'EOF'
{
  "name": "memedo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:frontend": "pnpm --filter memedo-frontend dev",
    "dev:backend": "pnpm --filter memedo-backend dev",
    "dev": "concurrently \"pnpm:dev:frontend\" \"pnpm:dev:backend\"",
    "build:frontend": "pnpm --filter memedo-frontend build",
    "build:backend": "pnpm --filter memedo-backend build",
    "build:shared": "pnpm --filter memedo-shared build",
    "build": "pnpm build:shared && pnpm build:backend && pnpm build:frontend",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md,yml,yaml}\"",
    "type-check": "pnpm --recursive run type-check",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.55.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.1.0"
  }
}
EOF

# Install concurrently for running dev servers
pnpm add -D -w concurrently@8

# VS Code settings (optional but recommended)
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
EOF

# Run initial format
pnpm run format

# Test linting
pnpm run lint
```

**Verification:**

```bash
# Test 1: Format all code
pnpm run format
# Should format all TypeScript, JSON, and Markdown files

# Test 2: Check linting
pnpm run lint
# Should show no errors (or only warnings)

# Test 3: Test git hook
# Make a small change to any .ts file
echo "// test comment" >> backend/src/server.ts
git add backend/src/server.ts
git commit -m "Test commit"
# Should run lint-staged and format the file before commit
```

**Definition of Done:**

- ESLint runs without errors across all packages
- Prettier formats code consistently
- Pre-commit hook prevents commits with linting errors
- VS Code settings enable format on save
- All existing code passes linting and formatting checks

**Time Estimate:** 1 hour

---

### Story 1.9: Environment Variables Documentation and Validation

**As a** developer  
**I want** environment variables documented and validated on startup  
**So that** missing configuration is caught early

**Acceptance Criteria:**

- [ ] `.env.example` file is complete and documented
- [ ] Backend validates required environment variables on startup
- [ ] Validation script provides clear error messages
- [ ] Secrets are never committed to Git

**Implementation Steps:**

```bash
# In backend directory
cd backend

# Create comprehensive .env.example
cat > .env.example << 'EOF'
# =============================================================================
# MemeDo Backend Configuration
# =============================================================================
# Copy this file to .env and fill in your values
# NEVER commit .env file to Git!

# -----------------------------------------------------------------------------
# Server Configuration
# -----------------------------------------------------------------------------
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# -----------------------------------------------------------------------------
# Database (Neon PostgreSQL)
# -----------------------------------------------------------------------------
# Get this from: https://console.neon.tech
# Example: postgresql://user:pass@ep-cool-water-12345678.us-east-2.aws.neon.tech/memedo_dev?sslmode=require
DATABASE_URL=postgresql://user:password@localhost:5432/memedo

# -----------------------------------------------------------------------------
# Redis Cache (Upstash)
# -----------------------------------------------------------------------------
# Get this from: https://console.upstash.com
# Example: rediss://default:abc123xyz@us1-mutual-bee-12345.upstash.io:6379
REDIS_URL=redis://localhost:6379

# -----------------------------------------------------------------------------
# Authentication & Security
# -----------------------------------------------------------------------------
# Generate with: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Generate with: openssl rand -hex 32 (64 hex characters for AES-256)
TOTP_ENCRYPTION_KEY=your-64-hex-char-key-for-2fa-encryption

# JWT expiry times (in seconds)
JWT_ACCESS_EXPIRY=86400
JWT_REFRESH_EXPIRY=604800

# -----------------------------------------------------------------------------
# External APIs - Analysis Data
# -----------------------------------------------------------------------------
# DexScreener (Public API, no key required)
DEXSCREENER_API_KEY=

# Helius (Solana) - Free tier: 100k requests/month
# Get from: https://www.helius.dev
HELIUS_API_KEY=

# Etherscan (Ethereum) - Free tier: 5 calls/sec
# Get from: https://etherscan.io/apis
ETHERSCAN_API_KEY=

# GoPlus Security (Free with attribution)
# Get from: https://gopluslabs.io
GOPLUS_API_KEY=

# Covalent (Fallback EVM) - Free tier: 100k credits
# Get from: https://www.covalenthq.com
COVALENT_API_KEY=

# RugCheck (Solana Security)
# Get from: https://rugcheck.xyz/api
RUGCHECK_API_KEY=

# BirdEye (Solana Fallback)
# Get from: https://birdeye.so
BIRDEYE_API_KEY=

# -----------------------------------------------------------------------------
# Payment Providers
# -----------------------------------------------------------------------------
# Stripe (Primary) - Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# LemonSqueezy (Backup for Kosovo) - Get from: https://app.lemonsqueezy.com/settings/api
LEMON_SQUEEZY_API_KEY=

# -----------------------------------------------------------------------------
# Email Service
# -----------------------------------------------------------------------------
# Resend - Get from: https://resend.com/api-keys
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@memedo.io
SUPPORT_EMAIL=support@memedo.io

# -----------------------------------------------------------------------------
# Monitoring & Logging (Optional for MVP)
# -----------------------------------------------------------------------------
# Sentry DSN - Get from: https://sentry.io
SENTRY_DSN=

# PostHog API Key - Get from: https://posthog.com
POSTHOG_API_KEY=

# -----------------------------------------------------------------------------
# Feature Flags
# -----------------------------------------------------------------------------
ENABLE_RATE_LIMITING=true
ENABLE_2FA=true
ENABLE_API_LOGGING=true
EOF

# Create environment validation utility
mkdir -p src/utils
cat > src/utils/env-validator.ts << 'EOF'
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define required and optional environment variables
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  TOTP_ENCRYPTION_KEY: z.string().length(64, 'TOTP_ENCRYPTION_KEY must be 64 hex characters'),

  // External APIs (optional for MVP development)
  HELIUS_API_KEY: z.string().optional(),
  ETHERSCAN_API_KEY: z.string().optional(),
  GOPLUS_API_KEY: z.string().optional(),
  RUGCHECK_API_KEY: z.string().optional(),

  // Payment (optional for initial setup)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email (optional for initial setup)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Check your .env file and .env.example for reference');
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();
EOF

# Update server.ts to validate environment on startup
cat > src/server.ts << 'EOF'
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { validateEnv } from './utils/env-validator';

// Validate environment variables FIRST (fail fast)
const env = validateEnv();

const app = express();
const PORT = env.PORT;
const FRONTEND_URL = env.FRONTEND_URL;

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'memedo-backend',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes placeholder
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'MemeDo API v1',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An error occurred'
        : err.message,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ MemeDo Backend running on http://localhost:${PORT}`);
  console.log(`✅ Frontend allowed from: ${FRONTEND_URL}`);
  console.log(`✅ Environment: ${env.NODE_ENV}`);
  console.log(`✅ Database: ${env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Connected'}`);
});

export default app;
EOF
```

**Verification:**

```bash
# Test 1: Missing required variable
mv .env .env.backup
pnpm run dev
# Should fail with clear error message about missing DATABASE_URL

# Test 2: Restore .env and test successful validation
mv .env.backup .env
pnpm run dev
# Should start successfully with "Environment variables validated successfully"

# Test 3: Test with weak JWT secret
echo "JWT_SECRET=short" >> .env
pnpm run dev
# Should fail with "JWT_SECRET must be at least 32 characters"

# Restore proper .env
git checkout .env
```

**Definition of Done:**

- `.env.example` is complete and well-documented
- Environment validation catches missing or invalid variables
- Backend fails fast with clear error messages
- `.gitignore` prevents `.env` from being committed
- All required variables are validated on startup

**Time Estimate:** 1 hour

---

### Story 1.10: Epic Completion Verification and Documentation

**As a** developer  
**I want** to verify the entire project foundation is working  
**So that** I can confidently begin building features

**Acceptance Criteria:**

- [ ] Frontend dev server runs without errors
- [ ] Backend dev server runs without errors
- [ ] Database connection is successful
- [ ] All TypeScript compiles without errors
- [ ] Linting passes
- [ ] Git hooks work correctly
- [ ] README.md updated with setup instructions

**Implementation Steps:**

```bash
# Navigate to project root
cd /path/to/memedo

# Create comprehensive README
cat > README.md << 'EOF'
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
- JWT authentication with email verification
- Stripe + LemonSqueezy payment integration

---

## Project Structure

```

memedo/
├── frontend/ # React + Vite + Tailwind CSS
├── backend/ # Express + TypeScript API
├── shared/ # Shared Zod validation schemas
├── docs/ # Project documentation
└── tools/ # Development utilities

````

---

## Prerequisites

- **Node.js**: v20.x LTS
- **pnpm**: v8.x (install with `npm install -g pnpm`)
- **Neon PostgreSQL**: Account at https://neon.tech
- **Upstash Redis**: Account at https://upstash.com (free tier)

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd memedo

# Install all dependencies
pnpm install
````

### 2. Environment Configuration

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your credentials

# Required immediately:
# - DATABASE_URL (from Neon)
# - REDIS_URL (from Upstash)
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)
# - TOTP_ENCRYPTION_KEY (generate with: openssl rand -hex 32)
# - FRONTEND_URL (http://localhost:5173)

# Optional for full functionality:
# - HELIUS_API_KEY
# - ETHERSCAN_API_KEY
# - STRIPE_SECRET_KEY
# - RESEND_API_KEY
```

### 3. Database Setup

```bash
# In backend directory
cd backend

# Generate and apply migrations
pnpm run db:generate
pnpm run db:push

# Verify in Drizzle Studio
pnpm run db:studio
# Opens http://localhost:4983
```

### 4. Development Servers

```bash
# From project root, run both servers concurrently
pnpm run dev

# Or run individually:
pnpm run dev:frontend  # http://localhost:5173
pnpm run dev:backend   # http://localhost:3000
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] Frontend loads at http://localhost:5173 with "Welcome to MemeDo 🚀"
- [ ] Backend health check returns 200: `curl http://localhost:3000/health`
- [ ] Database tables visible in Drizzle Studio
- [ ] Linting passes: `pnpm run lint`
- [ ] TypeScript compiles: `pnpm run type-check`
- [ ] Git hooks prevent bad commits (test with a linting error)

---

## Development Workflows

### Starting Development

```bash
# Start both frontend and backend
pnpm run dev
```

### Running Tests

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Format code
pnpm run format
```

### Database Management

```bash
# Open Drizzle Studio
pnpm run db:studio

# Generate new migration
pnpm run db:generate

# Apply migrations
pnpm run db:push

# Drop database (⚠️ DESTRUCTIVE)
pnpm run db:drop
```

### Building for Production

```bash
# Build all packages
pnpm run build

# Build individually
pnpm run build:shared
pnpm run build:backend
pnpm run build:frontend
```

---

## Key Commands

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `pnpm run dev`        | Start both frontend and backend servers |
| `pnpm run build`      | Build all packages for production       |
| `pnpm run lint`       | Run ESLint across all packages          |
| `pnpm run format`     | Format code with Prettier               |
| `pnpm run type-check` | TypeScript type checking                |
| `pnpm run db:studio`  | Open Drizzle Studio (database GUI)      |

---

## Troubleshooting

### Environment Variable Errors

**Error:** `❌ Environment validation failed: DATABASE_URL is required`

**Solution:**

```bash
cd backend
cp .env.example .env
# Edit .env and add your Neon database URL
```

### Database Connection Failed

**Error:** `Connection terminated unexpectedly`

**Solution:**

- Verify `DATABASE_URL` in `.env` is correct
- Check Neon console that database is active
- Ensure `?sslmode=require` is in connection string

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in backend/.env
PORT=3001
```

---

## Documentation

- **Product Brief**: `docs/brief.md`
- **PRD**: `docs/prd.md`
- **Frontend Spec**: `docs/frontend-spec.md`
- **Architecture**: `docs/fullstack-architecture.md`
- **Epic 1**: `docs/epic-01-project-initialization.md`

---

## Contributing

This project follows:

- **Code Style**: ESLint + Prettier (enforced via git hooks)
- **Commits**: Conventional commits recommended
- **Branching**: Feature branches from `main`

---

## License

Proprietary - © 2025 Qlirim Elezi

---

**Epic 1 Status:** ✅ **COMPLETE**  
**Next Epic:** Authentication System (JWT, Email Verification, Password Reset)
EOF

````

**Final Verification Script:**

Create `tools/verify-epic-1.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "Epic 1 Verification Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check function
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    return 0
  else
    echo -e "${RED}❌ $1${NC}"
    return 1
  fi
}

# 1. Check directories exist
echo "1. Checking project structure..."
[ -d "frontend" ] && [ -d "backend" ] && [ -d "shared" ]
check "Project structure exists"

# 2. Check dependencies installed
echo "2. Checking dependencies..."
[ -d "node_modules" ] && [ -d "frontend/node_modules" ] && [ -d "backend/node_modules" ]
check "Dependencies installed"

# 3. Check TypeScript configs
echo "3. Checking TypeScript..."
[ -f "frontend/tsconfig.json" ] && [ -f "backend/tsconfig.json" ] && [ -f "shared/tsconfig.json" ]
check "TypeScript configured"

# 4. Check environment files
echo "4. Checking environment configuration..."
[ -f "backend/.env" ] && [ -f "backend/.env.example" ]
check "Environment files exist"

# 5. Type check
echo "5. Running type check..."
cd frontend && pnpm run type-check > /dev/null 2>&1
check "Frontend type check"

cd ../backend && pnpm run type-check > /dev/null 2>&1
check "Backend type check"

cd ../shared && pnpm run type-check > /dev/null 2>&1
check "Shared type check"

cd ..

# 6. Linting
echo "6. Running linter..."
pnpm run lint > /dev/null 2>&1
check "Linting passes"

# 7. Database connection
echo "7. Checking database..."
cd backend && pnpx tsx -e "
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => { console.log('DB OK'); process.exit(0); }).catch(() => process.exit(1));
" > /dev/null 2>&1
check "Database connection"
cd ..

echo ""
echo "========================================"
echo "Epic 1 Verification Complete!"
echo "========================================"
````

Make it executable:

```bash
chmod +x tools/verify-epic-1.sh
```

Run verification:

```bash
./tools/verify-epic-1.sh
```

**Expected Output:**

```
========================================
Epic 1 Verification Script
========================================

1. Checking project structure...
✅ Project structure exists
2. Checking dependencies...
✅ Dependencies installed
3. Checking TypeScript...
✅ TypeScript configured
4. Checking environment configuration...
✅ Environment files exist
5. Running type check...
✅ Frontend type check
✅ Backend type check
✅ Shared type check
6. Running linter...
✅ Linting passes
7. Checking database...
✅ Database connection

========================================
Epic 1 Verification Complete!
========================================
```

**Definition of Done:**

- All verification checks pass
- README.md is comprehensive and up-to-date
- Both dev servers run without errors
- Database is accessible and migrated
- All TypeScript compiles
- Linting and formatting work correctly
- Git hooks are functional

**Time Estimate:** 1 hour

---

## Epic Success Metrics

### Completion Criteria

- [x] **Story 1.1**: Monorepo initialized with pnpm workspaces
- [x] **Story 1.2**: Frontend package configured (React + Vite + Tailwind)
- [x] **Story 1.3**: Backend package configured (Express + TypeScript)
- [x] **Story 1.4**: Shared package for Zod schemas
- [x] **Story 1.5**: Neon PostgreSQL database provisioned
- [x] **Story 1.6**: Drizzle ORM schema defined
- [x] **Story 1.7**: Database migrations applied
- [x] **Story 1.8**: Development tooling configured (ESLint, Prettier, Husky)
- [x] **Story 1.9**: Environment variables validated
- [x] **Story 1.10**: Epic verification complete

### Quality Gates

- ✅ All TypeScript compiles with no errors
- ✅ All linting rules pass
- ✅ Git hooks prevent bad commits
- ✅ Frontend dev server runs on port 5173
- ✅ Backend dev server runs on port 3000
- ✅ Database connection successful
- ✅ All 4 tables created in Neon
- ✅ Drizzle Studio can browse database
- ✅ Environment validation catches errors
- ✅ README.md provides clear setup instructions

### Time Tracking

| Story     | Estimated | Actual | Status     |
| --------- | --------- | ------ | ---------- |
| 1.1       | 0.5h      | -      | ⏳ Pending |
| 1.2       | 1.0h      | -      | ⏳ Pending |
| 1.3       | 1.5h      | -      | ⏳ Pending |
| 1.4       | 1.0h      | -      | ⏳ Pending |
| 1.5       | 0.5h      | -      | ⏳ Pending |
| 1.6       | 2.0h      | -      | ⏳ Pending |
| 1.7       | 1.5h      | -      | ⏳ Pending |
| 1.8       | 1.0h      | -      | ⏳ Pending |
| 1.9       | 1.0h      | -      | ⏳ Pending |
| 1.10      | 1.0h      | -      | ⏳ Pending |
| **Total** | **11.0h** | -      | ⏳ Pending |

---

## Next Steps

Upon completion of Epic 1, proceed to:

**Epic 2: Authentication System**

- User registration with email verification
- JWT token generation and refresh
- Password reset flow
- Login/logout endpoints
- Protected route middleware

---

## Support

If you encounter issues during Epic 1 setup:

1. Check `docs/fullstack-architecture.md` for technical details
2. Review `.env.example` for required environment variables
3. Run `./tools/verify-epic-1.sh` to diagnose issues
4. Check Neon console for database status
5. Verify all dependencies installed with `pnpm install`

---

**Epic Owner:** Qlirim Elezi  
**Created:** October 28, 2025  
**Last Updated:** October 28, 2025  
**Status:** ✅ Ready for Implementation
