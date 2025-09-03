import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import authAdmin from '@/lib/authAdmin';

// GET a single product by ID
export async function GET(request, { params }) {
  try {
    const { productId } = params;
    await connectToDatabase();
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update a product (admin only)
export async function PUT(request, { params }) {
  try {
    // Verify admin authorization
    const adminCheck = await authAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const { productId } = params;
    await connectToDatabase();
    
    const data = await request.json();
    
    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        offerPrice: data.offerPrice || data.price,
        image: data.image,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE a product (admin only)
export async function DELETE(request, { params }) {
  try {
    // Verify admin authorization
    const adminCheck = await authAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const { productId } = params;
    await connectToDatabase();
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}