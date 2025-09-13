import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { getValidImageUrl } from '@/lib/imageUtils';

const ProductCard = ({ product }) => {

    const { currency, router } = useAppContext()

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer group/card"
        >
            <div className="cursor-pointer group relative bg-gray-100 dark:bg-gray-800 rounded-lg w-full h-52 flex items-center justify-center theme-transition group-hover/card:shadow-lg dark:group-hover/card:shadow-gray-900/30">
                <Image
                    src={getValidImageUrl(product.image)}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                <button className="absolute top-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                    <Image
                        className="h-3 w-3 dark:brightness-200"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate text-gray-900 dark:text-gray-100">{product.name}</p>
            <p className="w-full text-xs text-gray-500 dark:text-gray-400 max-sm:hidden truncate">{product.description}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs text-gray-700 dark:text-gray-300">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3 dark:brightness-200"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">{currency}{product.offerPrice || product.price || 0}</p>
                <button className="max-sm:hidden px-4 py-1.5 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-full text-xs hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition">
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard