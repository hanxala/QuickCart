import dbConnect from '@/lib/database';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// GET - Fetch live dashboard statistics
export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    // Check if user is admin
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user || user.role !== 'admin') {
      const response = createApiResponse('Admin access required', 403);
      return NextResponse.json(response, { status: 403 });
    }

    // Get current date for comparison
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all statistics in parallel
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalUsers,
      newUsersToday,
      totalOrders,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      totalRevenue,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      pendingOrders,
      recentOrders,
      topProducts
    ] = await Promise.all([
      // Product statistics
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      
      // User statistics
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      
      // Order statistics
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      
      // Revenue statistics
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      Order.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      Order.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Pending orders
      Order.countDocuments({ orderStatus: { $in: ['Order Placed', 'Processing'] } }),
      
      // Recent orders
      Order.find()
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { 
          _id: '$items.product', 
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ])
    ]);

    // Calculate growth percentages (comparing to previous period)
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(monthStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      ordersYesterday,
      ordersLastWeek,
      revenueYesterday,
      revenueLastWeek,
      usersLastWeek
    ] = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: yesterdayStart, $lt: todayStart } 
      }),
      Order.countDocuments({ 
        createdAt: { $gte: lastWeekStart, $lt: weekStart } 
      }),
      Order.aggregate([
        { $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastWeekStart, $lt: weekStart } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      User.countDocuments({ 
        createdAt: { $gte: lastWeekStart, $lt: weekStart } 
      })
    ]);

    // Calculate growth rates
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const dashboardData = {
      stats: {
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
          growth: 0 // Products don't have time-based growth in this context
        },
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          growth: calculateGrowth(newUsersToday, usersLastWeek)
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth,
          pending: pendingOrders,
          growthDaily: calculateGrowth(ordersToday, ordersYesterday),
          growthWeekly: calculateGrowth(ordersThisWeek, ordersLastWeek)
        },
        revenue: {
          total: Math.round(totalRevenue),
          today: Math.round(revenueToday),
          thisWeek: Math.round(revenueThisWeek),
          thisMonth: Math.round(revenueThisMonth),
          growthDaily: calculateGrowth(revenueToday, revenueYesterday),
          growthWeekly: calculateGrowth(revenueThisWeek, revenueLastWeek)
        }
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        customerName: order.address.fullName,
        items: order.items.length,
        amount: order.finalAmount,
        status: order.orderStatus,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod
      })),
      topProducts: topProducts.map(item => ({
        name: item.product.name,
        category: item.product.category,
        totalSold: item.totalSold,
        revenue: Math.round(item.totalRevenue),
        stock: item.product.stock
      })),
      alerts: [
        ...(lowStockProducts > 0 ? [{
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${lowStockProducts} products are running low on stock`,
          count: lowStockProducts
        }] : []),
        ...(pendingOrders > 0 ? [{
          type: 'info',
          title: 'Pending Orders',
          message: `${pendingOrders} orders need attention`,
          count: pendingOrders
        }] : [])
      ],
      lastUpdated: new Date().toISOString()
    };

    const response = createApiResponse(dashboardData);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
