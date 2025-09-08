# Hanzala.co - Premium E-Commerce Platform

Hanzala.co is a modern **premium e-commerce platform** built with Next.js, MongoDB, and Clerk authentication.
It provides a complete shopping experience with user authentication, product management, cart functionality, order processing, and comprehensive analytics dashboard.

---

## Features

### Frontend
-   **Next.js 15** with App Router
-   **Tailwind CSS** for styling
-   Responsive design
-   Reusable components
-   Real-time cart updates
-   Product search and filtering
-   Analytics Dashboard with KPIs and charts

### Backend
-   **REST API** endpoints
-   **MongoDB** database integration
-   **Mongoose** ODM for data modeling
-   **Cloudinary** for image management
-   User profile management
-   Order tracking system
-   Email notifications with Nodemailer
-   Event-driven architecture with Inngest

### Authentication
-   **Clerk** authentication
-   User sign-up/sign-in
-   Protected routes
-   Role-based access (Customer/Admin)

### E-commerce Features
-   Product catalog with categories
-   Shopping cart functionality
-   Order management
-   Address management
-   Admin panel with analytics
-   Stock management
-   Payment integration ready (Stripe)

### Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Event Handling**: Inngest
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Notifications**: React Hot Toast
- **Email**: Nodemailer
- **Charts**: Recharts

---

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Clerk account for authentication
- Cloudinary account for image storage (optional)
- Inngest account for event handling

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Currency
NEXT_PUBLIC_CURRENCY=$

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Inngest (for background jobs)
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/hanzala/hanzala-co.git
    cd hanzala-co
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Set up environment variables**
    
    Copy the environment variables section above and create your `.env.local` file.

4. **Seed the database** (optional)
    ```bash
    npm run seed
    ```

5. **Run the development server**
    ```bash
    npm run dev
    ```

6. **Open your browser**
    
    Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
/app                  # Next.js app directory
  /admin              # Admin panel pages
    /analytics        # Analytics dashboard
    /products         # Product management
  /api                # API routes
  /add-address        # Add address page
  /all-products       # Products listing page
  /cart               # Shopping cart page
  /checkout           # Checkout page
  /order-placed       # Order confirmation page
  /profile            # User profile page
  /sign-in            # Sign in page
  /sign-up            # Sign up page
/assets               # Static assets (logo, icons, images)
/components           # React components
  /admin              # Admin-specific components
  /auth               # Authentication components
  /ui                 # Reusable UI components
/context              # React context providers
/inngest              # Inngest event functions
  /functions          # Event handler functions
/lib                  # Utility functions
/models               # Mongoose models
/scripts              # Database and utility scripts
/test                 # Test scripts
```

## API Endpoints

### Products
- `GET /api/products` - Get all products with pagination
- `POST /api/products` - Create new product (Admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (Owner only)
- `DELETE /api/products/[id]` - Delete product (Owner only)

### Analytics
- `GET /api/admin/analytics/stats` - Get dashboard statistics
- `GET /api/admin/analytics/charts` - Get chart data

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/admin/orders` - Get all orders (Admin only)

### Users
- `GET /api/users/[userId]` - Get user profile
- `PUT /api/users/[userId]` - Update user profile
- `GET /api/users/[userId]/addresses` - Get user addresses
- `POST /api/users/[userId]/addresses` - Create address
- `PUT /api/users/[userId]/addresses/[addressId]` - Update address
- `DELETE /api/users/[userId]/addresses/[addressId]` - Delete address

### File Upload
- `POST /api/upload` - Upload image to Cloudinary

### Inngest Events
- `POST /api/inngest` - Webhook for Inngest events

## Inngest Functions

- `processOrder` - Handles order processing after creation
- `sendOrderConfirmation` - Sends order confirmation emails
- `updateInventory` - Updates product stock levels

## Scripts

- `npm run seed` - Seed database with sample data
- `npm run make-admin` - Convert user to admin role
- `npm test-email` - Test email configuration

## Testing

Follow the test plan in `/test/app-flow.js` to verify the complete application flow.

## Deployment

The application can be deployed on Vercel, Netlify, or any platform that supports Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Contributing

We welcome all kinds of contributions! You can:

- Create new pages and features
- Improve layouts and styling
- Add animations and transitions
- Enhance responsiveness
- Refactor components
- Suggest new UI/UX ideas
- Add themes or color variations
- Introduce accessibility improvements
- Add filtering/search features
- Improve documentation
- Add tests

Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the **MIT License**.

---

## 🌟 Contributors

Thanks to everyone who contributes to **Hanzala.co**!
