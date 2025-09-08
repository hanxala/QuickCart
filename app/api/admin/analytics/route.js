import dbConnect from '@/lib/database';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    // Check if user is admin
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/check-access`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || ''
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(createApiResponse('Unauthorized', 403), { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '7d'; // 7d, 30d, 90d, 1y
    
    const now = new Date();
    let startDate = new Date();
    
    // Calculate start date based on time range
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch analytics data in parallel
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      salesTrends,
      topProducts,
      userGrowth,
      orderStatusDistribution,
      paymentMethodStats
    ] = await Promise.all([
      // Total orders in time range
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Total revenue in time range
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      
      // Total users in time range
      User.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Total products
      Product.countDocuments({ isActive: true }),
      
      // Recent orders with details
      Order.find({ createdAt: { $gte: startDate } })
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Sales trends (daily data)
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$finalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Top selling products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            name: '$product.name',
            category: '$product.category',
            totalSold: 1,
            revenue: 1
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]),
      
      // User growth over time
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Order status distribution
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Payment method statistics
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            revenue: { $sum: '$finalAmount' }
          }
        }
      ])
    ]);

    // Calculate previous period for comparison
    const previousStartDate = new Date(startDate);
    const timeDiff = now.getTime() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - timeDiff);

    const [previousRevenue, previousOrders, previousUsers] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } }),
      User.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } })
    ]);

    // Calculate growth percentages
    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    const orderGrowth = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
    const userGrowthPercent = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0;

    // Get low stock products
    const lowStockProducts = await Product.find({ 
      stock: { $lte: 10 }, 
      isActive: true 
    }).select('name stock').limit(10);

    const analyticsData = {
      timeRange,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      overview: {
        totalOrders,
        totalRevenue: currentRevenue,
        totalUsers,
        totalProducts,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        userGrowth: Math.round(userGrowthPercent * 100) / 100
      },
      charts: {
        salesTrends: salesTrends.map(item => ({
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          orders: item.orders,
          revenue: item.revenue
        })),
        userGrowth: userGrowth.map(item => ({
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          newUsers: item.newUsers
        })),
        orderStatus: orderStatusDistribution,
        paymentMethods: paymentMethodStats
      },
      topProducts,
      recentOrders: recentOrders.slice(0, 5).map(order => ({
        _id: order._id,
        customerName: order.address.fullName,
        items: order.items.length,
        amount: order.finalAmount,
        status: order.orderStatus,
        createdAt: order.createdAt
      })),
      lowStockProducts,
      alerts: [
        ...(lowStockProducts.length > 0 ? [{
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${lowStockProducts.length} products are running low on stock`,
          count: lowStockProducts.length
        }] : []),
        ...(totalOrders > 0 && revenueGrowth < -10 ? [{
          type: 'error',
          title: 'Revenue Decline',
          message: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(1)}% compared to previous period`
        }] : [])
      ]
    };

    return NextResponse.json(createApiResponse(analyticsData), { status: 200 });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
