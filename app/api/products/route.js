import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import authAdmin from '@/lib/authAdmin';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    
    let query = {};
    
    // Apply category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Create sort options
    let sortOptions = {};
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else {
      // Default sort
      sortOptions = { date: -1 };
    }
    
    // Fetch products with filters and sorting
    const products = await Product.find(query).sort(sortOptions);
    
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create a new product (admin only)
export async function POST(request) {
  try {
    // Verify admin authorization
    const adminCheck = await authAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price', 'image'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create new product
    const newProduct = new Product({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      offerPrice: data.offerPrice || data.price,
      image: data.image,
      userId: data.userId, // This will be the admin's userId
    });
    
    await newProduct.save();
    
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}