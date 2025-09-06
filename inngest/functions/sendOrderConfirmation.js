import { inngest } from '@/lib/inngest';

// This function sends an order confirmation email
export const sendOrderConfirmation = inngest.createFunction(
  { id: 'send-order-confirmation' },
  { event: 'email/order-confirmation' },
  async ({ event, step }) => {
    const { order } = event.data;

    // Simulate sending an email
    await step.run('send-email', async () => {
      // In a real app, you would send an email here using a service like SendGrid, Mailgun, etc.
      console.log(`Sending order confirmation email for order ${order._id}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return { success: true, message: 'Order confirmation email sent successfully' };
    });

    return { success: true, message: 'Order confirmation email sent successfully' };
  }
);