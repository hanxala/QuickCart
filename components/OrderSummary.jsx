import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PaymentMethodSelector from './PaymentMethodSelector';
import RazorpayCheckout from './RazorpayCheckout';

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartAmount, cartItems, products, isSignedIn, userId } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod'); // Default to COD due to international cards restriction
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);

  const fetchUserAddresses = async () => {
    if (!isSignedIn || !userId) return;
    
    try {
      const response = await fetch(`/api/users/${userId}/addresses`);
      const data = await response.json();
      
      if (data.success) {
        setUserAddresses(data.addresses);
        // Set default address if available
        const defaultAddress = data.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      // Comprehensive error analysis
      const logError = (label, data) => {
        console.log(`🚨 FETCH_ERROR ${label}:`, data);
        console.warn(`⚠️ FETCH_ERROR ${label}:`, data);
        if (typeof window !== 'undefined') {
          window.fetchErrorLog = window.fetchErrorLog || [];
          window.fetchErrorLog.push({ label, data, timestamp: new Date().toISOString() });
        }
      };
      
      let errorInfo = {
        timestamp: new Date().toISOString(),
        errorReceived: !!error,
        errorType: typeof error,
        isNull: error === null,
        isUndefined: error === undefined,
        constructor: error?.constructor?.name,
        isFetchError: error instanceof TypeError && error.message === 'Failed to fetch',
        isNetworkError: error?.name === 'NetworkError',
        message: error?.message || 'No message',
        name: error?.name || 'No name',
        stack: error?.stack || 'No stack',
        cause: error?.cause || 'No cause'
      };
      
      logError('ANALYSIS', errorInfo);
      logError('RAW_ERROR', error);
      
      // Check if it's a network/fetch issue
      if (error?.message === 'Failed to fetch') {
        logError('NETWORK_ISSUE', {
          message: 'This is a network connectivity issue',
          possibleCauses: [
            'Server is not running',
            'CORS issues',
            'Network connectivity problems',
            'API endpoint not accessible'
          ]
        });
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to load addresses');
      }
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to place an order');
      router.push('/sign-in');
      return;
    }
    
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    if (getCartCount() === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // For card payments, initiate Razorpay
    if (selectedPaymentMethod === 'card') {
      setShowRazorpayCheckout(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare order items from cart (matching backend API structure)
      const orderItems = Object.keys(cartItems)
        .map(productId => {
          const product = products.find(p => p._id === productId);
          if (!product || !product.offerPrice) {
            console.warn(`Product ${productId} not found or missing offerPrice`);
            return null;
          }
          return {
            productId,
            quantity: cartItems[productId]
          };
        })
        .filter(Boolean); // Remove null items
      
      const orderData = {
        items: orderItems,
        address: selectedAddress,
        paymentMethod: selectedPaymentMethod
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Clear cart from localStorage
        localStorage.removeItem('cartItems');
        
        // Redirect to order success page
        router.push('/order-placed');
        toast.success('Order placed successfully!');
        
        // Optionally, trigger a cart refresh in the context
        window.location.reload();
      } else {
        console.error('Order placement failed:', data);
        toast.error(data.message || data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  const handleRazorpaySuccess = async (paymentData) => {
    try {
      setLoading(true);
      
      // Prepare order items from cart
      const orderItems = Object.keys(cartItems)
        .map(productId => {
          const product = products.find(p => p._id === productId);
          if (!product || !product.offerPrice) {
            return null;
          }
          return {
            productId,
            quantity: cartItems[productId]
          };
        })
        .filter(Boolean);
      
      const orderData = {
        items: orderItems,
        address: selectedAddress,
        paymentMethod: 'card',
        paymentInfo: {
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
          paymentStatus: 'completed'
        }
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.removeItem('cartItems');
        router.push('/order-placed');
        toast.success('Payment successful! Order placed.');
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to complete order');
    } finally {
      setLoading(false);
      setShowRazorpayCheckout(false);
    }
  };

  const handleRazorpayError = (error) => {
    // Alternative error logging that bypasses Next.js filtering
    const logError = (label, data) => {
      // Use multiple logging methods
      console.log(`🚨 ${label}:`, data);
      console.warn(`⚠️ ${label}:`, data);
      console.info(`ℹ️ ${label}:`, data);
      
      // Force log to DOM for debugging
      if (typeof window !== 'undefined') {
        const debugDiv = document.getElementById('debug-errors') || (() => {
          const div = document.createElement('div');
          div.id = 'debug-errors';
          div.style.cssText = 'position:fixed;top:0;right:0;background:red;color:white;padding:10px;z-index:9999;max-width:300px;font-size:12px;';
          document.body.appendChild(div);
          return div;
        })();
        debugDiv.innerHTML += `<div>${label}: ${JSON.stringify(data)}</div>`;
      }
    };
    
    // Enhanced error analysis
    let errorInfo = {
      timestamp: new Date().toISOString(),
      errorReceived: !!error,
      errorType: typeof error,
      isNull: error === null,
      isUndefined: error === undefined,
      constructor: error?.constructor?.name,
    };
    
    if (error) {
      try {
        errorInfo = {
          ...errorInfo,
          hasMessage: 'message' in error,
          hasCode: 'code' in error,
          hasDescription: 'description' in error,
          message: error.message || 'No message',
          code: error.code || 'No code',
          description: error.description || 'No description',
          source: error.source || 'No source',
          step: error.step || 'No step',
          reason: error.reason || 'No reason',
          keys: Object.keys(error),
          entries: Object.entries(error),
          valueOf: error.valueOf(),
          toString: error.toString(),
        };
        
        // Try to get all enumerable properties
        for (let key in error) {
          if (error.hasOwnProperty(key)) {
            errorInfo[`prop_${key}`] = error[key];
          }
        }
      } catch (analysisError) {
        errorInfo.analysisError = analysisError.message;
      }
    }
    
    logError('RAZORPAY_ERROR_ANALYSIS', errorInfo);
    logError('RAZORPAY_RAW_ERROR', error);
    
    // Extract meaningful error message with better business logic
    let errorMessage = 'Payment failed. Please try again.';
    if (error) {
      if (error.reason === 'international_transaction_not_allowed' || error.code === 'BAD_REQUEST_ERROR') {
        errorMessage = error.description || 'International cards are not supported. Please use an Indian card or try another payment method.';
        
        // Show suggestion to use COD for international card issues
        setTimeout(() => {
          if (selectedPaymentMethod === 'card') {
            toast.success('💡 Tip: You can use Cash on Delivery (COD) as an alternative payment method!', {
              duration: 6000,
              position: 'top-center'
            });
          }
        }, 2000);
      } else if (error.message === 'Payment cancelled by user') {
        errorMessage = 'Payment was cancelled. You can try again when ready.';
      } else {
        errorMessage = error.description || error.message || error.reason || error.error_description || errorMessage;
      }
    }
    
    toast.error(errorMessage);
    setShowRazorpayCheckout(false);
  };

  useEffect(() => {
    fetchUserAddresses();
    
    // Listen for Razorpay payment initiation
    const handleRazorpayPayment = () => {
      if (selectedPaymentMethod === 'card' && selectedAddress) {
        setShowRazorpayCheckout(true);
      } else {
        toast.error('Please select an address first');
      }
    };
    
    window.addEventListener('initiateRazorpayPayment', handleRazorpayPayment);
    
    return () => {
      window.removeEventListener('initiateRazorpayPayment', handleRazorpayPayment);
    };
  }, [selectedPaymentMethod, selectedAddress])

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <PaymentMethodSelector 
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={setSelectedPaymentMethod}
            orderAmount={getCartAmount() + Math.floor(getCartAmount() * 0.02)}
          />
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{currency}{getCartAmount()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{Math.floor(getCartAmount() * 0.02)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.02)}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={createOrder} 
        disabled={loading || !selectedAddress || getCartCount() === 0} 
        className={`w-full py-3 mt-5 ${loading || !selectedAddress || getCartCount() === 0 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-orange-600 hover:bg-orange-700'} text-white`}
      >
        {loading ? 'Processing...' : selectedPaymentMethod === 'card' ? 'Pay with Card' : 'Place Order'}
      </button>
      
      {/* Razorpay Checkout Modal/Component */}
      {showRazorpayCheckout && selectedAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <button
                onClick={() => setShowRazorpayCheckout(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <RazorpayCheckout
                items={Object.keys(cartItems).map(productId => ({
                  productId,
                  quantity: cartItems[productId]
                })).filter(item => products.find(p => p._id === item.productId))}
                address={selectedAddress}
                onPaymentSuccess={handleRazorpaySuccess}
                onPaymentError={handleRazorpayError}
                isVisible={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;