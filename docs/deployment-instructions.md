# MemeDo Deployment Instructions

**Repository:** memedo  
**Frontend Domain:** meme-do.com  
**Backend API:** api.meme-do.com

---

## Step 1: Create GitHub Repository

### 1.1 Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `memedo`
3. **Visibility:** Private (recommended) or Public
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### 1.2 Add Remote and Push to GitHub

Open your terminal and run these commands:

```bash
# Navigate to project root
cd "C:\Users\Qlirim Elezi\Desktop\memedo"

# Verify you're in the right directory
pwd

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/memedo.git

# Verify remote was added
git remote -v

# Ensure you're on main branch
git branch -M main

# Push all commits to GitHub
git push -u origin main
```

**Expected Output:**

```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
...
To https://github.com/YOUR_USERNAME/memedo.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

### 1.3 Verify Push

1. Refresh your GitHub repository page
2. You should see all 13 commits
3. All files and folders should be visible

**✅ Step 1 Complete: GitHub repository created and code pushed**

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Sign Up / Log In to Vercel

1. Go to https://vercel.com/login
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

### 2.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your `memedo` repository
3. Click **"Import"**

### 2.3 Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset:** Vite
- **Root Directory:** `./` (leave as default)
- **Build Command:**
  ```bash
  cd frontend && pnpm install && pnpm build
  ```
- **Output Directory:** `frontend/dist`
- **Install Command:** `pnpm install`

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add:

| Name           | Value                     | Environment         |
| -------------- | ------------------------- | ------------------- |
| `VITE_API_URL` | `http://localhost:3000`   | Development         |
| `VITE_API_URL` | `https://api.meme-do.com` | Preview, Production |

### 2.5 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. You'll get a temporary URL like `memedo-xxxxx.vercel.app`

### 2.6 Add Custom Domain

1. Go to your project → **Settings** → **Domains**
2. Add domain: `meme-do.com`
3. Vercel will show you DNS records to add

**DNS Configuration (add in your domain registrar):**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Save DNS records
5. Back in Vercel, click **"Verify"**
6. Wait 5-60 minutes for DNS propagation
7. Vercel will auto-provision SSL certificate

**✅ Step 2 Complete: Frontend deployed to Vercel on meme-do.com**

---

## Step 3: Deploy Backend to Render

### 3.1 Sign Up / Log In to Render

1. Go to https://dashboard.render.com/
2. Click **"Get Started"**
3. Sign up with GitHub

### 3.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** if first time
3. Find your `memedo` repository
4. Click **"Connect"**

### 3.3 Configure Service

**Basic Settings:**

- **Name:** `memedo-backend`
- **Region:** Oregon (US West) or Ohio (US East) - choose closest to your users
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** Node

**Build & Deploy:**

- **Build Command:**
  ```bash
  cd backend && pnpm install && pnpm build
  ```
- **Start Command:**
  ```bash
  cd backend && pnpm start
  ```

**Instance Type:**

- Select **"Starter"** ($7/month) or **"Free"** (note: free tier spins down after inactivity)

### 3.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

#### Server Configuration

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://meme-do.com
```

#### Database (copy from your backend/.env)

```
DATABASE_URL=postgresql://neondb_owner:npg_jDAawBI41ugo@ep-snowy-queen-a9kw8fko-pooler.gwc.azure.neon.tech/neondb?sslmode=require
```

#### Redis (placeholder - to be provisioned)

```
REDIS_URL=redis://localhost:6379
```

#### Authentication (copy from your backend/.env)

```
JWT_SECRET=your-jwt-secret-from-env
JWT_REFRESH_SECRET=your-refresh-secret-from-env
TOTP_ENCRYPTION_KEY=your-totp-key-from-env
JWT_ACCESS_EXPIRY=86400
JWT_REFRESH_EXPIRY=604800
```

#### Email (if you have Resend set up)

```
RESEND_API_KEY=your-resend-key
FROM_EMAIL=support@meme-do.com
SUPPORT_EMAIL=support@meme-do.com
```

#### Feature Flags

```
ENABLE_RATE_LIMITING=true
ENABLE_2FA=true
ENABLE_API_LOGGING=true
```

### 3.5 Deploy

1. Click **"Create Web Service"**
2. Render will start building (5-10 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll get a URL like `memedo-backend.onrender.com`

### 3.6 Test Backend Health

```bash
curl https://memedo-backend.onrender.com/health
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-06T...",
    "environment": "production"
  }
}
```

### 3.7 Add Custom Domain

1. In Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add domain: `api.meme-do.com`
4. Render will show you a CNAME record

**DNS Configuration (add in your domain registrar):**

```
Type: CNAME
Name: api
Value: memedo-backend.onrender.com
```

5. Save DNS record
6. Back in Render, wait for verification (5-60 minutes)
7. Render will auto-provision SSL certificate

### 3.8 Test Custom Domain

```bash
curl https://api.meme-do.com/health
```

**✅ Step 3 Complete: Backend deployed to Render on api.meme-do.com**

---

## Step 4: Update Frontend API URL

Since the backend is now on `api.meme-do.com`, update Vercel:

1. Go to Vercel → Your project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL` for Production
3. Update value to: `https://api.meme-do.com`
4. Click **"Save"**
5. Go to **Deployments** tab
6. Click **"..."** on latest deployment → **"Redeploy"**

