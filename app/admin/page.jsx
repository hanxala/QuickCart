'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      console.log('📡 Fetching dashboard data...');
      
      // Try main dashboard API first
      let response = await fetch('/api/admin/dashboard');
      let data = await response.json();
      
      if (data.success) {
        console.log('✅ Main dashboard API successful');
        setDashboardData(data.data);
        setLastUpdated(new Date(data.data.lastUpdated));
      } else {
        console.log('⚠️ Main dashboard API failed, trying fallback...');
        
        // Try fallback dashboard API
        response = await fetch('/api/admin/dashboard-fallback');
        data = await response.json();
        
        if (data.success) {
          console.log('✅ Fallback dashboard API successful');
          setDashboardData(data.data);
          setLastUpdated(new Date(data.data.lastUpdated));
          toast.success('Dashboard loaded with sample data');
        } else {
          throw new Error('Both dashboard APIs failed');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
      
      // Set minimal fallback data directly
      setDashboardData({
        stats: {
          products: { total: 0, active: 0, lowStock: 0, growth: 0 },
          users: { total: 0, newToday: 0, growth: 0 },
          orders: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, pending: 0, growthDaily: 0, growthWeekly: 0 },
          revenue: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, growthDaily: 0, growthWeekly: 0 }
        },
        recentOrders: [],
        topProducts: [],
        alerts: [{
          type: 'warning',
          title: 'Dashboard Unavailable',
          message: 'Unable to load dashboard data. Please try again later.'
        }],
        lastUpdated: new Date().toISOString()
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading || !dashboardData) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Products',
      value: dashboardData.stats.products.total,
      subValue: `${dashboardData.stats.products.lowStock} low stock`,
      icon: ShoppingBagIcon,
      change: dashboardData.stats.products.growth,
      changeType: dashboardData.stats.products.growth >= 0 ? 'increase' : 'decrease',
      color: 'blue'
    },
    {
      name: 'Total Users',
      value: dashboardData.stats.users.total,
      subValue: `${dashboardData.stats.users.newToday} new today`,
      icon: UserGroupIcon,
      change: dashboardData.stats.users.growth,
      changeType: dashboardData.stats.users.growth >= 0 ? 'increase' : 'decrease',
      color: 'green'
    },
    {
      name: 'Total Orders',
      value: dashboardData.stats.orders.total,
      subValue: `${dashboardData.stats.orders.today} today`,
      icon: CurrencyDollarIcon,
      change: dashboardData.stats.orders.growthWeekly,
      changeType: dashboardData.stats.orders.growthWeekly >= 0 ? 'increase' : 'decrease',
      color: 'purple'
    },
    {
      name: 'Revenue',
      value: formatCurrency(dashboardData.stats.revenue.total),
      subValue: `${formatCurrency(dashboardData.stats.revenue.today)} today`,
      icon: ChartBarIcon,
      change: dashboardData.stats.revenue.growthWeekly,
      changeType: dashboardData.stats.revenue.growthWeekly >= 0 ? 'increase' : 'decrease',
      color: 'orange'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time view of your Hanzala.co store performance
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last updated: {lastUpdated ? formatTimeAgo(lastUpdated) : 'Loading...'}
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.alerts && dashboardData.alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {dashboardData.alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 text-${stat.color}-500`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    <dd className="text-xs text-gray-400 mt-1">{stat.subValue}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="flex items-center text-sm">
                {stat.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-gray-500 ml-1">vs last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-0">
            {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {dashboardData.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items} items • {formatCurrency(order.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'Order Placed' 
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          </div>
          <div className="p-0">
            {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {dashboardData.topProducts.map((product, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category} • Stock: {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {product.totalSold} sold
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.stats.orders.pending}
              </p>
              <p className="text-sm text-gray-500">Pending Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.stats.revenue.thisWeek)}
              </p>
              <p className="text-sm text-gray-500">This Week Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(dashboardData.stats.revenue.thisMonth)}
              </p>
              <p className="text-sm text-gray-500">This Month Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
