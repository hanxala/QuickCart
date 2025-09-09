'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

const RazorpayCheckout = ({ 
  items, 
  address, 
  onPaymentSuccess, 
  onPaymentError,
  isVisible = true 
}) => {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { user } = useUser();

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  useEffect(() => {
    if (isVisible && items && items.length > 0 && address && !orderCreated && !isLoading) {
      createRazorpayOrder();
    }
  }, [items, address, isVisible, orderCreated, isLoading]);

  const createRazorpayOrder = async () => {
    if (orderCreated) return; // Prevent multiple calls
    
    setIsLoading(true);
    setError(null);
    setOrderCreated(true);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          address: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      setOrderId(data.data.orderId);
      setAmount(data.data.amount);
    } catch (err) {
      console.error('Error creating Razorpay order:', err);
      setError(err.message);
      setOrderCreated(false); // Reset flag on error to allow retry
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentProcessing) {
      return; // Prevent multiple payment attempts
    }
    
    if (!window.Razorpay) {
      toast.error('Razorpay is not loaded. Please refresh the page.');
      return;
    }

    if (!orderId) {
      toast.error('Order not created. Please try again.');
      return;
    }
    
    setPaymentProcessing(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'QuickCart',
      description: 'Payment for your order',
      order_id: orderId,
      prefill: {
        name: user?.fullName || user?.firstName || 'Customer',
        email: user?.primaryEmailAddress?.emailAddress || '',
        contact: address?.phone || '',
      },
      theme: {
        color: '#2563eb',
      },
      retry: {
        enabled: true,
        max_count: 1
      },
      handler: function (response) {
        // Payment successful
        console.log('Payment successful:', response);
        setPaymentProcessing(false);
        toast.success('Payment successful!');
        onPaymentSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal dismissed');
          console.log('Payment cancelled by user - creating error object');
          
          setPaymentProcessing(false);
          const dismissError = new Error('Payment cancelled by user');
          console.log('Created dismiss error:', dismissError);
          console.log('Dismiss error type:', typeof dismissError);
          console.log('Dismiss error keys:', Object.keys(dismissError));
          
          toast.error('Payment cancelled by user');
          onPaymentError(dismissError);
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', function (response) {
      const error = response?.error;
      
      // Alternative comprehensive logging
      const logPaymentError = (label, data) => {
        console.log(`🚨 PAYMENT_FAILED ${label}:`, data);
        console.warn(`⚠️ PAYMENT_FAILED ${label}:`, data);
        console.info(`ℹ️ PAYMENT_FAILED ${label}:`, data);
        
        if (typeof window !== 'undefined') {
          window.paymentErrorLog = window.paymentErrorLog || [];
          window.paymentErrorLog.push({ label, data, timestamp: new Date().toISOString() });
          
          // Also create a visual debug log
          const debugDiv = document.getElementById('payment-debug') || (() => {
            const div = document.createElement('div');
            div.id = 'payment-debug';
            div.style.cssText = 'position:fixed;bottom:0;left:0;background:orange;color:black;padding:10px;z-index:9999;max-width:400px;font-size:11px;max-height:200px;overflow-y:auto;';
            document.body.appendChild(div);
            return div;
          })();
          debugDiv.innerHTML += `<div><strong>${label}:</strong> ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}</div>`;
        }
      };
      
      // Deep analysis of the response and error objects
      let analysisResults = {
        timestamp: new Date().toISOString(),
        responseReceived: !!response,
        responseType: typeof response,
        responseIsNull: response === null,
        responseIsUndefined: response === undefined,
        responseConstructor: response?.constructor?.name,
        responseKeys: response ? Object.keys(response) : [],
        errorReceived: !!error,
        errorType: typeof error,
        errorIsNull: error === null,
        errorIsUndefined: error === undefined,
        errorConstructor: error?.constructor?.name,
        errorKeys: error ? Object.keys(error) : [],
      };
      
      // Try to extract error properties safely
      if (error) {
        try {
          analysisResults.errorProperties = {
            code: error.code,
            description: error.description,
            source: error.source,
            step: error.step,
            reason: error.reason,
            field: error.field,
            metadata: error.metadata,
            toString: error.toString(),
            valueOf: error.valueOf(),
          };
          
          // Get all enumerable properties
          for (let key in error) {
            if (error.hasOwnProperty(key)) {
              analysisResults.errorProperties[`enum_${key}`] = error[key];
            }
          }
        } catch (propertyError) {
          analysisResults.propertyExtractionError = propertyError.message;
        }
      }
      
      logPaymentError('DETAILED_ANALYSIS', analysisResults);
      logPaymentError('RAW_RESPONSE', response);
      logPaymentError('RAW_ERROR', error);
      
      // Extract the best possible error message with business logic
      let errorMessage = 'Payment failed';
      if (error) {
        if (error.reason === 'international_transaction_not_allowed' || error.code === 'BAD_REQUEST_ERROR') {
          errorMessage = error.description || 'International cards are not supported. Please use an Indian debit/credit card.';
        } else if (error.code === 'GATEWAY_ERROR') {
          errorMessage = 'Payment gateway error. Please try again or use a different payment method.';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.description || error.reason || error.message || error.field || errorMessage;
        }
      }
      
      logPaymentError('FINAL_ERROR_MESSAGE', errorMessage);
      
      setPaymentProcessing(false);
      toast.error(`Payment failed: ${errorMessage}`);
      onPaymentError(error || new Error('Payment failed'));
    });

    razorpayInstance.open();
  };

  if (!isVisible) {
    return null;
  }

  // Check if Razorpay is properly configured
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Razorpay Payment Not Configured
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Razorpay payment gateway is not configured. Please contact the administrator or use alternative payment methods.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Setting up payment...</span>
      </div>
    );
  }

  if (error) {
    const isInternationalCardError = error.includes('International cards') || error.includes('international_transaction_not_allowed');
    
    return (
      <div className={`p-6 border rounded-lg ${
        isInternationalCardError ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex">
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              isInternationalCardError ? 'text-blue-800' : 'text-red-800'
            }`}>
              {isInternationalCardError ? 'International Cards Not Supported' : 'Payment Setup Error'}
            </h3>
            <div className={`mt-2 text-sm ${
              isInternationalCardError ? 'text-blue-700' : 'text-red-700'
            }`}>
              <p>{error}</p>
              {isInternationalCardError && (
                <div className="mt-4 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-800">For Testing - Use Indian Test Card:</p>
                  <ul className="mt-2 text-xs text-blue-700 space-y-1">
                    <li>• Card Number: <code className="bg-blue-200 px-1 rounded">4111 1111 1111 1111</code></li>
                    <li>• Expiry: Any future date (e.g., 12/25)</li>
                    <li>• CVV: Any 3 digits (e.g., 123)</li>
                    <li>• Name: Any name</li>
                  </ul>
                  <p className="mt-2 text-xs text-blue-600">
                    💡 <strong>For Production:</strong> Enable international payments in your Razorpay dashboard
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => {
                  setError(null);
                  setOrderCreated(false);
                  createRazorpayOrder();
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isInternationalCardError 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Try Again
              </button>
              {isInternationalCardError && (
                <button
                  onClick={() => window.open('https://razorpay.com/docs/payments/payments/international-payments/', '_blank')}
                  className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Learn More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                <p>Total Amount: <span className="font-medium">₹{amount?.toFixed(2)}</span></p>
                <p className="text-xs text-gray-500 mt-1">
                  Your payment is secured by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={!razorpayLoaded || !orderId || isLoading || paymentProcessing}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
            !razorpayLoaded || !orderId || isLoading || paymentProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading || paymentProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {paymentProcessing ? 'Processing Payment...' : 'Setting up...'}
            </div>
          ) : (
            `Pay ₹${amount?.toFixed(2)}`
          )}
        </button>

        <div className="text-xs text-gray-500 text-center">
          <p>By proceeding, you agree to our terms and conditions</p>
        </div>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
