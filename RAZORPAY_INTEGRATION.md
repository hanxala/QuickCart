# Razorpay Integration Guide

This guide explains how to set up and configure Razorpay payment integration in QuickCart.

## Overview

Razorpay is a comprehensive payment gateway solution that supports multiple payment methods including:
- Credit/Debit Cards
- Net Banking
- UPI
- Wallets
- EMI
- International payments

## Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com/](https://razorpay.com/)
2. **API Keys**: Generate API keys from your Razorpay dashboard
3. **Webhook Secret**: Set up webhook endpoint for payment verification

## Environment Configuration

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
NEXT_PUBLIC_RAZORPAY_SUCCESS_URL=http://localhost:3000/order-placed
NEXT_PUBLIC_RAZORPAY_CANCEL_URL=http://localhost:3000/cart
```

### Getting Your API Keys

1. Log in to your Razorpay Dashboard
2. Navigate to **Settings** > **API Keys**
3. Click **Generate Test Key** or **Generate Live Key**
4. Copy the **Key ID** (starts with `rzp_test_` or `rzp_live_`)
5. Copy the **Key Secret**

⚠️ **Important**: Keep your Key Secret secure and never expose it in client-side code.

## Webhook Configuration

### Step 1: Create Webhook Endpoint

Your webhook endpoint is already set up at: `/api/webhooks/razorpay`

### Step 2: Configure Webhook in Razorpay Dashboard

1. Go to **Settings** > **Webhooks** in your Razorpay Dashboard
2. Click **Add New Webhook**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
4. Select the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Set the webhook secret and add it to your environment variables

### Step 3: Test Mode vs Live Mode

- **Test Mode**: Use test API keys (starting with `rzp_test_`)
- **Live Mode**: Use live API keys (starting with `rzp_live_`)

## Payment Flow

### 1. Order Creation
When a customer proceeds to checkout:
```javascript
// Create Razorpay order
const order = await createRazorpayOrder({
  amount: finalAmount,
  currency: 'INR',
  receipt: receiptId,
  notes: { /* order metadata */ }
});
```

### 2. Payment Processing
The client-side initiates payment:
```javascript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount * 100, // Convert to paise
  currency: 'INR',
  order_id: orderId,
  handler: function(response) {
    // Payment successful
    verifyPayment(response);
  }
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

### 3. Payment Verification
Server-side verification using webhook:
```javascript
const verification = verifyRazorpayPayment({
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature
});
```

## Features Implemented

### ✅ Core Features
- [x] Order creation via Razorpay API
- [x] Payment processing with Razorpay Checkout
- [x] Payment signature verification
- [x] Webhook handling for payment events
- [x] Order status updates
- [x] Stock management after successful payment
- [x] Error handling and retry logic

### ✅ Security Features
- [x] Server-side signature verification
- [x] Webhook signature validation
- [x] Environment variable protection
- [x] HTTPS requirement for production
- [x] Payment data encryption

### ✅ UI/UX Features
- [x] Responsive payment interface
- [x] Loading states and error messages
- [x] Payment method selection
- [x] Order confirmation flow
- [x] Payment failure handling

## File Structure

```
├── lib/
│   └── razorpay.js                 # Razorpay SDK integration
├── components/
│   ├── RazorpayCheckout.jsx       # Payment component
│   └── PaymentMethodSelector.jsx   # Payment method selection
├── app/api/
│   ├── payment/
│   │   └── create-order/route.js   # Order creation API
│   └── webhooks/
│       └── razorpay/route.js       # Webhook handler
└── models/
    └── Order.js                    # Updated order model
```

## Testing

### Test Cards
Razorpay provides test card numbers for different scenarios:

**Successful Payments:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payments:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI IDs
- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

## Production Deployment

### 1. Switch to Live Mode
- Replace test API keys with live keys
- Update webhook URL to production domain
- Ensure HTTPS is enabled

### 2. Security Checklist
- [ ] API keys are in environment variables
- [ ] Webhook signature verification is enabled
- [ ] HTTPS is configured
- [ ] Payment data is encrypted
- [ ] Logs don't contain sensitive information

### 3. Testing in Production
- Start with small test transactions
- Verify webhook delivery
- Test all payment methods
- Check order status updates

## Troubleshooting

### Common Issues

**1. Payment Creation Fails**
- Check API key configuration
- Verify amount is in paise (multiply by 100)
- Ensure all required fields are provided

**2. Webhook Not Receiving Events**
- Verify webhook URL is accessible
- Check webhook signature validation
- Ensure correct event types are selected

**3. Payment Verification Fails**
- Check signature calculation
- Verify webhook secret configuration
- Ensure proper error handling

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=razorpay:*
```

## Support

### Razorpay Resources
- [Official Documentation](https://razorpay.com/docs/)
- [API Reference](https://razorpay.com/docs/api/)
- [Integration Guide](https://razorpay.com/docs/payments/server-integration/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)

### Contact Support
- Razorpay Support: [https://razorpay.com/support/](https://razorpay.com/support/)
- Email: support@razorpay.com

## Migration from Stripe

This integration replaces the previous Stripe integration. Key changes:

1. **Environment Variables**: Updated from Stripe to Razorpay keys
2. **API Endpoints**: Changed from payment intents to order creation
3. **Webhooks**: Updated event handling for Razorpay events
4. **Client Integration**: Replaced Stripe Elements with Razorpay Checkout

All payment flows and order management remain the same, ensuring a seamless transition.

---

**Last Updated**: January 2025  
**Version**: 1.0.0
