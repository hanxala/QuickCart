'use client'
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignUp 
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
