import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe instance
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    // Check if publishable key exists and is not a placeholder
    if (!publishableKey || 
        publishableKey === 'your_stripe_publishable_key_here' || 
        publishableKey.trim() === '' ||
        !publishableKey.startsWith('pk_')) {
      console.warn('Stripe publishable key is not configured properly. Stripe functionality will be disabled.');
      return null;
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Server-side Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;

// Utility function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount, currency = 'inr') => {
  // Stripe expects amounts in the smallest currency unit
  // For INR, multiply by 100 to convert to paise
  return Math.round(amount * 100);
};

// Utility function to format amount from Stripe (convert from cents)
export const formatAmountFromStripe = (amount, currency = 'inr') => {
  // Convert from paise to rupees
  return amount / 100;
};

// Create a payment intent
export const createPaymentIntent = async ({ amount, currency = 'inr', metadata = {} }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Retrieve a payment intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Create a customer
export const createStripeCustomer = async ({ email, name, metadata = {} }) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Update a payment intent
export const updatePaymentIntent = async (paymentIntentId, updateData) => {
  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateData);
    return paymentIntent;
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw error;
  }
};

// Cancel a payment intent
export const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw error;
  }
};

// Construct webhook event
export const constructWebhookEvent = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw error;
  }
};
