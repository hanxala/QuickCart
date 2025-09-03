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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
