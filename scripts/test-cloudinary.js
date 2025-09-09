import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCloudinaryConfiguration() {
  console.log('🔍 Testing Cloudinary Configuration...');
  console.log('======================================');
  
  // Check environment variables
  const requiredVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
  };
  
  console.log('📋 Environment Variables Check:');
  let allConfigured = true;
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${key}: Not set`);
      allConfigured = false;
    }
  });
  
  if (!allConfigured) {
    console.log('\n❌ Cloudinary is not properly configured');
    console.log('Please check your .env.local file');
    return;
  }
  
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  try {
    console.log('\n🔗 Testing Cloudinary API connection...');
    
    // Test API connection by getting account details
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API connection successful!');
    console.log('Response:', result);
    
    // Test upload capabilities (we'll create a small test buffer)
    console.log('\n📤 Testing upload functionality...');
    
    // Create a simple test image buffer (1x1 pixel PNG)
    const testBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'quickcart-test',
          resource_type: 'auto',
          public_id: 'test_upload_' + Date.now()
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(testBuffer);
    });
    
    console.log('✅ Test upload successful!');
    console.log('Upload URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);
    
    // Clean up test image
    console.log('\n🧹 Cleaning up test image...');
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Test image deleted');
    
    console.log('\n🎉 All Cloudinary tests passed! Your configuration is working properly.');
    
  } catch (error) {
    console.error('\n❌ Cloudinary test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.http_code === 401) {
      console.log('\n💡 Authentication Error Solutions:');
      console.log('1. Check your API key and secret are correct');
      console.log('2. Verify your cloud name matches your Cloudinary account');
    } else if (error.http_code === 403) {
      console.log('\n💡 Permission Error Solutions:');
      console.log('1. Check your Cloudinary account limits');
      console.log('2. Verify upload permissions are enabled');
    }
  }
}

testCloudinaryConfiguration();
