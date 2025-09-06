import dbConnect from '@/lib/database';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// GET - Fetch user's cart
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
    }

    // Convert Map to Object for response
    const cartItems = Object.fromEntries(user.cartItems);
    
    // Get detailed cart information
    const cartDetails = [];
    for (const [productId, quantity] of Object.entries(cartItems)) {
      const product = await Product.findById(productId);
      if (product && product.isActive) {
        cartDetails.push({
          product,
          quantity
        });
      }
    }

    const response = createApiResponse({ cartItems: cartDetails });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// POST - Add item to cart
export async function POST(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      const response = createApiResponse('Product ID is required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      const response = createApiResponse('Product not found or inactive', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // Check stock availability
    if (product.stock < quantity) {
      const response = createApiResponse('Insufficient stock', 400);
      return NextResponse.json(response, { status: 400 });
    }

    let user = await User.findOne({ clerkUserId: auth.userId });
    
    if (!user) {
      user = new User({
        clerkUserId: auth.userId,
        name: auth.user.name,
        email: auth.user.email,
        imageUrl: auth.user.imageUrl
      });
    }

    // Update cart
    const currentQuantity = user.cartItems.get(productId) || 0;
    const newQuantity = currentQuantity + quantity;

    // Check if total quantity exceeds stock
    if (newQuantity > product.stock) {
      const response = createApiResponse('Cannot add more items than available stock', 400);
      return NextResponse.json(response, { status: 400 });
    }

    user.cartItems.set(productId, newQuantity);
    await user.save();

    const response = createApiResponse('Item added to cart successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// PUT - Update cart item quantity
export async function PUT(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity < 0) {
      const response = createApiResponse('Invalid product ID or quantity', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      const response = createApiResponse('User not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    if (quantity === 0) {
      user.cartItems.delete(productId);
    } else {
      // Validate stock
      const product = await Product.findById(productId);
      if (!product) {
        const response = createApiResponse('Product not found', 404);
        return NextResponse.json(response, { status: 404 });
      }

      if (quantity > product.stock) {
        const response = createApiResponse('Quantity exceeds available stock', 400);
        return NextResponse.json(response, { status: 400 });
      }

      user.cartItems.set(productId, quantity);
    }

    await user.save();

    const response = createApiResponse('Cart updated successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// DELETE - Clear entire cart
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

    user.cartItems.clear();
    await user.save();

    const response = createApiResponse('Cart cleared successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