**✅ Step 4 Complete: Frontend connected to backend API**

---

## Step 5: Configure GitHub Secrets for CI/CD

### 5.1 Get Vercel Credentials

**Vercel Token:**

1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `GitHub Actions`
4. Scope: Full Account
5. Click **"Create"**
6. **Copy the token** (you won't see it again)

**Vercel Org ID:**

1. Go to https://vercel.com/teams/settings
2. Copy the **Team ID** from the URL or settings page

**Vercel Project ID:**

1. Go to your Vercel project → **Settings** → **General**
2. Scroll to **Project ID**
3. Copy the ID

### 5.2 Get Render Deploy Hook

1. Go to Render dashboard → Your service
2. Click **"Settings"** → **"Deploy Hook"**
3. Click **"Create Deploy Hook"**
4. Name: `GitHub Actions`
5. Branch: `main`
6. Click **"Create"**
7. **Copy the webhook URL**

### 5.3 Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these secrets:

| Name                     | Value                            |
| ------------------------ | -------------------------------- |
| `VERCEL_TOKEN`           | Your Vercel token from 5.1       |
| `VERCEL_ORG_ID`          | Your Vercel org/team ID from 5.1 |
| `VERCEL_PROJECT_ID`      | Your Vercel project ID from 5.1  |
| `RENDER_DEPLOY_HOOK_URL` | Your Render webhook URL from 5.2 |

**✅ Step 5 Complete: GitHub Actions configured for auto-deploy**

---

## Step 6: Test CI/CD Pipeline

### 6.1 Make a Test Change

```bash
# Make a small change to README
echo "\n\n## Deployment Status\n\n✅ Deployed to production" >> README.md

# Commit and push
git add README.md
git commit -m "test: Verify CI/CD pipeline"
git push origin main
```

### 6.2 Watch GitHub Actions

1. Go to GitHub repository → **Actions** tab
2. You should see two workflows running:
   - **CI Pipeline** (lint, type-check, build)
   - **Deploy to Production** (deploy to Vercel and Render)

### 6.3 Verify Deployments

After workflows complete (5-10 minutes):

```bash
# Check frontend
curl -I https://meme-do.com

# Check backend
curl https://api.meme-do.com/health
```

**✅ Step 6 Complete: CI/CD pipeline tested and working**

---

## Step 7: Run Database Migrations on Production

### 7.1 Access Render Shell

1. Go to Render dashboard → Your service
2. Click **"Shell"** tab at the top
3. Wait for shell to load

### 7.2 Run Migrations

In the Render shell:

```bash
cd backend
pnpm db:migrate
```

**Expected Output:**

```
✅ Migration completed successfully!

📋 Tables created:
   ✓ analyses
   ✓ api_logs
   ✓ subscriptions
   ✓ users

🎉 Database migration PASSED!
```

### 7.3 Verify Database

```bash
pnpm db:test
```

**Expected Output:**

```
✅ Connection successful!
   PostgreSQL version: PostgreSQL 17.5
   Database: neondb
   User: neondb_owner

✅ Found 4 table(s):
   - api_logs
   - users
   - analyses
   - subscriptions
```

**✅ Step 7 Complete: Database migrated on production**

---

## Step 8: Provision Upstash Redis (Optional for MVP)

### 8.1 Create Upstash Account

1. Go to https://console.upstash.com/login
2. Sign up with GitHub

### 8.2 Create Redis Database

1. Click **"Create Database"**
2. **Name:** `memedo-cache`
3. **Type:** Regional
4. **Region:** US-West-1 (closest to Render Oregon)
5. **TLS:** Enabled
6. **Eviction:** Enabled (for cache)
7. Click **"Create"**

### 8.3 Get Connection String

1. Click on your database
2. Scroll to **"REST API"** section
3. Copy the **"UPSTASH_REDIS_REST_URL"**

Format: `https://xxx.upstash.io`

### 8.4 Update Render Environment Variable

1. Go to Render → Your service → **Environment**
2. Find `REDIS_URL`
3. Update to your Upstash URL
4. Click **"Save Changes"**
5. Service will auto-redeploy

**✅ Step 8 Complete: Redis cache provisioned (optional)**

---

## Deployment Checklist

Use this checklist to track your progress:

- [ ] **Step 1:** GitHub repository created and code pushed
- [ ] **Step 2:** Frontend deployed to Vercel (meme-do.com)
- [ ] **Step 3:** Backend deployed to Render (api.meme-do.com)
- [ ] **Step 4:** Frontend connected to backend API
- [ ] **Step 5:** GitHub Actions secrets configured
- [ ] **Step 6:** CI/CD pipeline tested
- [ ] **Step 7:** Database migrations run on production
- [ ] **Step 8:** Redis cache provisioned (optional)

---

## Final Verification

### Test Complete System

```bash
# 1. Frontend loads
curl -I https://meme-do.com
# Expected: 200 OK

# 2. Backend health check
curl https://api.meme-do.com/health
# Expected: {"success":true,"data":{"status":"healthy",...}}

# 3. Database connection (check Render logs)
# Should see: ✅ Environment variables validated successfully

# 4. CORS working
curl -H "Origin: https://meme-do.com" https://api.meme-do.com/api
# Expected: No CORS error
```

### Monitor Services

- **Frontend:** https://vercel.com/dashboard
- **Backend:** https://dashboard.render.com/
- **Database:** https://console.neon.tech/
- **Redis:** https://console.upstash.com/ (if provisioned)

---

## Troubleshooting

### Frontend not loading

1. Check Vercel deployment logs
2. Verify DNS records are correct
3. Clear browser cache

### Backend not responding

1. Check Render service is running (not sleeping)
2. Check Render logs for errors
3. Verify environment variables are set
4. Test health endpoint: `curl https://api.meme-do.com/health`

### CORS errors

1. Verify `FRONTEND_URL` in Render environment variables is `https://meme-do.com`
2. Check backend logs for CORS errors
3. Verify allowed origins in `backend/src/server.ts`

### Database connection errors

1. Verify `DATABASE_URL` in Render environment variables
2. Check Neon database is active
3. Ensure connection string includes `?sslmode=require`

---

## Cost Summary

| Service           | Plan                | Monthly Cost    |
| ----------------- | ------------------- | --------------- |
| **Vercel**        | Hobby (Free) or Pro | $0 or $20       |
| **Render**        | Starter             | $7              |
| **Neon**          | Free tier           | $0              |
| **Upstash Redis** | Free tier           | $0              |
| **Domain**        | Varies by registrar | ~$12/year       |
| **Total**         |                     | **$7-27/month** |

---

## Next Steps After Deployment

1. **Monitor Performance:**
   - Set up Sentry for error tracking
   - Monitor Render logs for issues
   - Check Vercel analytics

2. **Security:**
   - Enable rate limiting in production
   - Review and rotate API keys every 90 days
   - Set up monitoring alerts

3. **Start Epic 2:**
   - Implement authentication system
   - Test registration and login flows
   - Deploy authentication features

---

**🎉 Deployment Complete!**

Your MemeDo platform is now live:

- **Frontend:** https://meme-do.com
- **Backend API:** https://api.meme-do.com
- **Health Check:** https://api.meme-do.com/health

You're ready to start Epic 2: Authentication & User Management!
