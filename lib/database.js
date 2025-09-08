import mongoose from 'mongoose';

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully to database:', db.connections[0].name);
  } catch (error) {
    console.log('Database connection error:', error.message);
    console.log('Connection string being used:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export default dbConnect;
