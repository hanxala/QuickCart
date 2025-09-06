import dbConnect from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';
import { adminMiddleware } from '@/middleware/admin';
import emailService from '@/lib/emailService';

// GET - Fetch all orders (Admin only)
export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const adminCheck = await adminMiddleware(auth.userId);
    if (adminCheck.error) {
      const response = createApiResponse(adminCheck.error, adminCheck.status);
      return NextResponse.json(response, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    const response = createApiResponse({
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: {
        total: await Order.countDocuments(),
        pending: await Order.countDocuments({ orderStatus: 'Order Placed' }),
        processing: await Order.countDocuments({ orderStatus: 'Processing' }),
        shipped: await Order.countDocuments({ orderStatus: 'Shipped' }),
        delivered: await Order.countDocuments({ orderStatus: 'Delivered' }),
        cancelled: await Order.countDocuments({ orderStatus: 'Cancelled' })
      }
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// PUT - Update order status (Admin only)
export async function PUT(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const adminCheck = await adminMiddleware(auth.userId);
    if (adminCheck.error) {
      const response = createApiResponse(adminCheck.error, adminCheck.status);
      return NextResponse.json(response, { status: adminCheck.status });
    }

    const { orderId, orderStatus, trackingNumber, notes } = await request.json();

    if (!orderId || !orderStatus) {
      const response = createApiResponse('Order ID and status are required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // Validate order status
    const validStatuses = [
      'Order Placed', 'Processing', 'Shipped', 
      'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'
    ];

    if (!validStatuses.includes(orderStatus)) {
      const response = createApiResponse('Invalid order status', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      const response = createApiResponse('Order not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // Store old status for comparison
    const oldStatus = order.orderStatus;

    // Update order
    order.orderStatus = orderStatus;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (notes) {
      order.notes = notes;
    }

    // Set actual delivery date if status is 'Delivered'
    if (orderStatus === 'Delivered' && oldStatus !== 'Delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    // Send admin notification email if status changed
    if (oldStatus !== orderStatus) {
      try {
        await emailService.notifyOrderStatusUpdate(order);
        console.log('Admin notification sent for order status update:', orderId);
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    const response = createApiResponse(order, 200);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// DELETE - Cancel order (Admin only)
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const adminCheck = await adminMiddleware(auth.userId);
    if (adminCheck.error) {
      const response = createApiResponse(adminCheck.error, adminCheck.status);
      return NextResponse.json(response, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      const response = createApiResponse('Order ID is required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      const response = createApiResponse('Order not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // Check if order can be cancelled
    if (['Delivered', 'Cancelled', 'Returned'].includes(order.orderStatus)) {
      const response = createApiResponse('Order cannot be cancelled in current status', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Update order status
    order.orderStatus = 'Cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    // Send admin notification
    try {
      await emailService.notifyOrderStatusUpdate(order);
      console.log('Admin notification sent for order cancellation:', orderId);
    } catch (emailError) {
      console.error('Failed to send order cancellation email:', emailError);
    }

    const response = createApiResponse({ message: 'Order cancelled successfully', order }, 200);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
