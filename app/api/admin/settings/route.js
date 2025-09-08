import dbConnect from '@/lib/database';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';
import fs from 'fs/promises';
import path from 'path';

// Settings Model (we'll store settings in a JSON file for simplicity)
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'settings.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Default settings
const defaultSettings = {
  general: {
    siteName: 'Hanzala.co',
    siteDescription: 'Premium E-Commerce Platform by Hanzala Khan',
    siteUrl: 'http://localhost:3000',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    language: 'en',
    maintenanceMode: false,
    allowRegistrations: true,
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminEmailPassword: '',
    notificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || '',
    emailSignature: 'Best regards,\\nHanzala.co Team',
    sendOrderConfirmation: true,
    sendLowStockAlerts: true,
    sendNewUserNotifications: true,
  },
  payment: {
    enableCOD: true,
    enableUPI: true,
    enableCards: true,
    enableNetBanking: false,
    upiId: process.env.UPI_ID || 'merchant@upi',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    paymentGatewayMode: 'test', // 'test' or 'live'
  },
  shipping: {
    freeShippingThreshold: 500,
    defaultShippingCost: 50,
    maxShippingCost: 200,
    estimatedDeliveryDays: 7,
    enableExpressDelivery: false,
    expressDeliveryDays: 2,
    expressDeliveryCost: 100,
  },
  inventory: {
    lowStockThreshold: 10,
    outOfStockThreshold: 0,
    enableStockAlerts: true,
    autoDisableOutOfStock: true,
    showStockCount: true,
    allowBackorders: false,
  },
  ui: {
    theme: 'light',
    primaryColor: '#f97316', // Orange
    secondaryColor: '#1f2937', // Gray
    showProductRatings: true,
    showProductReviews: true,
    productsPerPage: 12,
    enableWishlist: true,
    enableCompare: false,
  },
  security: {
    enableTwoFactor: false,
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableCaptcha: false,
  },
  analytics: {
    enableGoogleAnalytics: false,
    googleAnalyticsId: '',
    enableFacebookPixel: false,
    facebookPixelId: '',
    trackingEnabled: true,
  }
};

// Get current settings
const getSettings = async () => {
  try {
    await ensureDataDirectory();
    const settingsData = await fs.readFile(SETTINGS_FILE_PATH, 'utf8');
    return { ...defaultSettings, ...JSON.parse(settingsData) };
  } catch (error) {
    // Return default settings if file doesn't exist
    return defaultSettings;
  }
};

// Save settings
const saveSettings = async (settings) => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// GET - Fetch admin settings
export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    // Check if user is admin
    const adminCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/check-access`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || ''
      }
    });
    
    if (!adminCheckResponse.ok) {
      return NextResponse.json(createApiResponse('Unauthorized', 403), { status: 403 });
    }

    const settings = await getSettings();
    
    // Remove sensitive information before sending
    const publicSettings = { ...settings };
    if (publicSettings.email) {
      delete publicSettings.email.adminEmailPassword;
    }
    if (publicSettings.payment) {
      delete publicSettings.payment.stripeSecretKey;
    }

    return NextResponse.json(createApiResponse(publicSettings), { status: 200 });
    
  } catch (error) {
    console.error('Settings GET error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// PUT - Update admin settings
export async function PUT(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    // Check if user is admin
    const adminCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/check-access`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || ''
      }
    });
    
    if (!adminCheckResponse.ok) {
      return NextResponse.json(createApiResponse('Unauthorized', 403), { status: 403 });
    }

    const updates = await request.json();
    const currentSettings = await getSettings();
    
    // Merge updates with current settings
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save settings
    const saved = await saveSettings(updatedSettings);
    
    if (!saved) {
      return NextResponse.json(createApiResponse('Failed to save settings', 500), { status: 500 });
    }

    // Remove sensitive information before sending response
    const publicSettings = { ...updatedSettings };
    if (publicSettings.email) {
      delete publicSettings.email.adminEmailPassword;
    }
    if (publicSettings.payment) {
      delete publicSettings.payment.stripeSecretKey;
    }

    return NextResponse.json(createApiResponse(publicSettings), { status: 200 });
    
  } catch (error) {
    console.error('Settings PUT error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// POST - Reset settings to default
export async function POST(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    // Check if user is admin
    const adminCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/check-access`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || ''
      }
    });
    
    if (!adminCheckResponse.ok) {
      return NextResponse.json(createApiResponse('Unauthorized', 403), { status: 403 });
    }

    const { action } = await request.json();
    
    if (action === 'reset') {
      const resetSettings = {
        ...defaultSettings,
        resetAt: new Date().toISOString()
      };
      
      const saved = await saveSettings(resetSettings);
      
      if (!saved) {
        return NextResponse.json(createApiResponse('Failed to reset settings', 500), { status: 500 });
      }

      return NextResponse.json(createApiResponse(resetSettings, 'Settings reset to default successfully'), { status: 200 });
    }

    return NextResponse.json(createApiResponse('Invalid action', 400), { status: 400 });
    
  } catch (error) {
    console.error('Settings POST error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
