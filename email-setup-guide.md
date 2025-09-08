# Email Configuration Setup Guide

## Gmail App Password Setup

To fix the email authentication error, you need to generate a Gmail App Password:

### Step 1: Enable 2-Step Verification
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification"
3. Follow the steps to enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to "Security" → "App passwords"
2. Select "Mail" and "Other (custom name)"
3. Enter "QuickCart Admin" as the app name
4. Copy the generated 16-character password

### Step 3: Update .env File
Replace the current password in your .env file:

```env
ADMIN_EMAIL_PASSWORD=your-16-character-app-password-here
```

**Important:** Remove spaces from the app password and use it exactly as generated.

### Step 4: Test Email Configuration
Run the test email script:

```bash
npm run test-email
```

## Alternative Email Providers

If you prefer not to use Gmail, you can use other providers:

### Outlook/Hotmail
```env
ADMIN_EMAIL=your-email@outlook.com
ADMIN_EMAIL_PASSWORD=your-app-password
```

Update `lib/emailService.js`:
```javascript
const emailConfig = {
  service: 'hotmail', // or 'outlook'
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
};
```

### Custom SMTP
```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_SECURE=false
ADMIN_EMAIL=your-email@domain.com
ADMIN_EMAIL_PASSWORD=your-password
```

Update `lib/emailService.js`:
```javascript
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
};
```

## Testing Email Functionality

After configuration, test with:
```bash
node scripts/test-email.js
```

You should see:
- ✅ Email sent successfully
- 📧 Check your notification email for the test message
