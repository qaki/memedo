# Render Backend Deployment Guide

**Service Name:** memedo-backend  
**Domain:** api.meme-do.com  
**GitHub Repo:** qaki/memedo

---

## Step 1: Create Render Web Service

### 1.1 Navigate to Render Dashboard

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**

### 1.2 Connect GitHub Repository

1. If first time: Click **"Connect account"** and authorize Render to access GitHub
2. Find repository: **`qaki/memedo`**
3. Click **"Connect"**

---

## Step 2: Configure Service Settings

### 2.1 Basic Settings

Fill in these fields:

- **Name:** `memedo-backend`
- **Region:** **Oregon (US West)** or **Ohio (US East)** (choose closest to users)
- **Branch:** `main`
- **Root Directory:** **(Leave blank - build from repo root)**

### 2.2 Build & Deploy Settings

- **Runtime:** Node
- **Build Command:**
  ```bash
  pnpm install && pnpm --filter=backend run build
  ```
- **Start Command:**
  ```bash
  pnpm --filter=backend start
  ```

### 2.3 Instance Type

- Select **"Starter"** ($7/month)
  - ✅ Always-on (no cold starts)
  - ✅ 512 MB RAM
  - ✅ Production-ready
- OR **"Free"** ($0/month)
  - ⚠️ Spins down after 15 min inactivity
  - ⚠️ 512 MB RAM
  - ⚠️ Not recommended for production

**Recommendation:** Use **Starter** for production deployment.

---

## Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables **one by one**:

### 3.1 Server Configuration

```
NODE_ENV=production
```

```
PORT=3000
```

```
FRONTEND_URL=https://meme-do.com
```

### 3.2 Database (from your backend/.env file)

**IMPORTANT:** Copy your actual DATABASE_URL from `backend/.env`

```
DATABASE_URL=postgresql://neondb_owner:npg_jDAawBI41ugo@ep-snowy-queen-a9kw8fko-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3.3 Redis Cache

**For now (MVP):** Use placeholder

```
REDIS_URL=redis://localhost:6379
```

**Later:** Replace with Upstash Redis URL after provisioning

### 3.4 JWT Secrets (from your backend/.env file)

**IMPORTANT:** Copy your actual secrets from `backend/.env`

```
JWT_SECRET=your-actual-jwt-secret-from-env-file
```

```
JWT_REFRESH_SECRET=your-actual-refresh-secret-from-env-file
```

```
TOTP_ENCRYPTION_KEY=your-actual-64-hex-char-key-from-env-file
```

### 3.5 JWT Expiry

```
JWT_ACCESS_EXPIRY=86400
```

```
JWT_REFRESH_EXPIRY=604800
```

### 3.6 Email Service (Resend)

**If you have Resend API key:**

```
RESEND_API_KEY=re_your_actual_resend_key
```

```
FROM_EMAIL=support@meme-do.com
```

```
SUPPORT_EMAIL=support@meme-do.com
```

**If you don't have Resend yet:** Leave these blank for now (Epic 2 will need them)

### 3.7 Feature Flags

```
ENABLE_RATE_LIMITING=true
```

```
ENABLE_2FA=true
```

```
ENABLE_API_LOGGING=true
```

### 3.8 Summary of Required Variables

| Variable               | Source                       | Required  |
| ---------------------- | ---------------------------- | --------- |
| `NODE_ENV`             | Set to `production`          | ✅ Yes    |
| `PORT`                 | Set to `3000`                | ✅ Yes    |
| `FRONTEND_URL`         | Set to `https://meme-do.com` | ✅ Yes    |
| `DATABASE_URL`         | Copy from `backend/.env`     | ✅ Yes    |
| `REDIS_URL`            | Use placeholder for now      | ✅ Yes    |
| `JWT_SECRET`           | Copy from `backend/.env`     | ✅ Yes    |
| `JWT_REFRESH_SECRET`   | Copy from `backend/.env`     | ✅ Yes    |
| `TOTP_ENCRYPTION_KEY`  | Copy from `backend/.env`     | ✅ Yes    |
| `JWT_ACCESS_EXPIRY`    | Set to `86400`               | ✅ Yes    |
| `JWT_REFRESH_EXPIRY`   | Set to `604800`              | ✅ Yes    |
| `RESEND_API_KEY`       | Leave blank for now          | ⚠️ Epic 2 |
| `FROM_EMAIL`           | Set to `support@meme-do.com` | ⚠️ Epic 2 |
| `SUPPORT_EMAIL`        | Set to `support@meme-do.com` | ⚠️ Epic 2 |
| `ENABLE_RATE_LIMITING` | Set to `true`                | ✅ Yes    |
| `ENABLE_2FA`           | Set to `true`                | ✅ Yes    |
| `ENABLE_API_LOGGING`   | Set to `true`                | ✅ Yes    |

