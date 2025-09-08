import { NextResponse } from 'next/server';
import cloudinary, { isConfigured, missingVars } from '@/lib/cloudinary';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

export async function POST(request) {
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

    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      const response = createApiResponse('No file uploaded', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'quickcart-products',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const response = createApiResponse({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
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
