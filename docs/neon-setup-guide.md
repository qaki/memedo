# Neon PostgreSQL Setup Guide

## Step 1: Create Neon Account

1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub for fastest setup)
3. Complete the registration

## Step 2: Create a New Project

1. Click "Create a Project" on the Neon dashboard
2. **Project Name:** `memedo`
3. **Region:** Select closest to your location (e.g., US East, EU Central)
4. **PostgreSQL Version:** 16 (latest stable)
5. **Compute Size:** Free tier (0.25 vCPU, 1GB RAM) - sufficient for development
6. Click "Create Project"

## Step 3: Get Connection String

After project creation, Neon will display your connection string. It looks like:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Example:

```
postgresql://memedo_owner:ABC123xyz@ep-cool-cloud-123456.us-east-2.aws.neon.tech/memedo?sslmode=require
```

## Step 4: Copy Connection String to .env

1. Copy the full connection string
2. Open `backend/.env`
3. Replace the `DATABASE_URL` value with your connection string:

```env
DATABASE_URL=postgresql://memedo_owner:ABC123xyz@ep-cool-cloud-123456.us-east-2.aws.neon.tech/memedo?sslmode=require
```

## Step 5: Verify Connection

Once you've updated the `.env` file, run:

```bash
cd backend
pnpm run db:test
```

This will test the database connection.

## Neon Features Included in Free Tier

✅ **1 Project**
✅ **10 Branches** (perfect for dev/staging/production)
✅ **3GB Storage**
✅ **Compute: 0.25 vCPU, 1GB RAM**
✅ **Auto-suspend after 5 minutes of inactivity** (saves compute hours)
✅ **Instant database branching** (copy-on-write)
✅ **Point-in-time restore** (7 days)
✅ **Postgres 16**

## Production Notes

For production (after MVP validation):

- Upgrade to **Pro Plan** ($19/month)
  - Autoscaling compute (0.25-4 vCPU)
  - 10GB storage (expandable)
  - 300 compute hours/month
  - Read replicas for scaling
  - Connection pooling

## Connection Pooling (Important!)

Neon provides **built-in connection pooling** via Neon's connection pooler:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require&pooler=transaction
```

For serverless environments (Vercel), use the pooled connection string.

## Security Best Practices

✅ Never commit `.env` to Git (already in `.gitignore`)
✅ Use different databases for dev/staging/production
✅ Rotate password every 90 days
✅ Enable IP allowlist in production (Neon dashboard → Settings → IP Allow)
✅ Use read-only credentials for analytics/reporting tools

---

## Quick Setup Commands

After you have your connection string:

```bash
# 1. Update backend/.env with your DATABASE_URL
nano backend/.env

# 2. Install Drizzle ORM (next step in Epic 1)
cd backend
pnpm add drizzle-orm @neondatabase/serverless

# 3. Run migrations (after Story 1.6)
pnpm run db:push

# 4. Seed initial data (optional)
pnpm run db:seed
```

---

## Troubleshooting

### Error: "Connection timeout"

- Check if your IP is allowed (Neon dashboard → Settings → IP Allow)
- Verify `sslmode=require` is in the connection string

### Error: "Database does not exist"

- Neon creates a default database named after your project
- Ensure the database name in the connection string matches

### Error: "Too many connections"

- Free tier limit: 100 concurrent connections
- Use connection pooling (`?pooler=transaction`)

---

## Next Steps

✅ **Story 1.5:** Database provisioned on Neon  
⏳ **Story 1.6:** Configure Drizzle ORM and define schema  
⏳ **Story 1.7:** Run migrations to create tables

Once your `DATABASE_URL` is set in `backend/.env`, you're ready for Story 1.6!
