import { checkAdminAccess } from '@/middleware/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { isAdmin, user } = await checkAdminAccess();
    
    return NextResponse.json({
      isAdmin,
      user: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error('Check admin access error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin access' },
      { status: 500 }
    );
  }
}
