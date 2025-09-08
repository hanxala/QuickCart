import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Fallback admin check that doesn't rely on database
// Uses environment variables or hardcoded admin emails
export async function GET() {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json({
        isAdmin: false,
        user: null,
        error: 'Not authenticated'
      });
    }

    // Get user email from Clerk
    const { currentUser } = await import("@clerk/nextjs/server");
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({
        isAdmin: false,
        user: null,
        error: 'User not found'
      });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase();
    
    // Define admin emails (you can also use environment variables)
    const adminEmails = [
      'hanzalakhan0912@gmail.com',
      process.env.ADMIN_EMAIL?.toLowerCase(),
      process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()
    ].filter(Boolean); // Remove null/undefined values

    console.log('🔍 [Fallback Admin Check] User email:', userEmail);
    console.log('🔍 [Fallback Admin Check] Admin emails:', adminEmails);

    const isAdmin = adminEmails.includes(userEmail);

    console.log('✅ [Fallback Admin Check] Is admin:', isAdmin);

    return NextResponse.json({
      isAdmin,
      user: isAdmin ? {
        id: userId,
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: userEmail,
        role: 'admin'
      } : null,
      method: 'fallback',
      checkedEmails: adminEmails
    });
  } catch (error) {
    console.error('❌ [Fallback Admin Check] Error:', error);
    return NextResponse.json(
      { 
        isAdmin: false, 
        user: null, 
        error: 'Failed to check admin access',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
