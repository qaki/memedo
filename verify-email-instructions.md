# Email Verification Instructions

## Test Account Details

- **Email:** `test9472@example.com`
- **Password:** `Test1234!`
- **User ID:** `7ae609c1-cc83-4b2e-8658-98b5ab418d2c`

---

## Method 1: Check Resend Dashboard (Recommended)

### Steps:

1. Go to **Resend Dashboard:** https://resend.com/emails
2. Log in with your Resend account credentials
3. Look for the verification email sent to `test9472@example.com`
4. The email subject should be: **"Verify your MemeDo account"**
5. Open the email and click the verification link (or copy the link)
6. The link format will be: `https://meme-do.com/verify-email/{token}`

**Note:** If the link points to the frontend (which isn't built yet), manually change it to:

```
https://memedo-backend.onrender.com/api/auth/verify-email/{token}
```

Where `{token}` is the long verification token from the email.

---

## Method 2: Direct Database Update (Quick for Testing)

If you can't access Resend or want to test immediately:

### Connect to Neon Database:

1. Go to: https://console.neon.tech
2. Find your MemeDo database
3. Open the SQL Editor
4. Run this query:

```sql
-- Verify the test user
UPDATE users
SET
  email_verified = true,
  email_verification_token = NULL,
  email_verification_expires = NULL
WHERE email = 'test9472@example.com';

-- Verify it worked
SELECT id, email, email_verified, created_at
FROM users
WHERE email = 'test9472@example.com';
```

You should see:

- `email_verified` = `true`
- `email_verification_token` = `NULL`

---

## Method 3: Register with Your Real Email

If you want to test the full flow with real email delivery:

```bash
curl -X POST https://memedo-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@gmail.com",
    "password": "Test1234!",
    "confirmPassword": "Test1234!"
  }'
```

Then:

1. Check your actual email inbox
2. Click the verification link
3. You'll be automatically logged in

---

## After Verification

Once the email is verified, run the full test script:

### PowerShell (Windows):

```powershell
.\test-full-analysis.ps1
```

### Manual Test (Any Platform):

```bash
# 1. Login
curl -X POST https://memedo-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test9472@example.com",
    "password": "Test1234!"
  }'

# 2. Analyze USDT (Ethereum)
curl -X POST https://memedo-backend.onrender.com/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "chain": "ethereum",
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
  }'

# 3. Get history
curl https://memedo-backend.onrender.com/api/analysis/history \
  -b cookies.txt
```

---

## Expected Results

After verification and running tests, you should see:

✅ **Login successful** (no 403 error!)  
✅ **User profile retrieved**  
✅ **USDT analysis completed** (~20-30s)

- Safety score: 70-100/100
- Risk level: low
- Token metadata (name, symbol, supply)
- Security scan results  
  ✅ **BONK analysis completed** (~20-30s)
- Safety score: varies
- Risk level: varies
- Solana-specific data  
  ✅ **Analysis history** (2+ entries)

---

## Troubleshooting

### Error: "Email not verified"

- Response: `403 Forbidden`
- Solution: Complete email verification first (Method 1 or 2)

### Error: "Invalid credentials"

- Response: `401 Unauthorized`
- Solution: Check email/password spelling

### Error: "Analysis timeout"

- Response: Request timeout
- Solution: APIs might be slow, increase timeout to 60s

### Error: "Quota exceeded"

- Response: `429 Too Many Requests`
- Solution: Check usage limits (100 free analyses/month)

---

## Which Method Should You Use?

**Use Method 2 (Direct DB Update) if:**

- ✅ You want to test immediately
- ✅ You have access to Neon dashboard
- ✅ You're in development/testing mode

**Use Method 1 (Resend Dashboard) if:**

- ✅ You want to test the full production flow
- ✅ You have access to Resend
- ✅ You want to verify email delivery works

**Use Method 3 (Real Email) if:**

- ✅ You want the most realistic test
- ✅ You can receive emails
- ✅ You want to keep this test account

---

## Let me know which method you choose and I'll guide you through it! 🚀
