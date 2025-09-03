'use client';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import React from 'react';
import Link from 'next/link';

export const SignInButtonComponent = () => {
  return (
    <SignInButton mode="modal">
      <button className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
        Sign In
      </button>
    </SignInButton>
  );
};

export const SignUpButtonComponent = () => {
  return (
    <SignUpButton mode="modal">
      <button className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
        Sign Up
      </button>
    </SignUpButton>
  );
};

export const UserProfile = () => {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="flex items-center gap-4">
      <SignedIn>
        {isSignedIn && (
          <Link href="/profile" className="text-gray-700 hover:text-orange-600 mr-3">
            My Profile
          </Link>
        )}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: '2.5rem',
                height: '2.5rem',
              },
            },
          }}
          afterSignOutUrl="/"
        />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center gap-4">
          <SignInButtonComponent />
          <span className="text-gray-300">|</span>
          <SignUpButtonComponent />
        </div>
      </SignedOut>
    </div>
  );
};