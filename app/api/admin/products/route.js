import { requireAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/database';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import notificationService from '@/lib/notificationService';

// GET - Admin fetch all products (including inactive)
export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await dbConnect();
    const products = await Product.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Admin create new product
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { user, userId } = adminCheck;
    await dbConnect();

    const body = await request.json();
    const { name, description, price, offerPrice, image, category, stock } = body;

    // Validation
    if (!name || !description || !price || !offerPrice || !image || !category) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (offerPrice > price) {
      return NextResponse.json(
        { error: 'Offer price cannot be greater than original price' },
        { status: 400 }
      );
    }

    const product = new Product({
      userId: userId,
      name,
      description,
      price,
      offerPrice,
      image: Array.isArray(image) ? image : [image],
      category,
      stock: stock || 0
    });

    await product.save();

    // Send real-time notification to admin dashboard
    try {
      await notificationService.notifyProductCreated(product);
    } catch (notifyError) {
      console.warn('Failed to send product creation notification:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Admin product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
