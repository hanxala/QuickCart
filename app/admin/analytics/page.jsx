'use client';

import { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Simple Chart Components (using CSS-only charts for now)
const LineChart = ({ data, title, color = "blue" }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="h-64 relative">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const height = ((item.value - minValue) / range) * 180 + 20;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`bg-${color}-500 rounded-t w-full transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}px` }}
                title={`${item.label}: ${item.value.toLocaleString()}`}
              />
              <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

  return (
    <div className="h-64">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-between">
        <div className="w-40 h-40 rounded-full relative overflow-hidden">
          {/* Simple pie representation using gradients */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 opacity-80" />
        </div>
        <div className="flex-1 ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async (range = timeRange) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${range}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchAnalytics(range);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Unable to load analytics data at this time.</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(data.overview.totalRevenue),
      change: data.overview.revenueGrowth,
      changeType: data.overview.revenueGrowth >= 0 ? 'increase' : 'decrease',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      name: 'Total Orders',
      value: data.overview.totalOrders.toLocaleString(),
      change: data.overview.orderGrowth,
      changeType: data.overview.orderGrowth >= 0 ? 'increase' : 'decrease',
      icon: ShoppingBagIcon,
      color: 'blue'
    },
    {
      name: 'New Users',
      value: data.overview.totalUsers.toLocaleString(),
      change: data.overview.userGrowth,
      changeType: data.overview.userGrowth >= 0 ? 'increase' : 'decrease',
      icon: UserGroupIcon,
      color: 'purple'
    },
    {
      name: 'Active Products',
      value: data.overview.totalProducts.toLocaleString(),
      change: 0,
      changeType: 'neutral',
      icon: ShoppingBagIcon,
      color: 'orange'
    }
  ];

  // Prepare chart data
  const salesTrendsData = data.charts.salesTrends.map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.revenue
  }));

  const orderStatusData = data.charts.orderStatus.map(item => ({
    label: item._id,
    value: item.count
  }));

  const paymentMethodData = data.charts.paymentMethods.map(item => ({
    label: item._id.toUpperCase(),
    value: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive insights into your store's performance
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last updated: {formatTimeAgo(lastUpdated)}
          </div>
          <button 
            onClick={() => fetchAnalytics()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 py-1 text-sm rounded-md transition ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
              {range === '90d' && 'Last 90 Days'}
              {range === '1y' && 'Last Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  : 'bg-red-50 border-red-400 text-red-800'
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  </dl>
                </div>
              </div>
            </div>
            {stat.changeType !== 'neutral' && (
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
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <LineChart 
            data={salesTrendsData}
            title="Revenue Trends" 
            color="green"
          />
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <PieChart 
            data={orderStatusData}
            title="Order Status Distribution" 
          />
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow">
          <PieChart 
            data={paymentMethodData}
            title="Payment Methods" 
          />
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {data.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.totalSold} sold</p>
                  <p className="text-xs text-gray-500">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.recentOrders.map((order) => (
              <div key={order._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {order.items} items • {formatCurrency(order.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(order.createdAt)}
                    </p>
                  </div>
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
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((product) => (
                <div key={product._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock === 0 
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>All products have sufficient stock</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
