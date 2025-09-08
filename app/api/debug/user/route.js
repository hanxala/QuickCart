import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    console.log('Clerk User ID:', userId);
    
    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        clerkUserId: null,
        dbUser: null,
        error: 'No Clerk user ID found'
      });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });
    
    console.log('Database user:', user);
    
    return NextResponse.json({
      authenticated: true,
      clerkUserId: userId,
      dbUser: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      } : null,
      isAdmin: user && user.role === 'admin'
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { error: 'Failed to debug user', details: error.message },
      { status: 500 }
    );
  }
}
