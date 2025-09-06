'use client'
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-black hover:bg-gray-800 text-sm font-normal',
            card: 'shadow-lg',
          },
        }}
        redirectUrl="/"
      />
    </div>
  );
}
