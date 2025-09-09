import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Address from '@/models/Address';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Fetch user addresses
    const addresses = await Address.find({ userId }).sort({ date: -1 });
    
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if this is the first address (make it default)
    const addressCount = await Address.countDocuments({ userId });
    const isDefault = addressCount === 0;
    
    // Create new address
    const address = new Address({
      ...body,
      userId,
      isDefault,
      date: new Date()
    });
    
    await address.save();
    
    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create address' },
      { status: 500 }
    );
  }
}