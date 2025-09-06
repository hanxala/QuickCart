import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
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
    
    await connectToDatabase();
    
    // Fetch user addresses
    const addresses = await Address.find({ userId }).sort({ date: -1 });
    
    // For now, we'll create a simple user object with the addresses
    // In a real app, you would fetch more user data from your user model
    const user = {
      userId,
      addresses,
      isSeller: false, // This would come from your user model in a real app
    };
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}