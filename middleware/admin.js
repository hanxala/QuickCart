import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return { user, userId };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function checkAdminAccess() {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return { isAdmin: false, user: null };
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });
    
    return { 
      isAdmin: user && user.role === 'admin',
      user
    };
  } catch (error) {
    console.error('Admin check error:', error);
    return { isAdmin: false, user: null };
  }
}

export async function adminMiddleware(userId) {
  try {
    if (!userId) {
      return { error: "Authentication required", status: 401 };
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    if (user.role !== 'admin') {
      return { error: "Admin access required", status: 403 };
    }

    return { user, userId };
  } catch (error) {
    console.error('Admin middleware error:', error);
    return { error: "Authentication failed", status: 500 };
  }
}
