// Notification service for real-time admin notifications
class NotificationService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : 'http://localhost:3000';
  }

  async sendNotification(type, title, message, data = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          message,
          data
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Notification sent: ${title} (${result.activeConnections} active connections)`);
        return { success: true, activeConnections: result.activeConnections };
      } else {
        console.error('Failed to send notification:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Notification service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Specific notification methods for different events
  async notifyNewOrder(orderData) {
    return await this.sendNotification(
      'order',
      '🛒 New Order Received',
      `Order #${orderData._id} placed by ${orderData.address.fullName}`,
      {
        orderId: orderData._id,
        customerName: orderData.address.fullName,
        amount: orderData.finalAmount,
        items: orderData.items.length,
        paymentMethod: orderData.paymentMethod
      }
    );
  }

  async notifyLowStock(product) {
    return await this.sendNotification(
      'warning',
      '⚠️ Low Stock Alert',
      `${product.name} is running low (${product.stock} units left)`,
      {
        productId: product._id,
        productName: product.name,
        stock: product.stock,
        category: product.category
      }
    );
  }

  async notifyNewUser(userData) {
    return await this.sendNotification(
      'user',
      '👤 New User Registration',
      `${userData.name} just joined Hanzala.co`,
      {
        userId: userData.clerkUserId,
        userName: userData.name,
        email: userData.email
      }
    );
  }

  async notifyOrderStatusUpdate(orderData, oldStatus, newStatus) {
    return await this.sendNotification(
      'info',
      '📦 Order Status Updated',
      `Order #${orderData._id} status changed from ${oldStatus} to ${newStatus}`,
      {
        orderId: orderData._id,
        oldStatus,
        newStatus,
        customerName: orderData.address.fullName
      }
    );
  }

  async notifyPaymentReceived(orderData) {
    return await this.sendNotification(
      'success',
      '💰 Payment Received',
      `Payment of ₹${orderData.finalAmount} received for Order #${orderData._id}`,
      {
        orderId: orderData._id,
        amount: orderData.finalAmount,
        paymentMethod: orderData.paymentMethod
      }
    );
  }

  async notifyProductOutOfStock(product) {
    return await this.sendNotification(
      'error',
      '❌ Product Out of Stock',
      `${product.name} is now out of stock`,
      {
        productId: product._id,
        productName: product.name,
        category: product.category
      }
    );
  }

  async notifyProductCreated(product) {
    return await this.sendNotification(
      'product',
      '🎉 New Product Created!',
      `"${product.name}" has been added to your store and is now available for customers`,
      {
        productId: product._id,
        productName: product.name,
        category: product.category,
        price: product.offerPrice,
        stock: product.stock,
        discount: product.price > product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0
      }
    );
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export class for testing or multiple instances
export { NotificationService };
