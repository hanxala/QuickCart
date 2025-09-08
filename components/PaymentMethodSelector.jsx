'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentMethodSelector = ({ selectedMethod, onMethodSelect, orderAmount }) => {
  const [showUpiDetails, setShowUpiDetails] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const upiId = "hanzalakhan0912@okaxis";

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives at your doorstep',
      icon: BanknotesIcon,
      color: 'green',
      available: true,
      fees: 0
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay instantly using UPI apps like PhonePe, Google Pay, Paytm',
      icon: DevicePhoneMobileIcon,
      color: 'blue',
      available: true,
      fees: 0
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your credit or debit card',
      icon: CreditCardIcon,
      color: 'purple',
      available: true,
      fees: 0
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay through your bank account',
      icon: QrCodeIcon,
      color: 'orange',
      available: false, // You can enable this later
      fees: 0
    }
  ];

  const handleMethodSelect = (method) => {
    onMethodSelect(method.id);
    
    if (method.id === 'upi') {
      setShowUpiDetails(true);
      setShowCardForm(false);
    } else if (method.id === 'card') {
      setShowCardForm(true);
      setShowUpiDetails(false);
    } else {
      setShowUpiDetails(false);
      setShowCardForm(false);
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy UPI ID');
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = '/upi-qr-code.png';
    link.download = 'upi-payment-qr-hanzalakhan0912.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('UPI QR Code downloaded successfully!');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choose Payment Method
      </h3>

      {/* Payment Method Cards */}
      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className={`
            relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
            ${!method.available 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : selectedMethod === method.id
                ? `border-${method.color}-500 bg-${method.color}-50 shadow-md`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }
          `}>
            <div 
              className="flex items-center space-x-4"
              onClick={() => method.available && handleMethodSelect(method)}
            >
              {/* Icon */}
              <div className={`
                p-2 rounded-lg
                ${selectedMethod === method.id && method.available
                  ? `bg-${method.color}-500 text-white`
                  : `bg-${method.color}-100 text-${method.color}-600`
                }
              `}>
                <method.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    {method.name}
                    {!method.available && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </h4>
                  {selectedMethod === method.id && (
                    <CheckCircleIcon className={`w-5 h-5 text-${method.color}-500`} />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                {method.fees > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    + ₹{method.fees} processing fee
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPI Payment Details */}
      {showUpiDetails && selectedMethod === 'upi' && (
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
            <QrCodeIcon className="w-5 h-5 mr-2" />
            UPI Payment Details
          </h4>
          
          <div className="space-y-4">
            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-6 bg-white rounded-xl border-2 border-blue-200 shadow-lg">
                {/* QR Code Display */}
                <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <Image 
                    src="/upi-qr-code.png" 
                    alt="UPI QR Code - hanzalakhan0912@okaxis" 
                    width={192} 
                    height={192}
                    className="rounded border shadow-sm"
                    priority
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <button
                  onClick={downloadQRCode}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download QR Code
                </button>
                <p className="text-xs text-green-600">
                  ✅ Scan this QR code with any UPI app to pay
                </p>
                <p className="text-xs text-gray-500">
                  🔒 Secure UPI Payment • Scan with any UPI app
                </p>
              </div>
            </div>

            {/* UPI ID */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">UPI ID</p>
                  <p className="text-lg font-mono text-blue-600 break-all">{upiId}</p>
                </div>
                <button
                  onClick={copyUpiId}
                  className={`p-2 rounded-lg transition-colors ${
                    copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Amount to Pay */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">Amount to Pay</p>
              <p className="text-2xl font-bold text-green-900">₹{orderAmount}</p>
            </div>

            {/* Instructions */}
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-medium">Payment Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Scan the QR code with any UPI app (PhonePe, Google Pay, Paytm, etc.)</li>
                <li>Or manually enter the UPI ID: <strong>{upiId}</strong></li>
                <li>Enter the amount: <strong>₹{orderAmount}</strong></li>
                <li>Complete the payment and save the transaction screenshot</li>
                <li>Your order will be confirmed once payment is received</li>
              </ol>
            </div>

            {/* Popular UPI Apps */}
            <div>
              <p className="text-sm font-medium text-blue-800 mb-2">Popular UPI Apps:</p>
              <div className="flex space-x-2">
                {['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Amazon Pay'].map((app) => (
                  <span key={app} className="px-2 py-1 bg-white text-xs text-blue-600 rounded border">
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Payment Form */}
      {showCardForm && selectedMethod === 'card' && (
        <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-md font-semibold text-purple-900 mb-4 flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2" />
            Card Payment (Stripe Integration)
          </h4>
          
          <div className="text-center py-8">
            <CreditCardIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-800 font-medium">Secure Card Payment</p>
            <p className="text-sm text-purple-600 mt-2">
              Integration with Stripe for secure card payments
            </p>
            <p className="text-xs text-purple-500 mt-2">
              Amount: ₹{orderAmount}
            </p>
            
            {/* Placeholder for Stripe Elements */}
            <div className="mt-4 p-4 bg-white rounded border border-purple-200">
              <p className="text-sm text-gray-600">
                🔒 Stripe payment form will appear here
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cash on Delivery Info */}
      {selectedMethod === 'cod' && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-md font-semibold text-green-900 mb-4 flex items-center">
            <BanknotesIcon className="w-5 h-5 mr-2" />
            Cash on Delivery
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-800">Order Amount:</span>
              <span className="font-semibold text-green-900">₹{orderAmount}</span>
            </div>
            
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
              <p className="font-medium mb-2">📦 Cash on Delivery Instructions:</p>
              <ul className="space-y-1 text-sm">
                <li>• Pay the exact amount to the delivery person</li>
                <li>• Please keep the exact change ready</li>
                <li>• Payment accepted in cash only</li>
                <li>• You can inspect the product before payment</li>
              </ul>
            </div>

            <div className="text-xs text-green-600 mt-3">
              <p>✅ No advance payment required</p>
              <p>✅ 100% secure and trusted</p>
              <p>✅ Easy returns and exchanges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
