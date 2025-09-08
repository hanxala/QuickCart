import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import dbConnect from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import emailService from '@/lib/emailService';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Get the raw body as text for webhook signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log('Payment succeeded for payment intent:', paymentIntent.id);
    
    const { metadata } = paymentIntent;
    
    if (!metadata.userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Parse metadata
    const userId = metadata.userId;
    const totalAmount = parseFloat(metadata.totalAmount);
    const shippingCost = parseFloat(metadata.shippingCost);
    const taxAmount = parseFloat(metadata.taxAmount);
    const finalAmount = parseFloat(metadata.finalAmount);
    const address = JSON.parse(metadata.address);
    const orderItems = JSON.parse(metadata.orderItems);

    // Set estimated delivery (7 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create order in database
    const order = new Order({
      userId,
      items: orderItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      shippingCost,
      taxAmount,
      finalAmount,
      address,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      paymentIntentId: paymentIntent.id,
      estimatedDelivery
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    const user = await User.findOne({ clerkUserId: userId });
    if (user) {
      user.cartItems.clear();
      await user.save();
    }

    // Populate the order before sending emails
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    // Send confirmation emails
    try {
      await emailService.notifyNewOrder(populatedOrder);
      console.log('Admin notification email sent for order:', populatedOrder._id);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }

    // Check for low stock products and send alerts
    try {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.stock <= 5) {
          await emailService.notifyLowStock(product);
          console.log('Low stock alert sent for product:', product.name);
        }
      }
    } catch (stockEmailError) {
      console.error('Failed to send low stock alerts:', stockEmailError);
    }

    console.log('Order created successfully:', order._id);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    console.log('Payment failed for payment intent:', paymentIntent.id);
    
    // Find order by paymentIntentId and update status
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
      
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
      
      console.log('Order payment status updated to failed:', order._id);
    }

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  try {
    console.log('Payment canceled for payment intent:', paymentIntent.id);
    
    // Find order by paymentIntentId and update status
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (order) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'Cancelled';
      await order.save();
      
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
      
      console.log('Order canceled and stock restored:', order._id);
    }

  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}
