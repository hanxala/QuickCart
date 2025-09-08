import nodemailer from 'nodemailer';

// Email service configuration function (dynamic)
const getEmailConfig = () => ({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD?.replace(/\s+/g, ''), // Remove any spaces from app password
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  requireTLS: true,
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

// Create transporter
const createTransporter = () => {
  try {
    // Validate email configuration
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASSWORD) {
      console.error('Email configuration missing. Please set ADMIN_EMAIL and ADMIN_EMAIL_PASSWORD environment variables.');
      return null;
    }


    const emailConfig = getEmailConfig();
    
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify the transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter verification failed:', error.message);
        if (error.code === 'EAUTH') {
          console.error('Gmail authentication failed. Please check:');
          console.error('1. 2-Factor Authentication is enabled on your Google account');
          console.error('2. You are using an App Password (not your regular password)');
          console.error('3. The App Password is correct and has no spaces');
          console.error('4. Generate new App Password at: https://myaccount.google.com/apppasswords');
        }
      } else {
        console.log('Email transporter is ready to send messages');
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

// Email templates
const emailTemplates = {
  newOrder: (orderData) => ({
    subject: `🛒 New Order Received - Order #${orderData._id}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 1.2em; color: #28a745; }
          .address { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .status { display: inline-block; padding: 5px 15px; background: #17a2b8; color: white; border-radius: 20px; font-size: 0.9em; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 New Order Received!</h1>
            <p>Hanzala.co - Admin Notification</p>
          </div>
          <div class="content">
            <div class="order-info">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${orderData._id}</p>
              <p><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${
                orderData.paymentMethod === 'cod' ? '💵 Cash on Delivery' :
                orderData.paymentMethod === 'upi' ? '📱 UPI Payment' :
                orderData.paymentMethod === 'card' ? '💳 Card Payment' :
                orderData.paymentMethod.toUpperCase()
              }</p>
              <p><strong>Payment Status:</strong> <span class="status">${orderData.paymentStatus === 'pending' ? '⏳ Pending' : '✅ Completed'}</span></p>
              <p><strong>Order Status:</strong> <span class="status">${orderData.orderStatus}</span></p>
              <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
            </div>
            
            <h3>Customer Information</h3>
            <div class="address">
              <p><strong>${orderData.address.fullName}</strong></p>
              <p>📱 ${orderData.address.phoneNumber}</p>
              <p>📍 ${orderData.address.area}, ${orderData.address.city}</p>
              <p>${orderData.address.state} - ${orderData.address.pincode}</p>
            </div>
            
            <h3>Order Items</h3>
            ${orderData.items.map(item => `
              <div class="item">
                <span><strong>${item.product.name}</strong> x ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
              <div class="item">
                <span>Subtotal:</span>
                <span>₹${orderData.totalAmount.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Shipping:</span>
                <span>₹${orderData.shippingCost.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Tax:</span>
                <span>₹${orderData.taxAmount.toFixed(2)}</span>
              </div>
              <div class="item total">
                <span>Total Amount:</span>
                <span>₹${orderData.finalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Hanzala.co Admin System</p>
              <p>Please log in to your admin panel to manage this order</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Order Received - Order #${orderData._id}
      
      Customer: ${orderData.address.fullName}
      Phone: ${orderData.address.phoneNumber}
      Address: ${orderData.address.area}, ${orderData.address.city}, ${orderData.address.state} - ${orderData.address.pincode}
      
      Order Total: ₹${orderData.finalAmount.toFixed(2)}
      Payment Method: ${orderData.paymentMethod.toUpperCase()}
      Status: ${orderData.orderStatus}
      
      Items:
      ${orderData.items.map(item => `- ${item.product.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}
    `
  }),

  orderStatusUpdate: (orderData) => ({
    subject: `📦 Order Status Updated - Order #${orderData._id}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .status { display: inline-block; padding: 8px 20px; background: #fd7e14; color: white; border-radius: 25px; font-weight: bold; }
          .order-info { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fd7e14; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Updated</h1>
            <p>Hanzala.co - Admin Notification</p>
          </div>
          <div class="content">
            <div class="order-info">
              <h2>Order #${orderData._id}</h2>
              <p><strong>Customer:</strong> ${orderData.address.fullName}</p>
              <p><strong>New Status:</strong> <span class="status">${orderData.orderStatus}</span></p>
              <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
              ${orderData.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Order Status Updated - Order #${orderData._id}
    
    Customer: ${orderData.address.fullName}
    New Status: ${orderData.orderStatus}
    Updated: ${new Date().toLocaleString()}
    ${orderData.trackingNumber ? `Tracking Number: ${orderData.trackingNumber}` : ''}`
  }),

  lowStock: (product) => ({
    subject: `⚠️ Low Stock Alert - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Low Stock Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
            <p>Hanzala.co - Inventory Notification</p>
          </div>
          <div class="content">
            <div class="alert">
              <h2>${product.name}</h2>
              <p><strong>Current Stock:</strong> ${product.stock} units</p>
              <p><strong>Product ID:</strong> ${product._id}</p>
              <p>This product is running low on stock. Consider restocking soon to avoid stockouts.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Low Stock Alert - ${product.name}
    
    Product ID: ${product._id}
    Current Stock: ${product.stock} units
    
    This product is running low on stock. Consider restocking soon.`
  }),

  newUser: (userData) => ({
    subject: `👤 New User Registration - ${userData.firstName} ${userData.lastName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Registration</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .user-info { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👤 New User Registration</h1>
            <p>Hanzala.co - User Management</p>
          </div>
          <div class="content">
            <div class="user-info">
              <h2>User Details</h2>
              <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
              <p><strong>Email:</strong> ${userData.emailAddresses?.[0]?.emailAddress || 'N/A'}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>User ID:</strong> ${userData.id}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `New User Registration
    
    Name: ${userData.firstName} ${userData.lastName}
    Email: ${userData.emailAddresses?.[0]?.emailAddress || 'N/A'}
    Registration Date: ${new Date().toLocaleString()}
    User ID: ${userData.id}`
  })
};

// Email service class
class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = createTransporter();
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html, text) {
    const transporter = this.getTransporter();
    if (!transporter) {
      console.error('Email transporter not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: `Hanzala.co Admin <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html,
      text
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAdminNotification(template, data) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error('Admin email not configured');
      return { success: false, error: 'Admin email not configured' };
    }

    const emailTemplate = emailTemplates[template](data);
    return await this.sendEmail(
      adminEmail,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text
    );
  }

  // Specific notification methods
  async notifyNewOrder(orderData) {
    return await this.sendAdminNotification('newOrder', orderData);
  }

  async notifyOrderStatusUpdate(orderData) {
    return await this.sendAdminNotification('orderStatusUpdate', orderData);
  }

  async notifyLowStock(productData) {
    return await this.sendAdminNotification('lowStock', productData);
  }

  async notifyNewUser(userData) {
    return await this.sendAdminNotification('newUser', userData);
  }

  // Test email function
  async sendTestEmail() {
    const testData = {
      _id: 'TEST_ORDER_123',
      createdAt: new Date(),
      orderStatus: 'Order Placed',
      paymentMethod: 'cod',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      address: {
        fullName: 'Test Customer',
        phoneNumber: '+91 9876543210',
        area: 'Test Area',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      items: [
        {
          product: { name: 'Test Product 1' },
          quantity: 2,
          price: 299.99
        },
        {
          product: { name: 'Test Product 2' },
          quantity: 1,
          price: 149.99
        }
      ],
      totalAmount: 749.97,
      shippingCost: 0,
      taxAmount: 74.997,
      finalAmount: 824.967
    };

    return await this.notifyNewOrder(testData);
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;

// Export the class for testing or multiple instances
export { EmailService };
