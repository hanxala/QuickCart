import { NextResponse } from 'next/server';
import cloudinary, { isConfigured, missingVars } from '@/lib/cloudinary';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

export async function POST(request) {
  console.log('📏 Starting image upload process...');
  
  try {
    // Check if Cloudinary is properly configured
    if (!isConfigured) {
      console.log('⚠️ Cloudinary not configured, using placeholder image');
      console.log('Missing environment variables:', missingVars);
      
      // Return placeholder image URL instead of error
      const response = createApiResponse({
        url: 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Product+Image',
        public_id: 'placeholder_' + Date.now(),
        isPlaceholder: true,
        message: 'Cloudinary not configured, using placeholder image'
      });
      return NextResponse.json(response, { status: 200 });
    }

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
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${file.size} bytes (max: ${maxSize} bytes)`);
      const response = createApiResponse('File too large. Maximum size is 10MB.', 400);
      return NextResponse.json(response, { status: 400 });
    }

    console.log('🔄 Converting file to buffer...');
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`✅ Buffer created: ${buffer.length} bytes`);

    console.log('☁️ Uploading to Cloudinary...');
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'quickcart-products',
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 900, crop: 'limit' },
            { quality: 'auto:good', fetch_format: 'auto' }
          ],
          tags: ['quickcart', 'product'],
          timeout: 60000 // 60 second timeout
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(new Error(`Upload failed: ${error.message || error.toString()}`));
          } else {
            console.log('✅ Cloudinary upload successful:', result.public_id);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    console.log('✅ Upload completed successfully!');
    const response = createApiResponse({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    });

    console.log('🚀 Returning successful response');
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Upload process failed:', error);
    console.error('Error stack:', error.stack);
    
    // Create detailed error response
    const errorMessage = error.message || 'Unknown upload error';
    const errorResponse = createApiResponse(
      `Image upload failed: ${errorMessage}`,
      500
    );
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE - Remove image from Cloudinary
export async function DELETE(request) {
  try {
    // Check if Cloudinary is properly configured
    if (!isConfigured) {
      const errorMessage = `Cloudinary is not properly configured. Missing environment variables: ${missingVars.join(', ')}`;
      const response = createApiResponse(errorMessage, 500);
      return NextResponse.json(response, { status: 500 });
    }

    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      const response = createApiResponse('Public ID is required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);

    const response = createApiResponse('Image deleted successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
