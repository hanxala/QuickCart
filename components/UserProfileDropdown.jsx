'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function UserProfileDropdown() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const { theme } = useTheme();
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
          console.log('⚠️ Sync failed, trying fallback admin check');
          // Fallback to email-based admin check (doesn't require database)
          const fallbackResponse = await fetch('/api/admin/check-fallback');
          const fallbackData = await fallbackResponse.json();
          console.log('🔍 Fallback admin check response:', fallbackData);
          setIsAdmin(fallbackData.isAdmin || false);
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
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          )}
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleProfile}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <UserIcon className="w-4 h-4 mr-3" />
              Manage Profile
            </button>

            {!loading && isAdmin && (
              <button
                onClick={handleAdminPanel}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-3" />
                Admin Panel
              </button>
            )}

            {/* Debug option - can be removed later */}
            {loading && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 dark:border-gray-500 mr-2"></div>
                  Checking admin access...
                </div>
              </div>
            )}

            {/* Theme Toggle Section */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {theme} mode
                  </span>
                </div>
                <ThemeToggle size="small" className="ml-3" />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
