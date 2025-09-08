'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function SimpleAdminPanel() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Sync user first
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST'
        });
        const syncData = await syncResponse.json();

        if (syncData.success && syncData.isAdmin) {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, isLoaded, router]);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const adminCards = [
    {
      title: 'Orders Management',
      description: 'View and manage all customer orders',
      icon: ShoppingBagIcon,
      href: '/admin/orders',
      color: 'blue'
    },
    {
      title: 'Products',
      description: 'Manage your product inventory',
      icon: CurrencyDollarIcon,
      href: '/admin/products',
      color: 'green'
    },
    {
      title: 'Users',
      description: 'Manage customer accounts',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'purple'
    },
    {
      title: 'Analytics',
      description: 'View sales and performance data',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'orange'
    },
    {
      title: 'Settings',
      description: 'Configure site settings',
      icon: Cog6ToothIcon,
      href: '/admin/settings',
      color: 'gray'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-600">Welcome, {user?.fullName || user?.firstName}!</p>
            </div>
            <Link 
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500"
              >
                <div className="flex items-center">
                  <card.icon className={`h-8 w-8 text-${card.color}-500 mr-4`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Products</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Users</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </div>
        </div>

        {/* Test Links */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Test & Debug</h3>
          <div className="space-y-2">
            <Link href="/admin-test" className="block text-blue-600 hover:underline">
              → Admin Access Test Page
            </Link>
            <Link href="/admin" className="block text-blue-600 hover:underline">
              → Full Admin Dashboard (with layout)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
