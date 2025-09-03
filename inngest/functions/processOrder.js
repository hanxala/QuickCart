import { inngest } from '@/lib/inngest';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

// This function processes a new order
export const processOrder = inngest.createFunction(
  { id: 'process-order' },
  { event: 'order/created' },
  async ({ event, step }) => {
    const { order } = event.data;

    // Connect to the database
    await connectToDatabase();

    // Update order status to processing
    await step.run('update-order-status', async () => {
      await Order.findByIdAndUpdate(order._id, { status: 'processing' });
      return { success: true, message: 'Order status updated to processing' };
    });

    // Simulate inventory check
    const inventoryCheck = await step.run('check-inventory', async () => {
      // In a real app, you would check inventory here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return { success: true, message: 'Inventory checked successfully' };
    });

    // If inventory check is successful, update order status to shipped
    if (inventoryCheck.success) {
      await step.run('update-order-to-shipped', async () => {
        await Order.findByIdAndUpdate(order._id, { status: 'shipped' });
        return { success: true, message: 'Order status updated to shipped' };
      });

      // Send order confirmation email
      await step.sendEvent({
        name: 'email/order-confirmation',
        data: { order },
      });
    }

    return { success: true, message: 'Order processed successfully' };
  }
);