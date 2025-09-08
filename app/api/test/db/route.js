import dbConnect from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();
  const results = {
    environment: {},
    connection: {},
    operations: {},
    performance: {}
  };
  
  try {
    console.log('🧪 Starting comprehensive database test...');
    
    // Test 0: Environment check
    console.log('🌍 Testing environment configuration...');
    results.environment = {
      mongoUriConfigured: !!process.env.MONGODB_URI,
      mongoUriLength: process.env.MONGODB_URI?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not configured');
    }
    
    // Test 1: Database connection with retry
    console.log('📡 Testing database connection...');
    const connectionStartTime = Date.now();
    await dbConnect();
    const connectionTime = Date.now() - connectionStartTime;
    
    results.connection = {
      time: connectionTime,
      status: 'success',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
    
    console.log(`✅ Connection established in ${connectionTime}ms`);
    
    // Test 2: Database ping
    console.log('🏓 Testing database ping...');
    const pingStartTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - pingStartTime;
    
    results.operations.ping = {
      time: pingTime,
      status: 'success'
    };
    
    // Test 3: Collections check
    console.log('📁 Testing collections access...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    results.operations.collections = {
      count: collections.length,
      names: collections.map(c => c.name),
      hasUsers: collections.some(c => c.name === 'users'),
      hasProducts: collections.some(c => c.name === 'products'),
      hasOrders: collections.some(c => c.name === 'orders')
    };
    
    // Test 4: User count query
    console.log('📊 Testing user count query...');
    const userQueryStartTime = Date.now();
    const userCount = await User.countDocuments().maxTimeMS(10000);
    const userQueryTime = Date.now() - userQueryStartTime;
    
    results.operations.userQuery = {
      time: userQueryTime,
      userCount: userCount,
      status: 'success'
    };
    
    console.log(`✅ User query completed in ${userQueryTime}ms, found ${userCount} users`);
    
    // Test 5: Admin user lookup
    console.log('👤 Testing admin user lookup...');
    const adminStartTime = Date.now();
    const adminUser = await User.findOne({ 
      email: 'hanzalakhan0912@gmail.com' 
    }).maxTimeMS(10000);
    const adminTime = Date.now() - adminStartTime;
    
    results.operations.adminLookup = {
      time: adminTime,
      found: !!adminUser,
      user: adminUser ? {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        clerkUserId: adminUser.clerkUserId,
        isActive: adminUser.isActive
      } : null,
      status: 'success'
    };
    
    console.log(`✅ Admin lookup completed in ${adminTime}ms`);
    
    // Performance summary
    const totalTime = Date.now() - startTime;
    results.performance = {
      totalTime,
      connectionPercentage: Math.round((connectionTime / totalTime) * 100),
      queryPercentage: Math.round(((userQueryTime + adminTime) / totalTime) * 100),
      isHealthy: totalTime < 30000 && connectionTime < 10000
    };
    
    return NextResponse.json({
      success: true,
      message: 'All database tests passed successfully! ✅',
      results,
      recommendations: results.performance.isHealthy ? 
        ['Database is performing well', 'All operations completed quickly'] :
        ['Consider checking network connectivity', 'MongoDB cluster may be slow or paused']
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
      details: {
        name: error.name,
        code: error.code,
        codeName: error.codeName,
        totalTime
      },
      recommendations: [
        'Check MONGODB_URI environment variable',
        'Verify MongoDB Atlas cluster is running',
        'Check network connectivity',
        'Ensure database credentials are correct'
      ]
    }, { status: 500 });
  }
}
