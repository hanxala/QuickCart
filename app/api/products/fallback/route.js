import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Fallback products API that simulates product creation when database is unavailable
export async function POST(request) {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, offerPrice, image, category, stock } = body;

    // Basic validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, price, category' },
        { status: 400 }
      );
    }

    if (offerPrice && offerPrice > price) {
      return NextResponse.json(
        { success: false, error: 'Offer price cannot be greater than original price' },
        { status: 400 }
      );
    }

    // Create mock product response
    const mockProduct = {
      _id: 'mock_' + Date.now(),
      userId: userId,
      name,
      description,
      price: parseFloat(price),
      offerPrice: offerPrice ? parseFloat(offerPrice) : parseFloat(price),
      image: Array.isArray(image) ? image : [image],
      category,
      stock: stock ? parseInt(stock) : 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMockData: true
    };

    console.log('✅ Mock product created:', mockProduct.name);

    return NextResponse.json({
      success: true,
      data: mockProduct,
      message: 'Product created successfully (using fallback - database unavailable)'
    });

  } catch (error) {
    console.error('Fallback products API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
