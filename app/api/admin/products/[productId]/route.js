import { requireAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/database';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET - Admin get single product
export async function GET(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { productId } = await params;
    await dbConnect();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Admin get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Admin update product
export async function PUT(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { productId } = await params;
    await dbConnect();

    const body = await request.json();
    const { name, description, price, offerPrice, image, category, stock, isActive } = body;

    // Validation
    if (offerPrice && price && offerPrice > price) {
      return NextResponse.json(
        { error: 'Offer price cannot be greater than original price' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (offerPrice !== undefined) updateData.offerPrice = offerPrice;
    if (image !== undefined) updateData.image = Array.isArray(image) ? image : [image];
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Admin update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Admin delete product
export async function DELETE(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { productId } = await params;
    await dbConnect();

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
