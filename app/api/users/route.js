import dbConnect from '@/lib/database';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// GET - Fetch user profile
export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    let user = await User.findOne({ clerkUserId: auth.userId });
    
    if (!user) {
      // Create user if doesn't exist
      user = new User({
        clerkUserId: auth.userId,
        name: auth.user.name,
        email: auth.user.email,
        imageUrl: auth.user.imageUrl
      });
      await user.save();
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Convert cartItems Map to Object for response
    const userData = {
      ...user.toObject(),
      cartItems: Object.fromEntries(user.cartItems)
    };

    const response = createApiResponse(userData);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const body = await request.json();
    const allowedUpdates = ['name', 'role'];
    const updates = {};

    // Filter only allowed updates
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      const response = createApiResponse('No valid updates provided', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { clerkUserId: auth.userId },
      updates,
      { new: true, upsert: true }
    );

    // Convert cartItems Map to Object for response
    const userData = {
      ...user.toObject(),
      cartItems: Object.fromEntries(user.cartItems)
    };

    const response = createApiResponse(userData);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// DELETE - Deactivate user account
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      const response = createApiResponse('User not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // Deactivate instead of delete to preserve order history
    user.isActive = false;
    user.cartItems.clear(); // Clear cart items
    await user.save();

    const response = createApiResponse('Account deactivated successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
