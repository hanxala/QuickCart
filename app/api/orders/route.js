import dbConnect from '@/lib/database';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';
import emailService from '@/lib/emailService';

// GET - Fetch user's orders
export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: auth.userId })
      .populate('items.product')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ userId: auth.userId });

    const response = createApiResponse({
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { items, address, paymentMethod = 'cod' } = await request.json();

    if (!items || !items.length || !address) {
      const response = createApiResponse('Items and address are required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // Validate address fields
    const requiredAddressFields = ['fullName', 'phoneNumber', 'area', 'city', 'state', 'pincode'];
    for (const field of requiredAddressFields) {
      if (!address[field]) {
        const response = createApiResponse(`Address ${field} is required`, 400);
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Validate and calculate order details
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        const response = createApiResponse(`Product ${item.productId} not found or inactive`, 400);
        return NextResponse.json(response, { status: 400 });
      }

      if (product.stock < item.quantity) {
        const response = createApiResponse(`Insufficient stock for ${product.name}`, 400);
        return NextResponse.json(response, { status: 400 });
      }

      const itemPrice = product.offerPrice * item.quantity;
      totalAmount += itemPrice;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.offerPrice
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate additional costs
    const shippingCost = totalAmount > 500 ? 0 : 50; // Free shipping above $500
    const taxAmount = totalAmount * 0.1; // 10% tax
    const finalAmount = totalAmount + shippingCost + taxAmount;

    // Set estimated delivery (7 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const order = new Order({
      userId: auth.userId,
      items: orderItems,
      totalAmount,
      shippingCost,
      taxAmount,
      finalAmount,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      estimatedDelivery
    });

    await order.save();

    // Clear user's cart
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (user) {
      user.cartItems.clear();
      await user.save();
    }

    // Populate the order before returning
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    // Send admin notification email
    try {
      await emailService.notifyNewOrder(populatedOrder);
      console.log('Admin notification email sent for order:', populatedOrder._id);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Check for low stock products and send alerts
    try {
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product && product.stock <= 5) { // Alert when stock is 5 or below
          await emailService.notifyLowStock(product);
          console.log('Low stock alert sent for product:', product.name);
        }
      }
    } catch (stockEmailError) {
      console.error('Failed to send low stock alerts:', stockEmailError);
    }

    const response = createApiResponse(populatedOrder, 201);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
