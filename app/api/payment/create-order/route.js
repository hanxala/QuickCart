import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import dbConnect from '@/lib/database';
import Product from '@/models/Product';

export async function POST(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { items, address } = await request.json();

    if (!items || !items.length || !address) {
      const response = createApiResponse('Items and address are required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // Validate and calculate order total
    let totalAmount = 0;
    const orderItems = [];

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
        name: product.name,
        quantity: item.quantity,
        price: product.offerPrice
      });
    }

    // Calculate additional costs
    const shippingCost = 0; // Free shipping
    const taxAmount = Math.floor(totalAmount * 0.02); // 2% tax to match frontend
    const finalAmount = totalAmount + shippingCost + taxAmount;

    // Generate unique receipt ID (max 40 chars for Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const userIdShort = auth.userId.slice(-8); // Last 8 characters of user ID
    const receiptId = `ord_${userIdShort}_${timestamp}`;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: finalAmount,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: auth.userId,
        totalAmount: totalAmount.toString(),
        shippingCost: shippingCost.toString(),
        taxAmount: taxAmount.toString(),
        finalAmount: finalAmount.toString(),
        itemsCount: items.length.toString(),
        address: JSON.stringify(address),
        orderItems: JSON.stringify(orderItems)
      }
    });

    const response = createApiResponse({
      orderId: razorpayOrder.id,
      amount: finalAmount,
      currency: 'INR',
      receipt: receiptId,
      breakdown: {
        totalAmount,
        shippingCost,
        taxAmount,
        finalAmount
      }
    }, 200);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
