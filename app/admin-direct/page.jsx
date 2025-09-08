'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function DirectAdminPanel() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 
                ({user?.emailAddresses[0]?.emailAddress})
              </p>
            </div>
            <Link 
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Admin Access Active</h3>
              <p className="text-sm text-green-700">You have successfully accessed the admin panel!</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
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
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-start">
                  <card.icon className={`h-8 w-8 text-${card.color}-500 mr-4 mt-1`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Test Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Development & Testing</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link 
                href="/admin-test" 
                className="block p-3 bg-white rounded border border-blue-200 hover:bg-blue-50 transition text-sm"
              >
                <div className="font-medium text-blue-900">Admin Access Test</div>
                <div className="text-blue-600">Debug authentication status</div>
              </Link>
              <Link 
                href="/admin" 
                className="block p-3 bg-white rounded border border-blue-200 hover:bg-blue-50 transition text-sm"
              >
                <div className="font-medium text-blue-900">Full Admin Dashboard</div>
                <div className="text-blue-600">Complete admin interface</div>
              </Link>
              <Link 
                href="/api/test/db" 
                className="block p-3 bg-white rounded border border-blue-200 hover:bg-blue-50 transition text-sm"
              >
                <div className="font-medium text-blue-900">Database Test</div>
                <div className="text-blue-600">Check DB connectivity</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Total Orders', 'Products', 'Users', 'Revenue'].map((stat) => (
              <div key={stat} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-600">{stat}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Statistics will be available once the database connection is restored
          </p>
        </div>
      </div>
    </div>
  );
}
