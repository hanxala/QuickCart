# Banner Management System - User Guide

## Overview
The Banner Management System allows administrators to dynamically manage the homepage banner content without needing to modify code. Admins can create, edit, preview, and delete banners that appear on the homepage.

## Features ✨

### Admin Panel Features:
- **Create Banners**: Add new promotional banners with custom text
- **Edit Banners**: Update existing banner content
- **Preview Banners**: See how banners will appear before activating
- **Delete Banners**: Remove unwanted banners
- **Active/Inactive Toggle**: Control which banners are displayed
- **Order Management**: Banners are displayed in creation order

### Banner Fields:
- **Title**: Main heading (e.g., "Level Up Your Gaming Experience")
- **Subtitle**: Supporting text (e.g., "From immersive sound to precise controls—everything you need to win")
- **Button Text**: Call-to-action text (e.g., "Buy now", "Shop Now", "Get Started")
- **Category**: Product category to navigate to when button is clicked
- **Search Term**: Specific product search term for filtering
- **Active Status**: Whether the banner is currently displayed

## How to Use 🎯

### For Administrators:

1. **Access Banner Management**:
   - Login to admin panel
   - Navigate to `/admin/banners`
   - Or use the "Banners" link in the admin sidebar

2. **Create a New Banner**:
   - Click "Add New Banner" button
   - Fill in required fields (Title, Subtitle, Button Text)
   - Optionally set Category and Search Term for button navigation
   - Use Live Preview to see how it will look
   - Click "Create Banner" to save

3. **Edit Existing Banner**:
   - Click the edit (pencil) icon on any banner
   - Modify the fields as needed
   - Use Live Preview to verify changes
   - Click "Update Banner" to save

4. **Preview Banner**:
   - Click the preview (eye) icon to see how the banner will appear
   - This shows the exact styling and layout used on the homepage

5. **Delete Banner**:
   - Click the delete (trash) icon
   - Confirm deletion in the popup
   - Note: This permanently removes the banner

### For Frontend Users:

- Banners automatically appear on the homepage
- Only active banners are displayed
- The first active banner is shown (by creation order)
- Clicking the banner button navigates based on Category/Search Term settings

## Technical Details 🔧

### API Endpoints:
- `GET /api/banners` - Fetch active banners
- `POST /api/banners` - Create new banner (Admin only)
- `PUT /api/banners` - Update existing banner (Admin only)
- `DELETE /api/banners?id={bannerId}` - Delete banner (Admin only)

### Database:
- Collection: `banners`
- Schema includes: title, subtitle, buttonText, category, searchTerm, isActive, order, timestamps

### Fallback Behavior:
- If no banners exist, displays default gaming banner
- If API fails, gracefully falls back to default content
- Loading states prevent layout shift

## Navigation Behavior 🎯

When users click the banner button:

1. **If Search Term is provided**: 
   - Navigates to `/search?q={searchTerm}`
   - Shows products matching the search term

2. **If Category is provided**: 
   - Navigates to `/all-products?category={category}`
   - Shows products in that category

3. **If neither is provided**: 
   - Navigates to `/all-products`
   - Shows all products

## Best Practices 📝

### Content Guidelines:
- **Titles**: Keep under 50 characters, make them compelling and action-oriented
- **Subtitles**: 1-2 sentences that clearly explain the benefit or offer
- **Button Text**: Use action verbs like "Buy now", "Shop Now", "Explore", "Get Started"
- **Categories**: Use existing product categories from your store
- **Search Terms**: Use specific product names or popular search terms

### Design Guidelines:
- Banners maintain consistent styling automatically
- Text is automatically responsive and optimized for dark/light modes
- Images remain the same (currently gaming-themed) but text is fully customizable
- Preview feature ensures content looks good before going live

## Troubleshooting 🛠️

### Common Issues:

1. **Banner not appearing on homepage**:
   - Check if banner is marked as "Active"
   - Verify banner was created successfully
   - Check browser console for API errors

2. **Button not navigating correctly**:
   - Ensure Category or Search Term is properly set
   - Verify the category/search term exists in your product database

3. **Admin panel not loading**:
   - Ensure user has admin privileges
   - Check database connection
   - Verify API endpoints are accessible

### Development Mode Features:
- In development, banners show debug info (category/search term) below the button
- This helps verify navigation settings are correct

## Example Usage 💡

### Example 1: Gaming Promotion
- **Title**: "Level Up Your Gaming Experience"
- **Subtitle**: "From immersive sound to precise controls—everything you need to win"
- **Button Text**: "Shop Gaming Gear"
- **Category**: "gaming"
- **Search Term**: "gaming accessories"

### Example 2: Electronics Sale
- **Title**: "Tech Sale - Up to 50% Off"
- **Subtitle**: "Latest smartphones, laptops, and gadgets at unbeatable prices"
- **Button Text**: "Browse Deals"
- **Category**: "electronics"
- **Search Term**: "sale"

### Example 3: New Product Launch
- **Title**: "Introducing iPhone 15 Pro"
- **Subtitle**: "The most advanced iPhone yet with titanium design and powerful A17 chip"
- **Button Text**: "Pre-order Now"
- **Category**: "phones"
- **Search Term**: "iPhone 15"

This system provides full flexibility for promotional campaigns while maintaining the existing banner design and user experience!
