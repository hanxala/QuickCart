import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { inngest } from '@/lib/inngest';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, products, address, totalAmount } = body;
    
    if (!userId || !products || !address || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Create new order
    const order = new Order({
      userId,
      products,
      address,
      totalAmount,
      status: 'pending',
      date: new Date()
    });
    
    await order.save();
    
    // Trigger order processing event
    await inngest.send({
      name: 'order/created',
      data: {
        order: order.toJSON()
      }
    });
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all orders
    const orders = await Order.find({}).sort({ date: -1 });
    
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}