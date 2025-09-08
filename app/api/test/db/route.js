import dbConnect from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🧪 Starting database connection test...');
    
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const startTime = Date.now();
    await dbConnect();
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connection established in ${connectionTime}ms`);
    
    // Test 2: Simple query
    console.log('📊 Testing simple query...');
    const queryStartTime = Date.now();
    const userCount = await User.countDocuments();
    const queryTime = Date.now() - queryStartTime;
    console.log(`✅ Query completed in ${queryTime}ms, found ${userCount} users`);
    
    // Test 3: Find specific admin user
    console.log('👤 Testing admin user lookup...');
    const adminStartTime = Date.now();
    const adminUser = await User.findOne({ 
      email: 'hanzalakhan0912@gmail.com' 
    }).maxTimeMS(5000); // 5 second timeout
    const adminTime = Date.now() - adminStartTime;
    console.log(`✅ Admin lookup completed in ${adminTime}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test passed',
      results: {
        connection: {
          time: connectionTime,
          status: 'success'
        },
        query: {
          time: queryTime,
          userCount: userCount,
          status: 'success'
        },
        adminLookup: {
          time: adminTime,
          found: !!adminUser,
          user: adminUser ? {
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            clerkUserId: adminUser.clerkUserId
          } : null,
          status: 'success'
        }
      },
      totalTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        codeName: error.codeName,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
