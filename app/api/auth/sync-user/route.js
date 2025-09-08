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
    
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    
    // Check if user already exists by clerkUserId first
    let user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      // If no user found by clerkUserId, check by email
      user = await User.findOne({ email: userEmail });
      
      if (user) {
        // User exists with same email but different clerkUserId
        // Update the clerkUserId to link Clerk account
        user.clerkUserId = userId;
        user.name = clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`;
        user.imageUrl = clerkUser.imageUrl || '';
        user.lastLogin = new Date();
        
        await user.save();
        console.log('Linked existing user with Clerk:', user);
      } else {
        // Create completely new user
        try {
          user = new User({
            clerkUserId: userId,
            name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
            email: userEmail,
            imageUrl: clerkUser.imageUrl || '',
            role: 'customer', // Default role
            isActive: true
          });
          
          await user.save();
          console.log('Created new user:', user);
        } catch (saveError) {
          // Handle duplicate key errors gracefully
          if (saveError.code === 11000) {
            // Try to find the existing user and update it
            user = await User.findOne({ $or: [{ clerkUserId: userId }, { email: userEmail }] });
            if (user) {
              user.clerkUserId = userId;
              user.name = clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`;
              user.email = userEmail;
              user.imageUrl = clerkUser.imageUrl || '';
              user.lastLogin = new Date();
              await user.save();
              console.log('Updated existing user after duplicate error:', user);
            } else {
              throw saveError;
            }
          } else {
            throw saveError;
          }
        }
      }
    } else {
      // Update existing user with latest Clerk data
      user.name = clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`;
      user.email = userEmail;
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
