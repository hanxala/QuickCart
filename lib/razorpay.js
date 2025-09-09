import Razorpay from 'razorpay';
import crypto from 'crypto';

// Server-side Razorpay instance
let razorpay = null;

// Initialize Razorpay only if credentials are available
if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export default razorpay;

// Utility function to format amount for Razorpay (convert to paise)
export const formatAmountForRazorpay = (amount, currency = 'INR') => {
  // Razorpay expects amounts in the smallest currency unit
  // For INR, multiply by 100 to convert to paise
  return Math.round(amount * 100);
};

// Utility function to format amount from Razorpay (convert from paise)
export const formatAmountFromRazorpay = (amount, currency = 'INR') => {
  // Convert from paise to rupees
  return amount / 100;
};

// Create a Razorpay order
export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  
  try {
    const order = await razorpay.orders.create({
      amount: formatAmountForRazorpay(amount),
      currency: currency.toUpperCase(),
      receipt,
      notes,
    });

    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Fetch a Razorpay order
export const fetchRazorpayOrder = async (orderId) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Error fetching Razorpay order:', error);
    throw error;
  }
};

// Verify Razorpay payment signature
export const verifyRazorpayPayment = (payment) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment parameters');
    }

    // Create the signature verification string
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    
    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Compare signatures
    const isAuthentic = expectedSignature === razorpay_signature;
    
    return {
      isValid: isAuthentic,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    };
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Fetch payment details
export const fetchRazorpayPayment = async (paymentId) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw error;
  }
};

// Create a Razorpay customer
export const createRazorpayCustomer = async ({ name, email, contact, metadata = {} }) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact,
      notes: metadata,
    });

    return customer;
  } catch (error) {
    console.error('Error creating Razorpay customer:', error);
    throw error;
  }
};

// Refund a payment
export const refundRazorpayPayment = async (paymentId, amount) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: formatAmountForRazorpay(amount),
      speed: 'normal',
    });

    return refund;
  } catch (error) {
    console.error('Error refunding Razorpay payment:', error);
    throw error;
  }
};

// Verify webhook signature
export const verifyRazorpayWebhook = (payload, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    const isAuthentic = expectedSignature === signature;
    
    return {
      isValid: isAuthentic,
      payload
    };
  } catch (error) {
    console.error('Error verifying Razorpay webhook:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Generate payment options for client-side
export const generateRazorpayOptions = ({
  orderId,
  amount,
  currency = 'INR',
  name,
  description,
  customerName,
  customerEmail,
  customerContact,
  successUrl,
  cancelUrl,
  theme = { color: '#3399cc' }
}) => {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: formatAmountForRazorpay(amount),
    currency: currency.toUpperCase(),
    order_id: orderId,
    name,
    description,
    customer: {
      name: customerName,
      email: customerEmail,
      contact: customerContact,
    },
    callback_url: successUrl,
    cancel_url: cancelUrl,
    theme,
    modal: {
      ondismiss: function() {
        window.location.href = cancelUrl;
      }
    }
  };
};
