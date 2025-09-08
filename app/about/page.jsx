'use client'
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { assets } from '@/assets/assets';
import Image from 'next/image';

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About Hanzala.co
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner in online shopping, bringing you the best products 
            at unbeatable prices with lightning-fast delivery.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2024, Hanzala.co emerged from a simple idea: online shopping should be
              quick, reliable, and enjoyable. We started as a small team of passionate entrepreneurs 
              who believed that everyone deserves access to quality products without the hassle.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Today, we've grown into a comprehensive e-commerce platform serving thousands of 
              customers worldwide, but our core values remain unchanged: customer satisfaction, 
              product quality, and exceptional service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From electronics to fashion, home essentials to gaming gear, we curate every 
              product with care to ensure you get the best value for your money.
            </p>
          </div>
          <div className="relative">
            <div className="bg-orange-100 rounded-lg p-8 text-center">
              <div className="w-24 h-24 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl text-white">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Customer First Approach
              </h3>
              <p className="text-gray-600">
                Every decision we make is centered around enhancing your shopping experience
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Speed & Efficiency</h3>
              <p className="text-gray-600">
                Lightning-fast delivery and streamlined shopping experience to save your valuable time.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                Every product is carefully vetted to meet our high standards of quality and reliability.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Support</h3>
              <p className="text-gray-600">
                24/7 dedicated support team ready to assist you with any questions or concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-orange-600 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-orange-600 mb-2">5K+</h3>
              <p className="text-gray-600">Products</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-orange-600 mb-2">50+</h3>
              <p className="text-gray-600">Cities</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-orange-600 mb-2">99%</h3>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">MH</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Mohammad Hanzala</h3>
              <p className="text-gray-600">Founder & CEO</p>
              <p className="text-sm text-gray-500 mt-2">
                Visionary leader with a passion for innovation
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">QC</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Hanzala.co Team</h3>
              <p className="text-gray-600">Development Team</p>
              <p className="text-sm text-gray-500 mt-2">
                Dedicated developers building the future of e-commerce
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">CS</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Customer Success</h3>
              <p className="text-gray-600">Support Team</p>
              <p className="text-sm text-gray-500 mt-2">
                Always here to help and ensure your satisfaction
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers and discover amazing deals today!
          </p>
          <button 
            onClick={() => window.location.href = '/all-products'}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
          >
            Explore Products
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
