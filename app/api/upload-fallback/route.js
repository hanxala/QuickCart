import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// Simple fallback upload that converts images to base64 data URLs
export async function POST(request) {
  console.log('📏 Starting fallback upload process...');
  
  try {
    console.log('🔐 Checking authentication...');
    const auth = await authMiddleware(request);
    if (auth.error) {
      console.error('❌ Authentication failed:', auth.error);
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }
    console.log('✅ Authentication successful');

    console.log('📁 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.error('❌ No file found in form data');
      const response = createApiResponse('No file uploaded', 400);
      return NextResponse.json(response, { status: 400 });
    }
    
    console.log(`🖼️ File received: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      const response = createApiResponse('Invalid file type. Please upload an image file.', 400);
      return NextResponse.json(response, { status: 400 });
    }
    
    // Validate file size (5MB max for fallback)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${file.size} bytes (max: ${maxSize} bytes)`);
      const response = createApiResponse('File too large. Maximum size is 5MB for fallback upload.', 400);
      return NextResponse.json(response, { status: 400 });
    }

    console.log('🔄 Converting file to base64...');
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64 data URL
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    console.log(`✅ Fallback upload completed! Data URL length: ${dataUrl.length} characters`);
    
    // Create a mock response similar to Cloudinary
    const response = createApiResponse({
      url: dataUrl,
      public_id: `fallback_${Date.now()}`,
      width: null, // We'd need image processing to get this
      height: null,
      format: file.type.split('/')[1],
      bytes: file.size,
      isFallback: true,
      message: 'Image uploaded using fallback method (base64). This is temporary - please configure Cloudinary for production.'
    });

    console.log('🚀 Returning successful fallback response');
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Fallback upload process failed:', error);
    console.error('Error stack:', error.stack);
    
    const errorMessage = error.message || 'Unknown fallback upload error';
    const errorResponse = createApiResponse(
      `Fallback upload failed: ${errorMessage}`,
      500
    );
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
