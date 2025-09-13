import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 theme-transition">
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 dark:border-gray-600/30 text-gray-500 dark:text-gray-400">
        <div className="w-4/5">
          <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            Hanzala.co is India's premier e-commerce destination for premium electronics 
            and accessories. Founded by Hanzala Khan, we bring you the latest technology 
            products at competitive prices with fast delivery across India. Experience 
            quality, trust, and exceptional customer service with every purchase.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="#">Home</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Contact us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+91 87796 03467</p>
              <p>hanzalakhan0913@gmail.com</p>
              <p>Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-gray-600 dark:text-gray-400">
        Copyright 2025 © Hanzala.co - Founded by Hanzala Khan. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;