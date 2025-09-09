import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyRazorpayWebhook, fetchRazorpayPayment } from '@/lib/razorpay';
import dbConnect from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('x-razorpay-signature');

    if (!signature) {
      console.error('Missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const verification = verifyRazorpayWebhook(JSON.parse(body), signature);
    
    if (!verification.isValid) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = verification.payload;
    console.log('Razorpay webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment) {
  try {
    console.log('Processing payment captured:', payment.id);

    // Find order by Razorpay order ID
    const order = await Order.findOne({ 
      'paymentInfo.razorpayOrderId': payment.order_id 
    });

    if (!order) {
      console.error('Order not found for payment:', payment.id);
      return;
    }

    // Update order with payment information
    order.paymentInfo = {
      ...order.paymentInfo,
      razorpayPaymentId: payment.id,
      razorpaySignature: payment.notes?.signature || '',
      paymentMethod: payment.method,
      paymentStatus: 'completed',
      paidAt: new Date(payment.created_at * 1000),
    };

    order.orderStatus = 'confirmed';
    order.paymentStatus = 'completed';

    await order.save();

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    console.log('Payment captured successfully processed for order:', order._id);

  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    console.log('Processing payment failed:', payment.id);

    // Find order by Razorpay order ID
    const order = await Order.findOne({ 
      'paymentInfo.razorpayOrderId': payment.order_id 
    });

    if (!order) {
      console.error('Order not found for failed payment:', payment.id);
      return;
    }

    // Update order status
    order.paymentInfo = {
      ...order.paymentInfo,
      razorpayPaymentId: payment.id,
      paymentStatus: 'failed',
      failureReason: payment.error_description || 'Payment failed'
    };

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'failed';

    await order.save();

    console.log('Payment failure processed for order:', order._id);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(razorpayOrder) {
  try {
    console.log('Processing order paid:', razorpayOrder.id);

    // Find order by Razorpay order ID
    const order = await Order.findOne({ 
      'paymentInfo.razorpayOrderId': razorpayOrder.id 
    });

    if (!order) {
      console.error('Order not found for paid order:', razorpayOrder.id);
      return;
    }

    // Update order status if not already updated
    if (order.paymentStatus !== 'completed') {
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      
      await order.save();

      // Update product stock if not already updated
      const stockUpdated = order.paymentInfo?.stockUpdated;
      if (!stockUpdated) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }

        // Mark stock as updated
        order.paymentInfo.stockUpdated = true;
        await order.save();
      }
    }

    console.log('Order paid successfully processed for order:', order._id);

  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}
