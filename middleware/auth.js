import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';

export async function authMiddleware(req) {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Get current user data from Clerk
    const user = await currentUser();
    
    if (!user) {
      console.error('Auth middleware error: User not found for userId:', userId);
      return { error: 'Unauthorized: User not found', status: 401 };
    }

    return {
      userId,
      user: {
        id: userId,
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl
      }
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
}

export function createApiResponse(data, status = 200) {
  return {
    success: status >= 200 && status < 300,
    data: status >= 200 && status < 300 ? data : null,
    error: status >= 400 ? data : null,
    status
  };
}

export function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error.name === 'ValidationError') {
    return createApiResponse('Validation failed', 400);
  }
  
  if (error.name === 'CastError') {
    return createApiResponse('Invalid ID format', 400);
  }
  
  if (error.code === 11000) {
    return createApiResponse('Duplicate entry', 409);
  }
  
  return createApiResponse('Internal server error', 500);
}
