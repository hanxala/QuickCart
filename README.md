<<<<<<< HEAD
# Hanzala.co - Premium E-Commerce Platform

Hanzala.co is a modern **premium e-commerce platform** built with Next.js, MongoDB, and Clerk authentication.
It provides a complete shopping experience with user authentication, product management, cart functionality, order processing, and more.

---

## Features

### Frontend
-   **Next.js 15** with App Router
-   **Tailwind CSS** for styling
-   Responsive design
-   Reusable components
-   Real-time cart updates
-   Product search and filtering

### Backend
-   **REST API** endpoints
-   **MongoDB** database integration
-   **Mongoose** ODM for data modeling
-   **Cloudinary** for image management
-   User profile management
-   Order tracking system

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
-   Admin panel
-   Stock management
-   Payment integration ready

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Clerk account for authentication
- Cloudinary account for image storage (optional)
=======
# QuickCart - E-Commerce Application

QuickCart is a modern e-commerce application built with Next.js, MongoDB, Clerk for authentication, and Inngest for event handling. This project was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Features

- User authentication with Clerk
- Product browsing and searching
- Shopping cart management
- Order creation and processing
- User profile management
- Address management
- Event-driven architecture with Inngest

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Event Handling**: Inngest
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas account or local MongoDB instance
- Clerk account for authentication
- Inngest account for event handling

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

## Getting Started

1. Clone the repository and install dependencies

```bash
git clone https://github.com/yourusername/quickcart.git
cd quickcart
npm install
```

2. Run the development server:

```bash
npm run dev
```
>>>>>>> e92141b780b12716bd54ceafdf8b28de972bdb06

### Installation

<<<<<<< HEAD
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
    
    Create a `.env.local` file in the root directory and add:
    
    ```bash
    # Database
    MONGODB_URI=your_mongodb_connection_string
    
    # Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    
    # Cloudinary (for image uploads)
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    
    # Currency
    NEXT_PUBLIC_CURRENCY=$
    
    # Optional: Inngest (for background jobs)
    INNGEST_SIGNING_KEY=your_inngest_signing_key
    INNGEST_EVENT_KEY=your_inngest_event_key
    ```

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
=======
## Project Structure

```
/app                  # Next.js app directory
  /api                # API routes
  /add-address        # Add address page
  /all-products       # Products listing page
  /cart               # Shopping cart page
  /checkout           # Checkout page
  /order-placed       # Order confirmation page
  /profile            # User profile page
  /sign-in            # Sign in page
  /sign-up            # Sign up page
/assets               # Static assets
/components           # React components
  /auth               # Authentication components
/context              # React context providers
/inngest              # Inngest functions
  /functions          # Event handler functions
/lib                  # Utility functions
/models               # Mongoose models
/test                 # Test scripts
```

## API Routes

- `/api/products` - Product management
- `/api/users/[userId]` - User data management
- `/api/users/[userId]/addresses` - User address management
- `/api/users/[userId]/orders` - User order management
- `/api/orders` - Order management
- `/api/inngest` - Inngest event handling

## Inngest Functions

- `processOrder` - Handles order processing after creation
- `sendOrderConfirmation` - Sends order confirmation emails

## Testing

Follow the test plan in `/test/app-flow.js` to verify the complete application flow.

## Deployment
>>>>>>> e92141b780b12716bd54ceafdf8b28de972bdb06

## Tech Stack

<<<<<<< HEAD
### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **React Hot Toast** - Toast notifications

### Backend
- **Next.js API Routes** - Server-side API
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Cloudinary** - Cloud-based image management
- **Inngest** - Background job processing (optional)

### DevOps
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (Admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (Owner only)
- `DELETE /api/products/[id]` - Delete product (Owner only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### Users
- `GET /api/users` - Get user profile
- `PUT /api/users` - Update user profile
- `DELETE /api/users` - Deactivate account

### Addresses
- `GET /api/addresses` - Get user's addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses` - Update address
- `DELETE /api/addresses` - Delete address

### File Upload
- `POST /api/upload` - Upload image to Cloudinary
- `DELETE /api/upload` - Delete image from Cloudinary

---

## Contributing

We welcome all kinds of contributions! You can:

- Create new pages
- Improve layouts
- Add animations and transitions
- Enhance responsiveness
- Refactor components
- Suggest new UI/UX ideas
- Add themes or color variations
- Introduce accessibility improvements
- Add filtering/search features
- Improve documentation

Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the **MIT License**.

---

## 🌟 Contributors

Thanks to everyone who contributes to **Hanzala.co**!
=======
Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> e92141b780b12716bd54ceafdf8b28de972bdb06
