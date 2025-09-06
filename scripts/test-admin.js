// Test script to verify admin API endpoints
console.log('Testing Admin Functionality...\n');

// Test 1: Check if admin products endpoint is accessible
async function testAdminEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test GET admin products (should require authentication)
    console.log('1. Testing GET /api/admin/products...');
    const getResponse = await fetch(`${baseUrl}/api/admin/products`);
    console.log(`   Status: ${getResponse.status}`);
    const getData = await getResponse.text();
    console.log(`   Response: ${getData.substring(0, 100)}...`);
    
    // Test check-access endpoint
    console.log('\n2. Testing GET /api/admin/check-access...');
    const checkResponse = await fetch(`${baseUrl}/api/admin/check-access`);
    console.log(`   Status: ${checkResponse.status}`);
    const checkData = await checkResponse.text();
    console.log(`   Response: ${checkData}`);
    
  } catch (error) {
    console.error('Error testing endpoints:', error.message);
  }
}

testAdminEndpoints();
