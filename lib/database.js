import mongoose from 'mongoose';

const connection = {};

// Enhanced connection function with retry logic
async function dbConnect(retries = 3) {
  // If already connected and healthy, return
  if (connection.isConnected && mongoose.connection.readyState === 1) {
    try {
      // Test connection health
      await mongoose.connection.db.admin().ping();
      console.log('✅ Using existing healthy database connection');
      return;
    } catch (healthError) {
      console.log('⚠️ Existing connection unhealthy, reconnecting...');
      connection.isConnected = false;
    }
  }

  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🚀 MongoDB connection attempt ${attempt}/${retries}`);
      console.log('MONGODB_URI configured:', process.env.MONGODB_URI ? 'Yes' : 'No');
      
      // Disconnect any existing connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }

      const db = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 75000, // 75 seconds  
        connectTimeoutMS: 30000, // 30 seconds
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        bufferCommands: true, // Enable buffering for better reliability
        bufferMaxEntries: -1, // Unlimited buffering
      });

      // Verify connection
      await mongoose.connection.db.admin().ping();
      
      connection.isConnected = db.connections[0].readyState;
      console.log('✅ MongoDB connected successfully!');
      console.log('Database name:', db.connections[0].name);
      console.log('Connection state:', db.connections[0].readyState);
      console.log('Host:', db.connections[0].host);
      
      return; // Success, exit retry loop
      
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
      
      // Reset connection state
      connection.isConnected = false;
      
      if (attempt === retries) {
        // Last attempt failed
        console.error('❌ All connection attempts failed');
        
        // Provide specific error information
        if (error.message.includes('ENOTFOUND')) {
          throw new Error('Database host not found. Please check your MongoDB URI.');
        } else if (error.message.includes('authentication') || error.message.includes('auth')) {
          throw new Error('Database authentication failed. Please check your MongoDB credentials.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Database connection timeout. Your MongoDB cluster may be paused or unreachable.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error connecting to database. Please check your internet connection.');
        } else {
          throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
        }
      } else {
        // Wait before retry
        const waitTime = attempt * 2000; // 2s, 4s, 6s...
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

export default dbConnect;
