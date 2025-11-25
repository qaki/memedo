# FastSpring Integration Setup Guide

## Environment Variables

Add these to your `.env` file:

```env
# FastSpring API Credentials
FASTSPRING_USERNAME=your_api_username
FASTSPRING_PASSWORD=your_api_password
FASTSPRING_STOREFRONT=memego

# Product Paths
# Monthly: memego-pro-monthly
# Yearly: memego-pro-yearly
```

## Getting Your Credentials

1. Go to [FastSpring App](https://app.fastspring.com)
2. Navigate to **Developer Tools > APIs > API Credentials**
3. Click **Create** to generate new credentials
4. **Important:** Copy and save both username and password securely
5. You cannot view the password again after this session!

## Product Configuration

### Create Products in FastSpring

1. Go to **Products** in FastSpring dashboard
2. Create two subscription products:

#### Monthly Subscription

- **Product Path:** `memego-pro-monthly`
- **Display Name:** MemeDo Pro (Monthly)
- **Pricing:** $29/month (or your desired price)
- **Billing Frequency:** Monthly
- **Trial:** Optional (7 days free trial)

#### Yearly Subscription

- **Product Path:** `memego-pro-yearly`
- **Display Name:** MemeDo Pro (Yearly)
- **Pricing:** $290/year (or your desired price - usually 2 months free)
- **Billing Frequency:** Yearly
- **Trial:** Optional (7 days free trial)

## Webhook Configuration

### Set Up Webhooks in FastSpring

1. Go to **Developer Tools > Webhooks**
2. Add webhook URL: `https://your-backend-domain.com/api/webhooks/fastspring`
3. Select events to listen to:
   - ✅ `subscription.activated`
   - ✅ `subscription.charge.completed`
   - ✅ `subscription.charge.failed`
   - ✅ `subscription.canceled`
   - ✅ `subscription.deactivated`
   - ✅ `subscription.updated`
   - ✅ `subscription.payment.overdue`

4. **Production URL:** `https://memedo-backend.onrender.com/api/webhooks/fastspring`
5. **Development URL:** Use [ngrok](https://ngrok.com) to expose local server:
   ```bash
   ngrok http 3000
   # Use the HTTPS URL: https://xxxx-xx-xxx.ngrok-free.app/api/webhooks/fastspring
   ```

## Testing

### Test Webhook Integration

1. Use FastSpring's **Test Mode**:
   - Toggle test mode in FastSpring dashboard
   - All transactions in test mode are simulated

2. Test checkout flow:

   ```bash
   # Start backend
   cd backend
   pnpm dev

   # Start frontend
   cd frontend
   pnpm dev

   # Navigate to pricing page
   # Click "Subscribe" button
   # Complete checkout in test mode
   ```

3. Check webhook logs in backend console
4. Verify user subscription status in database

### Manual API Testing

```bash
# Get subscription status
curl -X GET https://your-backend/api/subscription/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create checkout session
curl -X POST https://your-backend/api/subscription/checkout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "monthly"}'

# Cancel subscription
curl -X POST https://your-backend/api/subscription/cancel \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Migration

Run the migration to add subscription fields:

```bash
cd backend
psql $DATABASE_URL < src/db/migrations/0003_add_subscription_fields.sql
```

## Deployment Checklist

- [ ] FastSpring API credentials added to Render env vars
- [ ] Products created in FastSpring (memego-pro-monthly, memego-pro-yearly)
- [ ] Webhook URL configured in FastSpring
- [ ] Database migration executed
- [ ] Test checkout flow in FastSpring test mode
- [ ] Switch to live mode once tested
- [ ] Monitor webhook logs for errors

## Security Notes

1. **Never commit credentials to Git**
2. **Use strong, unique passwords for API credentials**
3. **FastSpring webhooks come from specific IPs** - consider IP whitelisting in production
4. **Monitor webhook failures** - set up alerts for failed webhook processing
5. **Test payment flows thoroughly** before going live

## Support

- [FastSpring API Documentation](https://docs.fastspring.com/)
- [FastSpring Support](https://support.fastspring.com/)
- [Webhook Event Reference](https://docs.fastspring.com/integrating-with-fastspring/webhooks)
