'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (paymentIntentId) {
      // Show success toast
      toast.success('Payment successful! Your order has been placed.');
      
      // Optionally fetch order details using payment intent ID
      fetchOrderDetails();
    } else {
      setIsLoading(false);
    }
  }, [paymentIntentId]);

  const fetchOrderDetails = async () => {
    try {
      // This is optional - you could fetch order details if needed
      // For now, we'll just stop loading
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your order has been placed successfully.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {paymentIntentId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Payment Details
                </h3>
                <p className="text-xs text-gray-600 break-all">
                  <strong>Payment ID:</strong> {paymentIntentId}
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive an order confirmation email shortly</li>
                <li>• We'll process your order and prepare it for shipping</li>
                <li>• You'll get tracking information once shipped</li>
                <li>• Expected delivery: 7 business days</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href="/orders"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                View My Orders
              </Link>
              
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-500">
                customer support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
