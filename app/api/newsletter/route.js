import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import emailService from '@/lib/emailService';

// Newsletter subscription model (you may want to create a separate model file)
import { Schema, model, models } from 'mongoose';

const newsletterSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Newsletter = models.Newsletter || model('Newsletter', newsletterSchema);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated.',
        });
      }
    }

    // Create new subscription
    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    // Send welcome email
    try {
      await emailService.sendEmail(
        email,
        'Welcome to QuickCart Newsletter! 🎉',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">Welcome to QuickCart!</h1>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Thank you for subscribing! 🎊</h2>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                You've successfully joined our newsletter and are now part of the QuickCart family! 
                Get ready to receive exclusive deals, new product announcements, and special offers directly in your inbox.
              </p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">🎁 Special Welcome Offer!</h3>
                <p style="color: #92400e; margin: 10px 0; font-weight: bold; font-size: 16px;">
                  Enjoy 20% off your first purchase with code: WELCOME20
                </p>
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  *Valid for 30 days from subscription
                </p>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="color: #1f2937;">What to expect:</h3>
              <ul style="color: #6b7280; line-height: 1.6;">
                <li>🔥 Weekly hot deals and flash sales</li>
                <li>📱 First access to new product launches</li>
                <li>💝 Exclusive subscriber-only discounts</li>
                <li>📢 Important updates and announcements</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://quickcart.com'}/all-products" 
                 style="background-color: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Start Shopping Now
              </a>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                You're receiving this email because you subscribed to QuickCart newsletter.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} QuickCart. All rights reserved.
              </p>
            </div>
          </div>
        `,
        `Welcome to QuickCart Newsletter!
        
        Thank you for subscribing to our newsletter! You'll receive exclusive deals and updates.
        
        Enjoy 20% off your first purchase with code: WELCOME20
        Valid for 30 days from subscription.
        
        Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://quickcart.com'}/all-products
        `
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for a welcome message.',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter. Please try again.' },
      { status: 500 }
    );
  }
}

// Unsubscribe endpoint
export async function DELETE(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const subscription = await Newsletter.findOne({ email });
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Email not found in our newsletter list' },
        { status: 404 }
      );
    }

    subscription.isActive = false;
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter.',
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}
