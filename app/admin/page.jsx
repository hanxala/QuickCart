'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Products',
    stat: '0',
    icon: ShoppingBagIcon,
    change: '12%',
    changeType: 'increase',
  },
  {
    name: 'Total Users',
    stat: '0',
    icon: UserGroupIcon,
    change: '2.02%',
    changeType: 'increase',
  },
  {
    name: 'Total Orders',
    stat: '0',
    icon: CurrencyDollarIcon,
    change: '4.05%',
    changeType: 'decrease',
  },
  {
    name: 'Revenue',
    stat: '$0',
    icon: ChartBarIcon,
    change: '1.39%',
    changeType: 'increase',
  },
];

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState(stats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/users')
        ]);

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();

        setDashboardStats(prevStats => 
          prevStats.map(stat => {
            if (stat.name === 'Total Products') {
              return { ...stat, stat: productsData.products?.length.toString() || '0' };
            }
            if (stat.name === 'Total Users') {
              return { ...stat, stat: usersData.users?.length.toString() || '0' };
            }
            return stat;
          })
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your Hanzala.co admin panel. Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{item.stat}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`font-medium ${
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.changeType === 'increase' ? '+' : '-'}{item.change}
                </span>
                <span className="text-gray-500"> from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">No recent activity to display.</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Add New Product
              </button>
              <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                View All Orders
              </button>
              <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
