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
        const response = await fetch('/api/admin/check-access');
        const data = await response.json();
        
        if (!data.isAdmin) {
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        console.error('Response status:', error.status);
        console.error('Response data:', error.message);
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
    <div className="h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex h-full pt-16">
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          {/* Spacer for fixed sidebar */}
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
