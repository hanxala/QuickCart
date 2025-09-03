'use client'
import { useAppContext } from '@/context/AppContext';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Loading from '@/components/Loading';

export default function AdminLayout({ children }) {
  const { isSignedIn, userId, isAdmin, loading, router } = useAppContext();

  useEffect(() => {
    // Redirect if not signed in or not admin
    if (!loading && (!isSignedIn || !isAdmin)) {
      router.push('/');
    }
  }, [isSignedIn, isAdmin, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!isSignedIn || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <div className="w-64 bg-gray-100 p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-orange-600">Admin Dashboard</h2>
          <nav className="space-y-2">
            <Link href="/admin" className="block p-2 hover:bg-gray-200 rounded">
              Dashboard
            </Link>
            <Link href="/admin/products" className="block p-2 hover:bg-gray-200 rounded">
              Products
            </Link>
            <Link href="/admin/orders" className="block p-2 hover:bg-gray-200 rounded">
              Orders
            </Link>
            <Link href="/admin/users" className="block p-2 hover:bg-gray-200 rounded">
              Users
            </Link>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}