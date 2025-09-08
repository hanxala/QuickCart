'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminTestPage() {
  const { user } = useUser();
  const [adminStatus, setAdminStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAdminAccess = async () => {
      if (!user) {
        setAdminStatus({ error: 'Not signed in' });
        setLoading(false);
        return;
      }

      try {
        // Test sync API
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST'
        });
        const syncData = await syncResponse.json();

        // Test admin check API
        const checkResponse = await fetch('/api/admin/check-access');
        const checkData = await checkResponse.json();

        // Test debug API
        const debugResponse = await fetch('/api/debug/user');
        const debugData = await debugResponse.json();

        setAdminStatus({
          user: user.emailAddresses[0]?.emailAddress,
          sync: syncData,
          check: checkData,
          debug: debugData
        });
      } catch (error) {
        setAdminStatus({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    testAdminAccess();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Testing admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Access Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(adminStatus, null, 2)}
          </pre>
          
          {adminStatus && (adminStatus.sync?.isAdmin || adminStatus.check?.isAdmin || adminStatus.debug?.isAdmin) && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <p className="text-green-800 font-semibold">✅ Admin Access Confirmed!</p>
                <p className="text-green-600">You have admin privileges.</p>
              </div>
              
              <div className="space-y-2">
                <Link 
                  href="/admin" 
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded hover:bg-blue-700 transition"
                >
                  Try Main Admin Panel
                </Link>
                <Link 
                  href="/admin-simple" 
                  className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded hover:bg-green-700 transition"
                >
                  Try Simple Admin Panel
                </Link>
              </div>
            </div>
          )}
          
          {adminStatus?.error && (
            <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-red-800 font-semibold">❌ Error:</p>
              <p className="text-red-600">{adminStatus.error}</p>
            </div>
          )}
          
          <div className="mt-6">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
