# Render Environment Variables Configuration

This document lists ALL environment variables that need to be configured in Render for the MemeDo backend.

## 🔐 Required Environment Variables

### Database Configuration

```bash
DATABASE_URL=your-neon-postgres-connection-string
```

### JWT & Security

```bash
JWT_SECRET=your-secure-random-string-at-least-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-token-secret
```

### Email Service (Resend)

```bash
RESEND_API_KEY=your-resend-api-key
# Optional: If not set, email verification will be skipped (auto-verify)
```

### FastSpring Payment Integration

```bash
# API Credentials
FASTSPRING_USERNAME=your-fastspring-api-username
FASTSPRING_PASSWORD=your-fastspring-api-password

# Storefront Configuration
FASTSPRING_STOREFRONT=memego_store

# Webhook Security
FASTSPRING_HMAC_SECRET=loSPwXwAdVBAt2TbNTQt4pCRH7OfKQqxA3x4/QdcKVM=
```

### Frontend URL

```bash
FRONTEND_URL=https://meme-go.com
```

### Node Environment

```bash
NODE_ENV=production
```

### API Keys (Token Analysis)

```bash
# Ethereum/EVM Chains
ETHERSCAN_API_KEY=your-etherscan-key
HELIUS_API_KEY=your-helius-key

# Solana
SOLANA_RPC_URL=your-solana-rpc-url

# Optional: Security Scanning
GOPLUS_API_KEY=your-goplus-key
```

### Redis (Optional - for caching)

```bash
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

---

## 📝 How to Add Environment Variables in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your **backend service** (memedo-backend)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable from the list above
6. Click **Save Changes**
7. Render will automatically redeploy with new variables

---

## ⚠️ CRITICAL: FastSpring Configuration

### Storefront Name

**MUST BE**: `memego_store`

This is your actual FastSpring storefront name as configured in FastSpring dashboard.

### Checkout URLs Generated

With `FASTSPRING_STOREFRONT=memego_store`, the system generates:

- **Monthly Plan**: `https://memego_store.onfastspring.com/popup-memego-pro-monthly`
- **Yearly Plan**: `https://memego_store.onfastspring.com/popup-memego-pro-yearly`

### Product Path Names in FastSpring

Ensure these EXACT product paths exist in FastSpring:

- `memego-pro-monthly` ($39.99/month)
- `memego-pro-yearly` ($383.90/year)

---

## 🧪 Testing Environment Variables

After adding all variables, test the configuration:

```bash
# 1. Check backend health
curl https://memedo-backend.onrender.com/health

# 2. Check API info
curl https://memedo-backend.onrender.com/api

# 3. Test checkout URL generation (requires auth)
# Login first, then:
curl -X POST https://memedo-backend.onrender.com/api/subscription/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"plan": "monthly"}'
```

---

## 🔍 Troubleshooting

### "Store Not Found" Error

- ✅ Verify `FASTSPRING_STOREFRONT=memego_store` in Render
- ✅ Check FastSpring storefront is active
- ✅ Ensure products exist with correct paths

### Email Verification Issues

- ✅ Check `RESEND_API_KEY` is set correctly
- ✅ Or remove it to enable auto-verification

### JWT Token Errors

- ✅ Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are different
- ✅ Both should be long random strings (32+ chars)

### Database Connection Issues

- ✅ Check `DATABASE_URL` format: `postgresql://user:pass@host/db?sslmode=require`
- ✅ Verify Neon database is active

---

## 📋 Environment Variable Checklist

Use this checklist when setting up a new environment:

- [ ] `DATABASE_URL` - Neon Postgres connection string
- [ ] `JWT_SECRET` - Random secure string
- [ ] `JWT_REFRESH_SECRET` - Different random secure string
- [ ] `FASTSPRING_USERNAME` - From FastSpring API credentials
- [ ] `FASTSPRING_PASSWORD` - From FastSpring API credentials
- [ ] `FASTSPRING_STOREFRONT` - **Must be `memego_store`**
- [ ] `FASTSPRING_HMAC_SECRET` - Your HMAC secret from FastSpring
- [ ] `FRONTEND_URL` - `https://meme-go.com`
- [ ] `NODE_ENV` - `production`
- [ ] `RESEND_API_KEY` - (Optional) For email verification
- [ ] `ETHERSCAN_API_KEY` - For Ethereum token analysis
- [ ] `HELIUS_API_KEY` - For token metadata
- [ ] `SOLANA_RPC_URL` - For Solana token analysis

---

## 🎯 Quick Setup Command

For local development, create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/memedo

# JWT
JWT_SECRET=your-dev-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-dev-refresh-secret-different-from-above

# FastSpring
FASTSPRING_USERNAME=your-username
FASTSPRING_PASSWORD=your-password
FASTSPRING_STOREFRONT=memego_store
FASTSPRING_HMAC_SECRET=loSPwXwAdVBAt2TbNTQt4pCRH7OfKQqxA3x4/QdcKVM=

# Frontend
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development

# Optional
RESEND_API_KEY=your-key
ETHERSCAN_API_KEY=your-key
HELIUS_API_KEY=your-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 🚀 After Configuration

1. ✅ Save all environment variables in Render
2. ✅ Render will automatically redeploy (wait ~3-5 minutes)
3. ✅ Test the checkout flow from frontend
4. ✅ Verify webhook endpoint is accessible
5. ✅ Configure webhook in FastSpring dashboard

---

## 📞 Need Help?

- **Render Dashboard**: https://dashboard.render.com
- **FastSpring Dashboard**: https://app.fastspring.com
- **Backend Logs**: Render → Your Service → Logs tab
- **Database**: Neon Console → https://console.neon.tech
