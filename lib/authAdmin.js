import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Get admin email from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

const authAdmin = async (userId) => {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        
        // Get the primary email address
        const primaryEmail = user.emailAddresses.find(
            email => email.id === user.primaryEmailAddressId
        )?.emailAddress;
        
        // Check if the user's email matches the admin email
        if (primaryEmail === ADMIN_EMAIL) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Admin authentication error:', error);
        return NextResponse.json({ success: false, message: error.message });
    }
};

export default authAdmin;