---

## Step 4: Deploy Service

1. Scroll to the bottom
2. Click **"Create Web Service"**
3. Render will start building (this takes 5-10 minutes)

### 4.1 Watch Build Logs

You'll see:

```
==> Cloning from https://github.com/qaki/memedo...
==> Checking out commit 51f1e97...
==> Running build command 'pnpm install && pnpm --filter=backend run build'...
==> Installing dependencies...
==> Building shared package...
==> Building backend...
==> Build succeeded!
==> Starting service...
```

### 4.2 Wait for Deployment

- Build time: 5-10 minutes
- Status will change from **"Building"** → **"Live"**
- You'll get a URL: `https://memedo-backend.onrender.com`

---

## Step 5: Test Backend Health

Once status is **"Live"**, test the health endpoint:

```bash
curl https://memedo-backend.onrender.com/health
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-06T12:34:56.789Z",
    "environment": "production"
  }
}
```

**Expected in Logs:**

```
✅ Environment variables validated successfully
✅ MemeDo Backend running on http://localhost:3000
✅ Frontend allowed from: https://meme-do.com
✅ Environment: production
```

---

## Step 6: Add Custom Domain (api.meme-do.com)

### 6.1 Configure Custom Domain in Render

1. In your Render service, go to **"Settings"**
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter: `api.meme-do.com`
5. Click **"Save"**

Render will show you a CNAME record to add.

### 6.2 Add DNS Record

Go to your domain registrar (where you bought meme-do.com) and add:

```
Type: CNAME
Name: api
Value: memedo-backend.onrender.com
TTL: 3600 (or auto)
```

**Example for common registrars:**

**Namecheap:**

- Host: `api`
- Type: CNAME Record
- Value: `memedo-backend.onrender.com`

**GoDaddy:**

- Type: CNAME
- Name: `api`
- Value: `memedo-backend.onrender.com`

**Cloudflare:**

- Type: CNAME
- Name: `api`
- Target: `memedo-backend.onrender.com`
- Proxy status: DNS only (disable orange cloud)

### 6.3 Wait for DNS Propagation

- DNS propagation: 5-60 minutes
- Render will automatically detect the DNS change
- SSL certificate will be auto-provisioned

### 6.4 Test Custom Domain

After DNS propagates:

```bash
curl https://api.meme-do.com/health
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-06T12:34:56.789Z",
    "environment": "production"
  }
}
```

---

## Step 7: Run Database Migrations

### 7.1 Access Render Shell

1. In Render dashboard, go to your service
2. Click **"Shell"** tab at the top
3. Wait for shell to load (~10 seconds)

### 7.2 Navigate to Backend

In the Render shell:

```bash
cd backend
```

### 7.3 Run Migrations

```bash
pnpm db:migrate
```

**Expected Output:**

```
🚀 Running database migration using Drizzle migrator...

✅ Migration completed successfully!

📊 Verifying tables...

📋 Tables created:
   ✓ analyses
   ✓ api_logs
   ✓ subscriptions
   ✓ users

🎉 Database migration PASSED!
```

### 7.4 Verify Database Connection

```bash
pnpm db:test
```

**Expected Output:**

```
🔍 Testing Neon PostgreSQL connection...

✅ Connection successful!
   PostgreSQL version: PostgreSQL 17.5
   Database: neondb
   User: neondb_owner

✅ Found 4 table(s):
   - api_logs
   - users
   - analyses
   - subscriptions

🎉 Database connection test PASSED!
```

---

## Step 8: Enable Auto-Deploy

### 8.1 Configure Auto-Deploy

1. In Render service, go to **"Settings"**
2. Scroll to **"Deploy"**
3. **Auto-Deploy:** Set to **"Yes"**
4. **Branch:** `main`

Now every push to `main` branch will automatically deploy!

---

## Deployment Checklist

Use this to track your progress:

