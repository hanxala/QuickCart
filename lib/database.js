import mongoose from 'mongoose';

// Connection state management
let isConnecting = false;
let connectionPromise = null;

// Enhanced connection function with better concurrency handling
async function dbConnect() {
  // If already connected and healthy, return immediately
  if (mongoose.connection.readyState === 1) {
    try {
      // Quick health check
      await mongoose.connection.db.admin().ping();
      console.log('✅ Using existing healthy database connection');
      return;
    } catch (healthError) {
      console.log('⚠️ Existing connection unhealthy, will reconnect...');
    }
  }

  // If already connecting, wait for the existing connection attempt
  if (isConnecting && connectionPromise) {
    console.log('⏳ Connection already in progress, waiting...');
    return connectionPromise;
  }

  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  // Start connection process
  isConnecting = true;
  connectionPromise = connectWithRetry();

  try {
    await connectionPromise;
  } finally {
    isConnecting = false;
    connectionPromise = null;
  }
}

// Internal connection function with retry logic
async function connectWithRetry(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🚀 MongoDB connection attempt ${attempt}/${retries}`);
      
      // Only disconnect if we're not already in a connecting state
      if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 2) {
        console.log('🔄 Cleaning up existing connection...');
        await mongoose.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500)); // Short wait
      }

      // Connect with optimized options
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000, // Reduced to 15 seconds
        socketTimeoutMS: 45000, // Reduced to 45 seconds  
        connectTimeoutMS: 15000, // Reduced to 15 seconds
        maxPoolSize: 5, // Reduced pool size for better resource management
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        bufferCommands: false, // Disable buffering to fail fast
      });

      // Verify connection with timeout
      const pingPromise = mongoose.connection.db.admin().ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection verification timeout')), 5000)
      );
      
      await Promise.race([pingPromise, timeoutPromise]);
      
      console.log('✅ MongoDB connected successfully!');
      console.log('Database name:', mongoose.connection.name || 'default');
      console.log('Connection state:', mongoose.connection.readyState);
      console.log('Host:', mongoose.connection.host);
      
      return; // Success, exit retry loop
      
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        // Last attempt failed
        console.error('❌ All connection attempts failed');
        
        // Provide specific error information
        if (error.message.includes('ENOTFOUND')) {
          throw new Error('Database host not found. Please check your MongoDB URI.');
        } else if (error.message.includes('authentication') || error.message.includes('auth')) {
          throw new Error('Database authentication failed. Please check your MongoDB credentials.');
        } else if (error.message.includes('timeout') || error.message.includes('Connection verification timeout')) {
          throw new Error('Database connection timeout. Your MongoDB cluster may be paused or unreachable.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error connecting to database. Please check your internet connection.');
        } else {
          throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
        }
      } else {
        // Wait before retry with exponential backoff
        const waitTime = Math.min(attempt * 1000, 5000); // 1s, 2s, 3s... max 5s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

export default dbConnect;
