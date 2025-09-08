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
        
        // First sync the user to ensure they exist in database
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST'
        });
        const syncData = await syncResponse.json();
        
        console.log('📦 [Admin Layout] Sync response:', syncData);
        
        if (syncData.success && syncData.isAdmin) {
          console.log('✅ [Admin Layout] User is admin via sync');
          setIsAdmin(true);
        } else {
          // Fallback to direct admin check
          console.log('⚠️ [Admin Layout] Trying direct admin check');
          const response = await fetch('/api/admin/check-access');
          const data = await response.json();
          
          console.log('🔍 [Admin Layout] Direct admin check response:', data);
          
          if (!data.isAdmin) {
            console.log('❌ [Admin Layout] Access denied, redirecting to home');
            router.push('/');
            return;
          }
          
          console.log('✅ [Admin Layout] Admin access granted');
          setIsAdmin(true);
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
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:fixed lg:inset-y-16 lg:z-40">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-0">
            <AdminSidebar />
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <main className="overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
