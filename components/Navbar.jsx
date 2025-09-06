"use client"
import React from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import UserProfileDropdown from './UserProfileDropdown';
import { useState, useRef, useEffect } from 'react';
import { getValidImageUrl } from '@/lib/imageUtils';

const Navbar = () => {

  const { router, getCartCount, products } = useAppContext();
  const { isSignedIn } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const searchRef = useRef(null);
  const mobileNavRef = useRef(null);

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results
    
    setSearchResults(filteredProducts);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Close search and mobile nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setShowMobileNav(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/about" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-gray-900 transition">
          Contact
        </Link>
      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        {/* Search functionality */}
        <div className="relative" ref={searchRef}>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="hover:opacity-70 transition"
          >
            <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
          </button>
          
          {showSearch && (
            <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg p-4 w-80 z-50">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
              </form>
              
              {searchResults.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-500 mb-2">Quick Results:</p>
                  {searchResults.map((product) => (
                    <div 
                      key={product._id}
                      onClick={() => {
                        router.push(`/product/${product._id}`);
                        setShowSearch(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <Image 
                        src={getValidImageUrl(product.image, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkMyMC40MTgzIDE2IDI0IDE5LjU4MTcgMjQgMjRDMjQgMjguNDE4MyAyMC40MTgzIDMyIDE2IDMyQzExLjU4MTcgMzIgOCAyOC40MTgzIDggMjRDOCAxOS41ODE3IDExLjU4MTcgMTYgMTYgMTZaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0xNiAyNEMxNi44ODQgMjQgMTcuNiAyMy4zMjggMTcuNiAyMi40QzE3LjYgMjEuNDcyIDE2Ljg4NCAyMC44IDE2IDIwLjhDMTUuMTE2IDIwLjggMTQuNCAyMS40NzIgMTQuNCAyMi40QzE0NCAyMy4zMjggMTUuMTE2IDI0IDE2IDI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+')}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">${product.offerPrice}</p>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full mt-2 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                  >
                    View all results
                  </button>
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && (
                <p className="text-sm text-gray-500 mt-3">No products found</p>
              )}
            </div>
          )}
        </div>
        
        {/* Cart Icon */}
        {isSignedIn && (
          <Link href="/cart" className="relative">
            <Image src={assets.cart_icon} alt="cart icon" className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
        )}
        
        {/* Authentication */}
        {isSignedIn ? (
          <UserProfileDropdown />
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton>
              <button className="text-sm hover:text-gray-900 transition">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </ul>

      {/* Mobile Menu */}
      <div className="flex items-center md:hidden gap-3" ref={mobileNavRef}>
        {/* Mobile Cart */}
        {isSignedIn && (
          <Link href="/cart" className="relative">
            <Image src={assets.cart_icon} alt="cart icon" className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
        )}
        
        {/* Mobile Authentication */}
        {isSignedIn ? (
          <UserProfileDropdown />
        ) : null}
        
        {/* Hamburger Menu Button */}
        <button 
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${showMobileNav ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${showMobileNav ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${showMobileNav ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </div>
        </button>
        
        {/* Mobile Navigation Menu */}
        {showMobileNav && (
          <div className="absolute top-16 right-0 bg-white border rounded-lg shadow-xl p-6 w-64 z-50">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                onClick={() => setShowMobileNav(false)}
                className="text-gray-700 hover:text-orange-600 font-medium py-2 border-b border-gray-100 transition"
              >
                Home
              </Link>
              <Link 
                href="/all-products" 
                onClick={() => setShowMobileNav(false)}
                className="text-gray-700 hover:text-orange-600 font-medium py-2 border-b border-gray-100 transition"
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                onClick={() => setShowMobileNav(false)}
                className="text-gray-700 hover:text-orange-600 font-medium py-2 border-b border-gray-100 transition"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setShowMobileNav(false)}
                className="text-gray-700 hover:text-orange-600 font-medium py-2 border-b border-gray-100 transition"
              >
                Contact
              </Link>
              
              {!isSignedIn && (
                <div className="pt-4 space-y-3">
                  <SignInButton>
                    <button 
                      onClick={() => setShowMobileNav(false)}
                      className="w-full text-center py-2 text-gray-700 hover:text-orange-600 font-medium transition"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button 
                      onClick={() => setShowMobileNav(false)}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium transition"
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;