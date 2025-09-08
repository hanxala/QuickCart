import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get full user details from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    await dbConnect();
    
    // Check if user already exists
    let user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      // Create new user record
      user = new User({
        clerkUserId: userId,
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        imageUrl: clerkUser.imageUrl || '',
        role: 'customer', // Default role
        isActive: true
      });
      
      await user.save();
      console.log('Created new user:', user);
    } else {
      // Update existing user with latest Clerk data
      user.name = clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`;
      user.email = clerkUser.emailAddresses[0]?.emailAddress;
      user.imageUrl = clerkUser.imageUrl || '';
      user.lastLogin = new Date();
      
      await user.save();
      console.log('Updated existing user:', user);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: error.message },
      { status: 500 }
    );
  }
}
