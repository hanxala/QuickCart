# Stripe Payment Gateway Integration

This document outlines the Stripe payment gateway integration added to your QuickCart project.

## 🚀 Features Added

- ✅ Secure card payments using Stripe
- ✅ Payment intents for better security
- ✅ Webhook handling for order confirmation
- ✅ Real-time payment status updates
- ✅ Automatic stock management
- ✅ Email notifications for successful orders
- ✅ Error handling and payment recovery
- ✅ Payment success/cancel pages
- ✅ Support for multiple payment methods (COD + Card)

## 📋 Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Stripe API Keys**: Get your publishable and secret keys from Stripe Dashboard
3. **Webhook Endpoint**: Configure webhooks in Stripe Dashboard

## 🔧 Setup Instructions

### 1. Environment Variables

Copy your `.env.example` file to `.env.local` and fill in the Stripe configuration:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

### 2. Stripe Dashboard Setup

#### Get API Keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy the **Publishable key** and **Secret key**

#### Setup Webhooks:
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed` 
   - `payment_intent.canceled`
5. Copy the webhook signing secret

### 3. Test Mode vs Live Mode

For development, use **test mode** keys (they start with `pk_test_` and `sk_test_`).
For production, use **live mode** keys (they start with `pk_live_` and `sk_live_`).

## 💳 Test Card Numbers

Use these test card numbers in development:

| Card Number | Description |
|-------------|-------------|
| 4242424242424242 | Visa - Always succeeds |
| 4000000000000002 | Visa - Always declined |
| 4000000000009995 | Visa - Always fails |
| 5555555555554444 | Mastercard - Always succeeds |

- Use any future expiry date (MM/YY)
- Use any 3-digit CVC
- Use any ZIP code

## 🏗️ Architecture Overview

### Components Added:

1. **`lib/stripe.js`** - Stripe configuration and utilities
2. **`components/StripeCheckout.jsx`** - React component for payment processing
3. **`app/api/payment/create-intent/route.js`** - API to create payment intents
4. **`app/api/webhooks/stripe/route.js`** - Webhook handler for payment events
5. **`app/payment/success/page.jsx`** - Success page after payment
6. **`app/payment/cancel/page.jsx`** - Cancel page for failed payments

### Payment Flow:

1. **User initiates checkout** → Creates payment intent
2. **User enters card details** → Stripe securely processes payment
3. **Payment succeeds** → Webhook creates order in database
4. **User redirected** → Success page with order confirmation

## 🛠️ Usage Examples

### Using the StripeCheckout Component:

```jsx
import StripeCheckout from '@/components/StripeCheckout';

function CheckoutPage() {
  const cartItems = [
    { productId: '...', quantity: 2 },
    // ... more items
  ];

  const address = {
    fullName: 'John Doe',
    phoneNumber: '1234567890',
    area: 'Downtown',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: 400001
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    // Redirect to success page or show confirmation
    window.location.href = '/payment/success?payment_intent=' + paymentIntent.id;
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Handle error (show message, retry options, etc.)
  };

  return (
    <StripeCheckout
      items={cartItems}
      address={address}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
  );
}
```

### Creating Payment Intent Manually:

```javascript
const response = await fetch('/api/payment/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    address: shippingAddress
  })
});

const { clientSecret, amount } = await response.json();
```

## 🔐 Security Features

- **Payment Intents**: Secure server-side payment processing
- **Webhook Signatures**: Verified webhook events from Stripe
- **No Card Data Storage**: Card details never touch your servers
- **PCI Compliance**: Stripe handles all PCI compliance requirements
- **3D Secure**: Automatic support for Strong Customer Authentication (SCA)

## 📊 Order Management

### Order Status Flow:

1. **Payment Created** → `paymentStatus: 'pending'`
2. **Payment Successful** → `paymentStatus: 'completed'`
3. **Payment Failed** → `paymentStatus: 'failed'`

### Additional Fields in Order Model:

- `paymentIntentId`: Stripe payment intent ID
- `stripeCustomerId`: Stripe customer ID (for future features)
- `paymentMethod`: 'cod', 'card', 'upi', 'wallet'

## 🚨 Error Handling

The integration includes comprehensive error handling:

- **Network Issues**: Automatic retries with exponential backoff
- **Invalid Cards**: Clear error messages to users
- **Insufficient Funds**: Proper error display
- **Webhook Failures**: Logging and monitoring
- **Stock Issues**: Real-time inventory checking

## 📈 Monitoring & Analytics

### Webhook Monitoring:
Check webhook delivery status in Stripe Dashboard under **Developers > Webhooks**.

### Payment Analytics:
View payment analytics in Stripe Dashboard under **Payments**.

### Error Logs:
Monitor your application logs for payment-related errors and webhook processing.

## 🔄 Webhook Event Handling

The webhook handler processes these events:

- **`payment_intent.succeeded`**: Creates order, updates stock, sends emails
- **`payment_intent.payment_failed`**: Updates order status, restores stock
- **`payment_intent.canceled`**: Marks order as cancelled, restores stock

## 🧪 Testing Checklist

- [ ] Test successful payment with test card
- [ ] Test failed payment scenarios
- [ ] Test webhook delivery and processing
- [ ] Test order creation and stock updates
- [ ] Test email notifications
- [ ] Test payment success/cancel pages
- [ ] Test with different browsers and devices

## 🚀 Production Deployment

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Update Webhook URL**: Point to your production domain
3. **Enable HTTPS**: Ensure your webhook endpoint uses HTTPS
4. **Monitor Webhooks**: Set up monitoring for webhook delivery
5. **Test Thoroughly**: Test with real (small amount) transactions

## 🆘 Troubleshooting

### Common Issues:

**Webhook not working:**
- Check webhook URL is accessible
- Verify webhook secret is correct
- Check webhook event selection

**Payment fails:**
- Verify API keys are correct
- Check test vs live mode consistency
- Ensure sufficient test card limits

**Orders not created:**
- Check webhook processing logs
- Verify database connection
- Check for webhook signature issues

## 📞 Support

For Stripe-specific issues, check:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For integration issues, check the application logs and webhook delivery status in Stripe Dashboard.

---

**Note**: This integration is production-ready but should be thoroughly tested before going live with real payments.
