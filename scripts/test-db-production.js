import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables for local testing
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testProductionDatabase() {
  console.log('🔍 Testing Production Database Connection...');
  console.log('============================================');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
  }

  console.log('✅ MONGODB_URI configured');
  console.log(`📡 Connecting to: ${MONGODB_URI.substring(0, 30)}...`);

  try {
    // Use the same connection options as production
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });

    console.log('✅ Connected successfully!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    
    // Test ping
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Test stats
    const stats = await db.stats();
    console.log(`✅ Database: ${stats.db}, Documents: ${stats.objects}`);
    
    // Test Product model specifically
    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      description: String,
      price: Number
    }), 'products');
    
    const productCount = await Product.countDocuments();
    console.log(`✅ Product collection has ${productCount} documents`);
    
    // Test a simple write operation (create and delete a test document)
    const testProduct = new Product({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99
    });
    
    await testProduct.save();
    console.log('✅ Test document created');
    
    await Product.findByIdAndDelete(testProduct._id);
    console.log('✅ Test document deleted');
    
    console.log('\n🎉 All database tests passed! Your production MongoDB connection is working.');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication Error Solutions:');
      console.log('1. Check your MongoDB username/password');
      console.log('2. Verify database user has proper permissions');
      console.log('3. Check if IP is whitelisted (0.0.0.0/0 for all IPs)');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network Error Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify cluster hostname is correct');
      console.log('3. Ensure cluster is not paused');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Timeout Error Solutions:');
      console.log('1. MongoDB Atlas cluster may be paused');
      console.log('2. Network connectivity issues');
      console.log('3. Increase timeout values');
    }
    
    process.exit(1);
    
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testProductionDatabase();
