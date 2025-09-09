import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Product from '@/models/Product';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    // Test simple query
    const productCount = await Product.countDocuments();
    console.log(`✅ Found ${productCount} products in database`);
    
    // Test database health
    const dbStats = await Product.db.db.stats();
    console.log('✅ Database stats retrieved');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test passed',
      data: {
        connected: true,
        productCount,
        databaseName: dbStats.db,
        collections: dbStats.collections,
        documents: dbStats.objects,
        mongodbUri: process.env.MONGODB_URI ? 'Configured' : 'Missing'
      }
    });

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      mongodbUri: process.env.MONGODB_URI ? 'Configured' : 'Missing'
    }, { status: 500 });
  }
}
