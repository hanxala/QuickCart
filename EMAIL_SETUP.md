# 📧 Email Notification Setup Guide

This guide will help you configure admin email notifications for your QuickCart application. You'll receive notifications for:

- 🛒 **New Orders** - Complete order details with customer info and items
- 📦 **Order Status Updates** - When order status changes (Processing, Shipped, Delivered, etc.)
- ⚠️ **Low Stock Alerts** - When products are running low on inventory
- 👤 **New User Registrations** - When new customers sign up

## 🔧 Setup Steps

### 1. Configure Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration for Admin Notifications
ADMIN_EMAIL=your-admin-email@gmail.com
ADMIN_EMAIL_PASSWORD=your-app-password-here
ADMIN_NOTIFICATION_EMAIL=your-admin-email@gmail.com
```

### 2. Gmail Setup (Recommended)

If you're using Gmail, you need to generate an App Password:

1. **Enable 2-Factor Authentication** on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Use this 16-character password in `ADMIN_EMAIL_PASSWORD`

**⚠️ Never use your regular Gmail password!**

### 3. Alternative Email Services

You can also use other email services by modifying the email configuration in `lib/emailService.js`:

```javascript
const emailConfig = {
  host: 'smtp.yourdomain.com',  // Your SMTP host
  port: 587,                    // Your SMTP port
  secure: false,                // true for 465, false for other ports
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
};
```

### 4. Test the Setup

Run the test script to verify everything is working:

```bash
npm run test-email
```

This will send test emails for all notification types and show you if the configuration is correct.

## 📬 What Notifications You'll Receive

### 🛒 New Order Notifications
- **When**: A customer places a new order
- **Contains**: Complete order details, customer information, items, and totals
- **Subject**: `🛒 New Order Received - Order #[ORDER_ID]`

### 📦 Order Status Updates
- **When**: Order status changes (manually updated by admin)
- **Contains**: Order ID, new status, customer name, tracking number
- **Subject**: `📦 Order Status Updated - Order #[ORDER_ID]`

### ⚠️ Low Stock Alerts
- **When**: Product stock drops to 5 units or below
- **Contains**: Product name, current stock level, product ID
- **Subject**: `⚠️ Low Stock Alert - [PRODUCT_NAME]`

### 👤 New User Registration
- **When**: A new user signs up (if implemented)
- **Contains**: User details, registration date, user ID
- **Subject**: `👤 New User Registration - [USER_NAME]`

## 🔧 Configuration Options

### Email Settings

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_EMAIL` | Your admin email address | Yes |
| `ADMIN_EMAIL_PASSWORD` | App password (not regular password) | Yes |
| `ADMIN_NOTIFICATION_EMAIL` | Email to receive notifications (defaults to ADMIN_EMAIL) | No |

### Notification Triggers

| Event | Trigger Location | Customizable |
|-------|------------------|-------------|
| New Order | `app/api/orders/route.js` | ✅ |
| Order Status Update | `app/api/admin/orders/route.js` | ✅ |
| Low Stock Alert | Automatic when stock ≤ 5 | ✅ |
| New User | Manual implementation needed | ✅ |

## 🎨 Customizing Email Templates

All email templates are in `lib/emailService.js`. You can customize:

- **HTML styling**: Modify the CSS in email templates
- **Email content**: Change the text and structure
- **Trigger conditions**: Modify when notifications are sent
- **Additional data**: Include more information in notifications

### Example: Changing Low Stock Threshold

In `app/api/orders/route.js`, find this line:
```javascript
if (product && product.stock <= 5) { // Alert when stock is 5 or below
```

Change `5` to your preferred threshold.

## 🧪 Testing

### Run Full Test Suite
```bash
npm run test-email
```

### Test Individual Notification Types

```javascript
import emailService from './lib/emailService.js';

// Test new order notification
await emailService.sendTestEmail();

// Test low stock alert
await emailService.notifyLowStock({
  _id: 'PRODUCT_ID',
  name: 'Product Name',
  stock: 2
});
```

## 🔍 Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check if `ADMIN_EMAIL` and `ADMIN_EMAIL_PASSWORD` are set
   - Verify the `.env` file is in the root directory

2. **"Invalid login" for Gmail**
   - Make sure you're using an App Password, not your regular password
   - Verify 2-Factor Authentication is enabled

3. **Emails not being sent**
   - Check console logs for error messages
   - Verify your email provider's SMTP settings
   - Test with the `npm run test-email` command

4. **HTML not displaying correctly**
   - Some email clients don't support all CSS
   - The templates include fallback plain text versions

### Debug Mode

Enable detailed logging by adding this to your email service:

```javascript
// In lib/emailService.js
const transporter = nodemailer.createTransporter({
  ...emailConfig,
  debug: true,
  logger: true
});
```

## 📊 Monitoring

### Email Delivery Status

The email service returns status information:
```javascript
{
  success: true,
  messageId: "unique-message-id"
}
```

### Server Logs

Check your application logs for email-related messages:
- ✅ `Admin notification email sent for order: ORDER_ID`
- ✅ `Low stock alert sent for product: PRODUCT_NAME`
- ❌ `Failed to send admin notification email: ERROR_MESSAGE`

## 🔒 Security Best Practices

1. **Use App Passwords**: Never use your main email password
2. **Environment Variables**: Keep email credentials in `.env`, never in code
3. **Rate Limiting**: Consider implementing email rate limits for high-volume stores
4. **Secure SMTP**: Use TLS/SSL for email transmission

## 🚀 Advanced Features

### Custom Email Service Providers

You can integrate with services like:
- **SendGrid**: Professional email delivery
- **Mailgun**: Reliable email API
- **AWS SES**: Amazon's email service

### Email Queue System

For high-volume stores, consider implementing an email queue using:
- **Redis** with Bull Queue
- **Database-based** job queues
- **Cloud services** like AWS SQS

### Analytics Integration

Track email performance:
- Open rates
- Click tracking
- Delivery confirmations
- Customer engagement metrics

## 📞 Support

If you encounter issues:

1. Check this documentation
2. Run the test script: `npm run test-email`
3. Check server logs for error messages
4. Verify your email provider settings

---

**✨ Your QuickCart admin notifications are now ready! You'll receive detailed emails for all important store events.**