- [ ] Step 1: Render Web Service created
- [ ] Step 2: Service settings configured (build/start commands)
- [ ] Step 3: All 16 environment variables added
- [ ] Step 4: Service deployed and status is "Live"
- [ ] Step 5: Health check endpoint responding
- [ ] Step 6: Custom domain `api.meme-do.com` configured
- [ ] Step 7: Database migrations executed successfully
- [ ] Step 8: Auto-deploy enabled

---

## Verification Commands

Run these to verify everything is working:

```bash
# 1. Check Render default URL
curl https://memedo-backend.onrender.com/health

# 2. Check custom domain (after DNS propagates)
curl https://api.meme-do.com/health

# 3. Check API info endpoint
curl https://api.meme-do.com/api

# 4. Test CORS (from allowed origin)
curl -H "Origin: https://meme-do.com" https://api.meme-do.com/api
```

**All should return 200 OK with JSON responses.**

---

## Troubleshooting

### Issue: Build fails with "pnpm: command not found"

**Solution:**

- Render auto-detects pnpm from `packageManager` field in `package.json`
- Verify `package.json` has: `"packageManager": "pnpm@10.20.0"`

### Issue: "Environment variables validation failed"

**Solution:**

1. Check Render logs for specific missing variables
2. Verify all required variables are set
3. Check for typos in variable names
4. Ensure `DATABASE_URL` includes `?sslmode=require`

### Issue: Database connection error

**Solution:**

1. Verify `DATABASE_URL` is correct
2. Check Neon database is active
3. Ensure using pooler connection string (not direct)
4. Check for `sslmode=require` in connection string

### Issue: CORS errors

**Solution:**

1. Verify `FRONTEND_URL=https://meme-do.com` in Render env vars
2. Check backend logs for CORS rejections
3. Verify `allowedOrigins` in `backend/src/server.ts` includes `meme-do.com`

### Issue: Service keeps restarting

**Solution:**

1. Check Render logs for errors
2. Verify start command: `pnpm --filter=backend start`
3. Check port 3000 is not hardcoded (use `env.PORT`)
4. Verify health check path `/health` is responding

### Issue: Custom domain not working

**Solution:**

1. Verify CNAME record is correct: `api` → `memedo-backend.onrender.com`
2. Wait 5-60 minutes for DNS propagation
3. Use `dig api.meme-do.com` to check DNS
4. Disable CDN proxy if using Cloudflare
5. Check Render SSL certificate status

---

## Monitoring

### View Logs

1. Go to Render dashboard → Your service
2. Click **"Logs"** tab
3. Real-time logs will stream

**Look for:**

```
✅ Environment variables validated successfully
✅ MemeDo Backend running on http://localhost:3000
✅ Frontend allowed from: https://meme-do.com
```

### Metrics

1. Go to Render dashboard → Your service
2. Click **"Metrics"** tab
3. View:
   - Request rate
   - Response times
   - Memory usage
   - CPU usage

---

## Next Steps After Deployment

1. **Test Complete System:**

   ```bash
   # Backend health
   curl https://api.meme-do.com/health

   # Database connection (check logs)
   # Should see: ✅ Environment variables validated successfully
   ```

2. **Update Frontend Environment Variable (when Vercel is ready):**
   - Set `VITE_API_URL=https://api.meme-do.com` in Vercel
   - Redeploy frontend

3. **Provision Upstash Redis:**
   - Go to https://console.upstash.com/
   - Create database: `memedo-cache`
   - Update `REDIS_URL` in Render environment variables

4. **Get Resend API Key (for Epic 2):**
   - Go to https://resend.com/api-keys
   - Create API key
   - Add to Render: `RESEND_API_KEY`

5. **Start Epic 2 Implementation:**
   - Authentication endpoints
   - User registration
   - Email verification

---

## Cost Summary

| Service         | Plan      | Cost         |
| --------------- | --------- | ------------ |
| Render          | Starter   | $7/month     |
| Neon PostgreSQL | Free tier | $0           |
| Upstash Redis   | Free tier | $0           |
| **Total**       |           | **$7/month** |

---

## Success Criteria

✅ **Deployment is successful when:**

1. Render service status is **"Live"**
2. Health check returns 200 OK: `curl https://api.meme-do.com/health`
3. Database has 4 tables (users, analyses, subscriptions, api_logs)
4. Backend logs show: "✅ Environment variables validated successfully"
5. Custom domain `api.meme-do.com` resolves with SSL
6. Auto-deploy is enabled

---

**🎉 Once all checks pass, your MemeDo backend is live on api.meme-do.com!**

Ready to proceed with Epic 2: Authentication & User Management.
