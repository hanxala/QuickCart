import dbConnect from '@/lib/database';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// GET - Fetch all products
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    const response = createApiResponse({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const body = await request.json();
    const { name, description, price, offerPrice, image, category, stock } = body;

    // Validation
    if (!name || !description || !price || !offerPrice || !image || !category) {
      const response = createApiResponse('All required fields must be provided', 400);
      return NextResponse.json(response, { status: 400 });
    }

    if (offerPrice > price) {
      const response = createApiResponse('Offer price cannot be greater than original price', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const product = new Product({
      userId: auth.userId,
      name,
      description,
      price,
      offerPrice,
      image: Array.isArray(image) ? image : [image],
      category,
      stock: stock || 0
    });

    await product.save();

    const response = createApiResponse(product, 201);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
