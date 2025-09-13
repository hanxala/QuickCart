'use client'
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

const Cart = () => {

  const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 dark:border-gray-400/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500 dark:text-gray-400">
              Your <span className="font-medium text-orange-600 dark:text-orange-400">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80 dark:text-gray-400/80">{getCartCount()} Items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 dark:text-gray-400 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 dark:text-gray-400 font-medium">
                    Price
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 dark:text-gray-400 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 dark:text-gray-400 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cartItems).map((itemId) => {
                  const product = products.find(product => product._id === itemId);

                  if (!product || cartItems[itemId] <= 0) return null;

                  return (
                    <tr key={itemId}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-700 p-2 border border-gray-200 dark:border-gray-600">
                            <Image
                              src={product.image?.[0] || product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyNkMzMC40MTgzIDI2IDM0IDI5LjU4MTcgMzQgMzRDMzQgMzguNDE4MyAzMC40MTgzIDQyIDI2IDQyQzIxLjU4MTcgNDIgMTggMzguNDE4MyAxOCAzNEMxOCAyOS41ODE3IDIxLjU4MTcgMjYgMjYgMjZaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNiAzNEMyNi44ODQgMzQgMjcuNiAzMy4zMjggMjcuNiAzMi40QzI3LjYgMzEuNDcyIDI2Ljg4NCAzMC44IDI2IDMwLjhDMjUuMTE2IDMwLjggMjQuNCAzMS40NzIgMjQuNCAzMi40QzI0LjQgMzMuMzI4IDI1LjExNiAzNCAyNiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='}
                              alt={product.name}
                              className="w-16 h-auto object-cover"
                              width={1280}
                              height={720}
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 dark:text-orange-400 mt-1 hover:text-orange-700 dark:hover:text-orange-300 transition"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{product.name}</p>
                          <button
                            className="text-xs text-orange-600 dark:text-orange-400 mt-1 hover:text-orange-700 dark:hover:text-orange-300 transition"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600 dark:text-gray-400 font-medium">₹{product.offerPrice || product.price || 0}</td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button onClick={() => updateCartQuantity(product._id, cartItems[itemId] - 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition">
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              className="w-4 h-4 dark:brightness-200"
                            />
                          </button>
                          <input onChange={e => updateCartQuantity(product._id, Number(e.target.value))} type="number" value={cartItems[itemId]} className="w-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center appearance-none rounded focus:outline-none focus:ring-2 focus:ring-orange-500"></input>
                          <button onClick={() => addToCart(product._id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition">
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4 dark:brightness-200"
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600 dark:text-gray-400 font-semibold">₹{((product.offerPrice || product.price || 0) * cartItems[itemId]).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={()=> router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition">
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Continue Shopping
          </button>
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
