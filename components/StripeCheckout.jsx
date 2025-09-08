'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const getStripePromise = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  // Check if publishable key exists and is not a placeholder
  if (!publishableKey || 
      publishableKey === 'your_stripe_publishable_key_here' || 
      publishableKey.trim() === '' ||
      !publishableKey.startsWith('pk_')) {
    console.warn('Stripe publishable key is not configured properly. Stripe functionality will be disabled.');
    return null;
  }
  
  return loadStripe(publishableKey);
};

const stripePromise = getStripePromise();

const CheckoutForm = ({ clientSecret, paymentIntentId, amount, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: {
          name: user?.fullName || user?.firstName || 'Customer',
          email: user?.primaryEmailAddress?.emailAddress || '',
        },
      }
    });

    if (error) {
      console.error('Payment failed:', error);
      setPaymentError(error.message);
      toast.error(error.message);
      onPaymentError(error);
    } else {
      console.log('Payment succeeded:', paymentIntent);
      toast.success('Payment successful!');
      onPaymentSuccess(paymentIntent);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment Details
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{paymentError}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            <p>Total Amount: <span className="font-medium">₹{amount?.toFixed(2)}</span></p>
            <p className="text-xs text-gray-500 mt-1">
              Your payment is secured by Stripe
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
          !stripe || !elements || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay ₹${amount?.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const StripeCheckout = ({ 
  items, 
  address, 
  onPaymentSuccess, 
  onPaymentError,
  isVisible = true 
}) => {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVisible && items && items.length > 0 && address) {
      createPaymentIntent();
    }
  }, [items, address, isVisible]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-intent', {
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
        throw new Error(data.message || 'Failed to create payment intent');
      }

      setClientSecret(data.data.clientSecret);
      setPaymentIntentId(data.data.paymentIntentId);
      setAmount(data.data.amount);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  // Check if Stripe is properly configured
  if (!stripePromise) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Stripe Payment Not Configured
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Stripe payment gateway is not configured. Please contact the administrator or use alternative payment methods.</p>
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
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Payment Setup Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={createPaymentIntent}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="max-w-md mx-auto">
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId}
          amount={amount}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      </Elements>
    </div>
  );
};

export default StripeCheckout;
