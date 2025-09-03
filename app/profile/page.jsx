'use client'
import { useAppContext } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Loading from '@/components/Loading';

const Profile = () => {
  const { isSignedIn, userId } = useAuth();
  const { router } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user orders
        const ordersResponse = await fetch(`/api/users/${userId}/orders`);
        const ordersData = await ordersResponse.json();
        
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
        
        // Fetch user addresses
        const addressesResponse = await fetch(`/api/users/${userId}/addresses`);
        const addressesData = await addressesResponse.json();
        
        if (addressesData.success) {
          setAddresses(addressesData.addresses);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isSignedIn, userId, router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orders Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                <Link href="/all-products" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-md p-4 hover:border-orange-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Order #{order._id.substring(0, 8)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(order.date).toLocaleDateString()} • {order.products.length} items
                    </p>
                    <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Addresses Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">My Addresses</h2>
              <Link href="/add-address" className="text-orange-600 hover:text-orange-700">
                + Add New
              </Link>
            </div>
            
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't added any addresses yet</p>
                <Link href="/add-address" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
                  Add Address
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address._id} className="border rounded-md p-4 hover:border-orange-500 transition-colors">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{address.fullName}</h3>
                      {address.isDefault && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{address.phoneNumber}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.area}, {address.city}, {address.state}, {address.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Helper function to get status color
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default Profile;