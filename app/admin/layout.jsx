'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Loading from '@/components/Loading';

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        router.push('/sign-in');
        return;
      }

      try {
        console.log('🔍 [Admin Layout] Checking admin access for:', user.emailAddresses[0]?.emailAddress);
        
        // First try fallback admin check (doesn't require database)
        const fallbackResponse = await fetch('/api/admin/check-fallback');
        const fallbackData = await fallbackResponse.json();
        
        console.log('📦 [Admin Layout] Fallback response:', fallbackData);
        
        if (fallbackData.isAdmin) {
          console.log('✅ [Admin Layout] User is admin via fallback check');
          setIsAdmin(true);
        } else {
          console.log('⚠️ [Admin Layout] Fallback failed, trying sync');
          
          // Try sync as backup
          const syncResponse = await fetch('/api/auth/sync-user', {
            method: 'POST'
          });
          const syncData = await syncResponse.json();
          
          console.log('📦 [Admin Layout] Sync response:', syncData);
          
          if (syncData.success && syncData.isAdmin) {
            console.log('✅ [Admin Layout] User is admin via sync');
            setIsAdmin(true);
          } else {
            console.log('❌ [Admin Layout] Access denied, redirecting to home');
            router.push('/');
            return;
          }
        }
      } catch (error) {
        console.error('❌ [Admin Layout] Error checking admin access:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, isLoaded, router]);

  if (loading || !isLoaded) {
    return <Loading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 theme-transition">
      <AdminHeader />
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:fixed lg:inset-y-16 lg:z-40">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-0 theme-transition">
            <AdminSidebar />
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <main className="overflow-y-auto">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen theme-transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
