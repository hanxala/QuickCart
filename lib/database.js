import mongoose from 'mongoose';

const connection = {};

async function dbConnect() {
  // If already connected, return
  if (connection.isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGODB_URI configured:', process.env.MONGODB_URI ? 'Yes' : 'No');
    
    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 60000, // Increased socket timeout
      connectTimeoutMS: 15000, // Connection timeout
      maxPoolSize: 5, // Reduced pool size for better performance
      minPoolSize: 1,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 30000,
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected successfully to database:', db.connections[0].name);
    console.log('Connection state:', db.connections[0].readyState);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
    
    // Reset connection state
    connection.isConnected = false;
    
    // Try to provide more specific error information
    if (error.message.includes('ENOTFOUND')) {
      throw new Error('Database host not found. Check your MongoDB URI.');
    } else if (error.message.includes('authentication')) {
      throw new Error('Database authentication failed. Check your credentials.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Database connection timeout. The database may be sleeping or unreachable.');
    } else {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
}

export default dbConnect;
