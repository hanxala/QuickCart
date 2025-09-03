'use client'
import { useAppContext } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isAdmin } = useAppContext();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // In a real app, you would fetch these stats from your API
    const fetchStats = async () => {
      try {
        // For now, we'll use dummy data
        // In a real implementation, you would fetch this data from your API
        setStats({
          totalProducts: 24,
          totalOrders: 18,
          pendingOrders: 5,
          totalUsers: 12
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={stats.totalProducts} link="/admin/products" color="bg-blue-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} link="/admin/orders" color="bg-green-500" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} link="/admin/orders" color="bg-yellow-500" />
        <StatCard title="Total Users" value={stats.totalUsers} link="/admin/users" color="bg-purple-500" />
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/products/add" className="bg-orange-600 text-white p-4 rounded shadow hover:bg-orange-700 text-center">
            Add New Product
          </Link>
          <Link href="/admin/orders" className="bg-gray-700 text-white p-4 rounded shadow hover:bg-gray-800 text-center">
            View Recent Orders
          </Link>
          <Link href="/admin/products" className="bg-blue-600 text-white p-4 rounded shadow hover:bg-blue-700 text-center">
            Manage Products
          </Link>
        </div>
      </div>
      
      {/* Recent Activity - Placeholder */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 italic">Recent activity will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, link, color }) {
  return (
    <Link href={link} className="block">
      <div className={`${color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </Link>
  );
}