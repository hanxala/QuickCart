import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { auth } from '@clerk/nextjs/server';
import { adminMiddleware } from '@/middleware/admin';
import Banner from '@/models/Banner';

// Default banner data for fallback
const DEFAULT_BANNER = {
  title: "Level Up Your Gaming Experience",
  subtitle: "From immersive sound to precise controls—everything you need to win",
  buttonText: "Buy now",
  category: "gaming",
  searchTerm: "gaming",
  isActive: true,
  order: 1,
  featuredProducts: [],
  backgroundColor: "gradient-dark",
  textColor: "auto"
};

// GET - Fetch all banners
export async function GET() {
  try {
    console.log('🔍 Fetching banners...');
    
    await dbConnect();
    
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    
    // If no banners exist, return default banner
    if (!banners || banners.length === 0) {
      console.log('📝 No banners found, returning default banner');
      return NextResponse.json({
        success: true,
        banners: [DEFAULT_BANNER],
        message: 'Default banner returned'
      });
    }
    
    console.log(`✅ Found ${banners.length} banners`);
    return NextResponse.json({
      success: true,
      banners,
      message: 'Banners fetched successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching banners:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch banners',
      banners: [DEFAULT_BANNER] // Fallback
    }, { status: 500 });
  }
}

// POST - Create new banner (Admin only)
export async function POST(request) {
  try {
    const { userId } = auth();
    
    // Check admin access
    const adminCheck = await adminMiddleware(userId);
    if (adminCheck.error) {
      return NextResponse.json({
        success: false,
        error: adminCheck.error
      }, { status: adminCheck.status });
    }
    
    console.log('🔍 Creating new banner...');
    
    const bannerData = await request.json();
    
    // Validate required fields
    const { title, subtitle, buttonText, category, searchTerm, featuredProducts, backgroundImage, backgroundColor, textColor } = bannerData;
    
    if (!title || !subtitle || !buttonText) {
      return NextResponse.json({
        success: false,
        error: 'Title, subtitle, and button text are required'
      }, { status: 400 });
    }
    
    // Validate featured products if provided
    if (featuredProducts && Array.isArray(featuredProducts) && featuredProducts.length > 3) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 3 featured products allowed'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Get the next order number
    const lastBanner = await Banner.findOne().sort({ order: -1 });
    const nextOrder = lastBanner ? lastBanner.order + 1 : 1;
    
    const newBanner = new Banner({
      title,
      subtitle,
      buttonText,
      category: category || 'general',
      searchTerm: searchTerm || '',
      featuredProducts: featuredProducts || [],
      backgroundImage: backgroundImage || null,
      backgroundColor: backgroundColor || 'gradient-dark',
      textColor: textColor || 'auto',
      isActive: bannerData.isActive !== false, // Default to true
      order: nextOrder
    });
    
    const result = await newBanner.save();
    
    console.log('✅ Banner created successfully');
    return NextResponse.json({
      success: true,
      banner: result,
      message: 'Banner created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating banner:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create banner'
    }, { status: 500 });
  }
}

// PUT - Update banner (Admin only)
export async function PUT(request) {
  try {
    const { userId } = auth();
    
    // Check admin access
    const adminCheck = await adminMiddleware(userId);
    if (adminCheck.error) {
      return NextResponse.json({
        success: false,
        error: adminCheck.error
      }, { status: adminCheck.status });
    }
    
    console.log('🔍 Updating banner...');
    
    const updateData = await request.json();
    const { id, ...bannerData } = updateData;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Banner ID is required'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    const result = await Banner.findByIdAndUpdate(
      id,
      bannerData,
      { new: true, runValidators: true }
    );
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Banner not found'
      }, { status: 404 });
    }
    
    console.log('✅ Banner updated successfully');
    return NextResponse.json({
      success: true,
      banner: result,
      message: 'Banner updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating banner:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update banner'
    }, { status: 500 });
  }
}

// DELETE - Delete banner (Admin only)
export async function DELETE(request) {
  try {
    const { userId } = auth();
    
    // Check admin access
    const adminCheck = await adminMiddleware(userId);
    if (adminCheck.error) {
      return NextResponse.json({
        success: false,
        error: adminCheck.error
      }, { status: adminCheck.status });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Banner ID is required'
      }, { status: 400 });
    }
    
    console.log('🔍 Deleting banner...');
    
    await dbConnect();
    
    const result = await Banner.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Banner not found'
      }, { status: 404 });
    }
    
    console.log('✅ Banner deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting banner:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete banner'
    }, { status: 500 });
  }
}
