'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import AdminNotifications from '../AdminNotifications';

export default function AdminHeader() {
  const { user } = useUser();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center">
          <div className="ml-4 lg:ml-0">
            <h2 className="text-lg font-semibold text-gray-900">Hanzala.co Admin</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <p className="text-sm text-gray-700">Welcome back, {user?.firstName || 'Admin'}</p>
          </div>
          
          {/* Live Notifications */}
          <AdminNotifications />
          
          <UserButton 
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8'
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
