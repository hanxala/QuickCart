import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Test the upload API locally
async function testUploadAPI() {
  console.log('🔍 Testing Upload API...');
  console.log('========================');
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log(`📦 Created test image buffer: ${testImageBuffer.length} bytes`);

    // Create form data
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    console.log('📤 Sending request to upload API...');
    
    // Test against local dev server (make sure to run npm run dev first)
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let FormData set it with boundary
        ...formData.getHeaders()
      }
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log(`📊 Raw Response: ${responseText}`);

    try {
      const result = JSON.parse(responseText);
      console.log(`📊 Parsed Response:`, result);
      
      if (response.ok) {
        console.log('✅ Upload test successful!');
        if (result.data) {
          console.log('🖼️ Image URL:', result.data.url);
          console.log('🆔 Public ID:', result.data.public_id);
        }
      } else {
        console.log('❌ Upload test failed');
        console.log('Error details:', result);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
      console.log('Raw response was:', responseText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Full error:', error.stack);
  }
}

console.log('🚀 Make sure your dev server is running (npm run dev) before running this test');
console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...');

setTimeout(testUploadAPI, 3000);
