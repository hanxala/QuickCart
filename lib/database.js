import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Only throw error at runtime, not during build
if (!MONGODB_URI && typeof window === 'undefined') {
  console.error('❌ MONGODB_URI environment variable is not configured');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Runtime check for MongoDB URI
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not configured. Please check your deployment settings.');
  }
  
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 75000, // 75 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    };

    console.log('🚀 Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully!');
      console.log('Database:', mongoose.connection.name);
      console.log('Host:', mongoose.connection.host);
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error);
      cached.promise = null; // Reset promise on error
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to establish MongoDB connection:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
