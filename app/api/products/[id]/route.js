import dbConnect from '@/lib/database';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// GET - Fetch single product by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const product = await Product.findById(id);

    if (!product) {
      const response = createApiResponse('Product not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    const response = createApiResponse(product);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// PUT - Update product (Owner only)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { id } = params;
    const body = await request.json();

    const product = await Product.findById(id);
    if (!product) {
      const response = createApiResponse('Product not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // Check if user owns this product
    if (product.userId !== auth.userId) {
      const response = createApiResponse('Access denied', 403);
      return NextResponse.json(response, { status: 403 });
    }

    // Update only provided fields
    const allowedUpdates = ['name', 'description', 'price', 'offerPrice', 'image', 'category', 'stock', 'isActive'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Validation for price fields
    if (updates.offerPrice && updates.price && updates.offerPrice > updates.price) {
      const response = createApiResponse('Offer price cannot be greater than original price', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    const response = createApiResponse(updatedProduct);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// DELETE - Delete product (Owner only)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { id } = params;
    const product = await Product.findById(id);

    if (!product) {
      const response = createApiResponse('Product not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // Check if user owns this product
    if (product.userId !== auth.userId) {
      const response = createApiResponse('Access denied', 403);
      return NextResponse.json(response, { status: 403 });
    }

    await Product.findByIdAndDelete(id);

    const response = createApiResponse('Product deleted successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
