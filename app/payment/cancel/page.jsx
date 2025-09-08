'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    // Show cancel toast
    toast.error('Payment was cancelled. Your order was not placed.');
  }, []);

  const handleRetryPayment = () => {
    // Redirect back to checkout or cart
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Cancelled
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment was cancelled and no charges were made.
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

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-amber-900 mb-2">
                What happened?
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Payment was cancelled before completion</li>
                <li>• No charges were made to your card</li>
                <li>• Your cart items are still saved</li>
                <li>• You can try again anytime</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Need help with payment?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check if your card details are correct</li>
                <li>• Ensure sufficient balance in your account</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if issues persist</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
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
              Still having trouble? Contact our{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-500">
                customer support
              </Link>{' '}
              for assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="mx-auto h-16 w-16 bg-gray-300 rounded-full mb-6"></div>
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
