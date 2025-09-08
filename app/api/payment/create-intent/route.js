import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';
import { createPaymentIntent } from '@/lib/stripe';
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
    const shippingCost = totalAmount > 500 ? 0 : 50; // Free shipping above ₹500
    const taxAmount = totalAmount * 0.1; // 10% tax
    const finalAmount = totalAmount + shippingCost + taxAmount;

    // Create payment intent with metadata
    const paymentIntent = await createPaymentIntent({
      amount: finalAmount,
      currency: 'inr',
      metadata: {
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
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmount,
      breakdown: {
        totalAmount,
        shippingCost,
        taxAmount,
        finalAmount
      }
    }, 200);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
