'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function UserProfileDropdown() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Sync user and check admin status
    const syncAndCheckAdmin = async () => {
      try {
        console.log('🔍 Starting admin check for user:', user?.emailAddresses[0]?.emailAddress);
        
        // First sync the user to ensure they exist in database
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST'
        });
        const syncData = await syncResponse.json();
        
        console.log('📦 Sync response:', syncData);
        
        if (syncData.success) {
          console.log('✅ Sync successful, isAdmin:', syncData.isAdmin);
          setIsAdmin(syncData.isAdmin || false);
        } else {
          console.log('⚠️ Sync failed, trying direct admin check');
          // Fallback to direct admin check
          const checkResponse = await fetch('/api/admin/check-access');
          const checkData = await checkResponse.json();
          console.log('🔍 Direct admin check response:', checkData);
          setIsAdmin(checkData.isAdmin || false);
        }
      } catch (error) {
        console.error('❌ Error syncing user or checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      syncAndCheckAdmin();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleSignOut = () => {
    signOut(() => router.push('/'));
  };

  const handleAdminPanel = () => {
    router.push('/admin');
    setIsOpen(false);
  };

  const handleProfile = () => {
    openUserProfile();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleProfile}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <UserIcon className="w-4 h-4 mr-3" />
              Manage Profile
            </button>

            {/* Debug info - remove this after testing */}
            <div className="px-4 py-1 text-xs text-gray-400 bg-gray-50">
              Debug: loading={loading.toString()}, isAdmin={isAdmin.toString()}
            </div>

            {!loading && isAdmin && (
              <button
                onClick={handleAdminPanel}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-3" />
                Admin Panel
              </button>
            )}

            {/* Temporary always show admin - for debugging */}
            <button
              onClick={handleAdminPanel}
              className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4 mr-3" />
              Admin Panel (Debug)
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
