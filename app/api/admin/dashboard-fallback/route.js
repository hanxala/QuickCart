import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Fallback dashboard that returns mock data when database is unavailable
export async function GET() {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return mock dashboard data
    const mockDashboardData = {
      stats: {
        products: {
          total: 25,
          active: 23,
          lowStock: 3,
          growth: 5.2
        },
        users: {
          total: 150,
          newToday: 8,
          growth: 12.5
        },
        orders: {
          total: 342,
          today: 12,
          thisWeek: 78,
          thisMonth: 234,
          pending: 5,
          growthDaily: 15.3,
          growthWeekly: 8.7
        },
        revenue: {
          total: 125000,
          today: 3500,
          thisWeek: 18000,
          thisMonth: 45000,
          growthDaily: 22.1,
          growthWeekly: 15.8
        }
      },
      recentOrders: [
        {
          _id: "mock1",
          customerName: "John Doe",
          items: 3,
          amount: 1250,
          status: "Order Placed",
          createdAt: new Date().toISOString(),
          paymentMethod: "card"
        },
        {
          _id: "mock2", 
          customerName: "Jane Smith",
          items: 1,
          amount: 850,
          status: "Processing",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          paymentMethod: "upi"
        },
        {
          _id: "mock3",
          customerName: "Mike Johnson",
          items: 2,
          amount: 2100,
          status: "Shipped",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          paymentMethod: "cod"
        }
      ],
      topProducts: [
        {
          name: "Wireless Headphones",
          category: "Electronics", 
          totalSold: 45,
          revenue: 22500,
          stock: 15
        },
        {
          name: "Running Shoes",
          category: "Sports",
          totalSold: 32,
          revenue: 16000,
          stock: 8
        },
        {
          name: "Coffee Maker",
          category: "Home",
          totalSold: 28,
          revenue: 14000,
          stock: 12
        }
      ],
      alerts: [
        {
          type: 'warning',
          title: 'Database Connection Issue',
          message: 'Using cached data. Database connectivity will be restored soon.',
          count: 1
        },
        {
          type: 'info',
          title: 'Mock Data Notice',
          message: 'Currently displaying sample data due to database connectivity issues.',
          count: 1
        }
      ],
      lastUpdated: new Date().toISOString(),
      isFallback: true
    };

    return NextResponse.json({
      success: true,
      data: mockDashboardData
    });
  } catch (error) {
    console.error('Fallback dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
