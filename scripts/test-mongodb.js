import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...');
  console.log('=====================================');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('Please check your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ MONGODB_URI found');
  console.log('URI length:', MONGODB_URI.length);
  console.log('URI starts with:', MONGODB_URI.substring(0, 20) + '...');
  
  try {
    console.log('\n📡 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database operations
    console.log('\n🔍 Testing database operations...');
    
    // Ping test
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Collections found:', collections.length);
    console.log('Collection names:', collections.map(c => c.name).join(', '));
    
    // Test simple query
    const stats = await mongoose.connection.db.stats();
    console.log('✅ Database stats retrieved');
    console.log('Database name:', stats.db);
    console.log('Collections:', stats.collections);
    console.log('Documents:', stats.objects);
    
    console.log('\n🎉 All tests passed! Your MongoDB connection is working properly.');
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting suggestions:');
      console.log('1. Check if your MongoDB URI hostname is correct');
      console.log('2. Verify your internet connection');
      console.log('3. Check if MongoDB Atlas cluster is running');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication issue:');
      console.log('1. Check your MongoDB username and password');
      console.log('2. Verify database user permissions');
      console.log('3. Check if IP address is whitelisted');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Connection timeout:');
      console.log('1. Your MongoDB cluster might be paused');
      console.log('2. Check network connectivity');
      console.log('3. Try increasing timeout values');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testConnection();
