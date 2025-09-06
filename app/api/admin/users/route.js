import { requireAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/database';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Return error response if not admin
    }

    await dbConnect();
    const users = await User.find({})
      .select('-cartItems') // Exclude cart data for privacy
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
