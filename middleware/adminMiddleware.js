import { NextResponse } from 'next/server';
import authAdmin from '@/lib/authAdmin';

export async function adminMiddleware(request) {
  try {
    // Get the user ID from the request
    const userId = request.auth?.userId;
    
    if (!userId) {
      // If no user ID, redirect to sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // Check if the user is an admin
    const isAdmin = await authAdmin(userId);
    
    if (!isAdmin) {
      // If not an admin, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // If admin, allow access to the route
    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    // In case of error, redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  }
}