'use client';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import React from 'react';

const CartIcon = () => {
  const { router, getCartCount } = useAppContext();
  const cartCount = getCartCount();

  return (
    <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
      <Image src={assets.cart_icon} alt="cart icon" />
      {cartCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount}
        </div>
      )}
    </div>
  );
};

export default CartIcon;