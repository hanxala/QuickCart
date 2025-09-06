import dotenv from 'dotenv';
import emailService from '../lib/emailService.js';

// Load environment variables
dotenv.config();

async function testEmailNotifications() {
  console.log('🧪 Testing Email Notification System...\n');
  
  // Check if email configuration is set
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASSWORD) {
    console.error('❌ Email configuration missing!');
    console.log('Please set the following environment variables in your .env file:');
    console.log('- ADMIN_EMAIL=your-admin-email@gmail.com');
    console.log('- ADMIN_EMAIL_PASSWORD=your-app-password-here');
    console.log('- ADMIN_NOTIFICATION_EMAIL=your-admin-email@gmail.com (optional, defaults to ADMIN_EMAIL)');
    console.log('\n📝 For Gmail, you need to:');
    console.log('1. Enable 2-factor authentication on your Google account');
    console.log('2. Generate an App Password: https://myaccount.google.com/apppasswords');
    console.log('3. Use the App Password (not your regular password) in ADMIN_EMAIL_PASSWORD');
    return;
  }

  console.log('✅ Email configuration found');
  console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`📬 Notification Email: ${process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL}\n`);

  try {
    // Test New Order Notification
    console.log('📬 Testing New Order Notification...');
    const orderResult = await emailService.sendTestEmail();
    
    if (orderResult.success) {
      console.log('✅ New Order notification sent successfully!');
      console.log(`   Message ID: ${orderResult.messageId}\n`);
    } else {
      console.error('❌ Failed to send New Order notification:');
      console.error(`   Error: ${orderResult.error}\n`);
    }

    // Test Low Stock Alert
    console.log('📦 Testing Low Stock Alert...');
    const stockResult = await emailService.notifyLowStock({
      _id: 'TEST_PRODUCT_123',
      name: 'Test Product - Low Stock',
      stock: 2
    });
    
    if (stockResult.success) {
      console.log('✅ Low Stock alert sent successfully!');
      console.log(`   Message ID: ${stockResult.messageId}\n`);
    } else {
      console.error('❌ Failed to send Low Stock alert:');
      console.error(`   Error: ${stockResult.error}\n`);
    }

    // Test New User Registration
    console.log('👤 Testing New User Registration notification...');
    const userResult = await emailService.notifyNewUser({
      id: 'TEST_USER_123',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test.user@example.com' }]
    });
    
    if (userResult.success) {
      console.log('✅ New User notification sent successfully!');
      console.log(`   Message ID: ${userResult.messageId}\n`);
    } else {
      console.error('❌ Failed to send New User notification:');
      console.error(`   Error: ${userResult.error}\n`);
    }

    // Test Order Status Update
    console.log('📦 Testing Order Status Update notification...');
    const statusResult = await emailService.notifyOrderStatusUpdate({
      _id: 'TEST_ORDER_456',
      orderStatus: 'Shipped',
      trackingNumber: 'TRK123456789',
      address: {
        fullName: 'Test Customer'
      }
    });
    
    if (statusResult.success) {
      console.log('✅ Order Status Update notification sent successfully!');
      console.log(`   Message ID: ${statusResult.messageId}\n`);
    } else {
      console.error('❌ Failed to send Order Status Update notification:');
      console.error(`   Error: ${statusResult.error}\n`);
    }

    console.log('🎉 Email testing completed!');
    console.log('📧 Check your admin email inbox for the test notifications.');
    
  } catch (error) {
    console.error('❌ Email testing failed:');
    console.error(error);
  }
}

// Run the test
testEmailNotifications();
