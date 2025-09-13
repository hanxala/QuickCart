import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Banner = () => {
  const { router, products } = useAppContext();
  const [bannerData, setBannerData] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch banner data from admin
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await fetch('/api/banners');
        const data = await response.json();
        
        if (data.success && data.banners && data.banners.length > 0) {
          // Use the first active banner
          const banner = data.banners[0];
          setBannerData(banner);
          
          // Get featured products details if they exist
          if (banner.featuredProducts && banner.featuredProducts.length > 0 && products) {
            const productDetails = banner.featuredProducts
              .map(productId => products.find(p => p._id === productId))
              .filter(Boolean);
            setFeaturedProducts(productDetails);
          }
        } else {
          // Fallback to default banner data
          setBannerData({
            title: "Level Up Your Gaming Experience",
            subtitle: "From immersive sound to precise controls—everything you need to win",
            buttonText: "Buy now",
            category: "gaming",
            searchTerm: "gaming"
          });
        }
      } catch (error) {
        console.error('Error fetching banner data:', error);
        // Fallback to default
        setBannerData({
          title: "Level Up Your Gaming Experience",
          subtitle: "From immersive sound to precise controls—everything you need to win",
          buttonText: "Buy now",
          category: "gaming",
          searchTerm: "gaming"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  const handleBuyNow = () => {
    if (bannerData?.searchTerm) {
      router.push(`/search?q=${encodeURIComponent(bannerData.searchTerm)}`);
    } else if (bannerData?.category) {
      router.push(`/all-products?category=${encodeURIComponent(bannerData.category)}`);
    } else {
      router.push('/all-products');
    }
  };

  // Get background class based on admin selection
  const getBackgroundClass = (bgType) => {
    const backgrounds = {
      'gradient-blue': 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950',
      'gradient-dark': 'bg-gradient-to-br from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-black dark:to-gray-900',
      'gradient-orange': 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950',
      'gradient-green': 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950',
      'gradient-purple': 'bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 dark:from-purple-950 dark:via-violet-950 dark:to-pink-950'
    };
    return backgrounds[bgType] || backgrounds['gradient-dark'];
  };

  // Get text color classes based on admin selection
  const getTextColorClasses = (textColor, bgType) => {
    if (textColor === 'light') {
      return {
        title: 'text-white',
        subtitle: 'text-gray-100',
        badge: 'text-white'
      };
    }
    if (textColor === 'dark') {
      return {
        title: 'text-gray-900',
        subtitle: 'text-gray-700',
        badge: 'text-gray-900'
      };
    }
    // Auto mode - adapts to background
    if (bgType === 'gradient-dark') {
      return {
        title: 'text-white',
        subtitle: 'text-gray-200',
        badge: 'text-white'
      };
    }
    return {
      title: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-700 dark:text-gray-300',
      badge: 'text-gray-900 dark:text-white'
    };
  };

  // Loading state with improved dark mode
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row items-center justify-between lg:pl-20 py-16 lg:py-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 my-16 rounded-2xl overflow-hidden theme-transition shadow-2xl dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full">
          {/* Left side - Main product */}
          <div className="animate-pulse">
            <div className="w-56 h-56 bg-gray-300/70 dark:bg-gray-700/70 rounded-2xl" />
          </div>
          
          {/* Center content */}
          <div className="flex-1 flex flex-col items-center text-center space-y-6 px-4 animate-pulse">
            <div className="h-6 bg-gray-300/70 dark:bg-gray-700/70 rounded-full w-40" />
            <div className="h-12 bg-gray-300/70 dark:bg-gray-700/70 rounded-lg w-80 max-w-full" />
            <div className="h-6 bg-gray-300/70 dark:bg-gray-700/70 rounded w-96 max-w-full" />
            <div className="h-16 bg-gray-300/70 dark:bg-gray-700/70 rounded-full w-48" />
          </div>
          
          {/* Right side - Featured products */}
          <div className="flex gap-4 animate-pulse">
            <div className="w-20 h-20 bg-gray-300/70 dark:bg-gray-700/70 rounded-xl" />
            <div className="w-20 h-20 bg-gray-300/70 dark:bg-gray-700/70 rounded-xl" />
            <div className="w-20 h-20 bg-gray-300/70 dark:bg-gray-700/70 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no banner data
  if (!bannerData) return null;

  const backgroundClass = getBackgroundClass(bannerData.backgroundColor);
  const textColors = getTextColorClasses(bannerData.textColor, bannerData.backgroundColor);

  return (
    <div className={`group/banner relative flex flex-col lg:flex-row items-center justify-between lg:pl-20 py-16 lg:py-20 ${backgroundClass} my-16 rounded-2xl overflow-hidden theme-transition shadow-2xl hover:shadow-3xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent dark:via-white/1 opacity-60" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-400/10 to-red-400/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full">
        
        {/* Left Side - Main Product Display */}
        <div className="relative group/main-product">
          {featuredProducts.length > 0 && featuredProducts[0] ? (
            <div className="relative">
              <Image
                src={getValidImageUrl(featuredProducts[0].image)}
                alt={featuredProducts[0].name}
                width={280}
                height={280}
                className="rounded-2xl object-cover drop-shadow-2xl group-hover/banner:scale-110 transition-transform duration-700 border-4 border-white/20 dark:border-gray-800/30"
              />
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-xl">
                ₹{featuredProducts[0].offerPrice || featuredProducts[0].price}
              </div>
            </div>
          ) : (
            <Image
              className="max-w-72 drop-shadow-2xl group-hover/banner:scale-110 transition-transform duration-700"
              src={assets.jbl_soundbox_image}
              alt="banner_main_product"
            />
          )}
        </div>
        
        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center text-center space-y-6 px-4 lg:px-8">
          {/* Enhanced Offer Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 dark:from-orange-600 dark:via-red-600 dark:to-pink-600 text-white text-sm font-bold uppercase tracking-wider shadow-xl animate-bounce">
            <div className="w-3 h-3 bg-white rounded-full mr-3 animate-ping" />
            <span className="animate-pulse">Limited Time Offer!</span>
            <div className="w-3 h-3 bg-white rounded-full ml-3 animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Enhanced Title with Gradient */}
          <h1 className={`text-3xl lg:text-5xl font-black max-w-[600px] leading-tight ${textColors.title}`}>
            <span className="bg-gradient-to-r from-current via-orange-500 to-current bg-clip-text text-transparent drop-shadow-lg">
              {bannerData.title}
            </span>
          </h1>
          
          {/* Enhanced Subtitle */}
          <p className={`max-w-[500px] font-semibold leading-relaxed text-xl ${textColors.subtitle} drop-shadow-sm`}>
            {bannerData.subtitle}
          </p>
          
          {/* Enhanced CTA Button with Multiple Effects */}
          <div className="pt-4">
            <button 
              onClick={handleBuyNow}
              className="group/btn relative inline-flex items-center justify-center gap-4 px-10 lg:px-16 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 dark:from-orange-600 dark:via-red-600 dark:to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 dark:hover:from-orange-500 dark:hover:via-red-500 dark:hover:to-pink-500 text-white font-black text-xl rounded-full shadow-2xl dark:shadow-orange-900/50 hover:shadow-3xl dark:hover:shadow-orange-900/70 transform hover:scale-110 active:scale-95 transition-all duration-500 overflow-hidden border-2 border-white/20 dark:border-gray-800/20"
            >
              {/* Multiple Shimmer Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent skew-x-12 translate-x-[200%] group-hover/btn:translate-x-[-200%] transition-transform duration-1500" style={{ animationDelay: '0.2s' }} />
              
              <span className="relative z-10 tracking-wider">
                {bannerData.buttonText}
              </span>
              
              <div className="relative z-10 transform group-hover/btn:translate-x-2 group-hover/btn:scale-125 transition-all duration-300">
                <Image 
                  className="w-6 h-6 brightness-0 invert" 
                  src={assets.arrow_icon_white} 
                  alt="arrow" 
                />
              </div>
              
              {/* Pulsing Ring Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
            </button>
          </div>
          
        </div>
        
        {/* Right Side - Featured Products Grid */}
        <div className="relative">
          {featuredProducts.length > 1 ? (
            <div className="flex flex-col gap-4">
              <h3 className={`text-lg font-bold ${textColors.title} mb-2 text-center`}>Also Available</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {featuredProducts.slice(1, 3).map((product, index) => (
                  <div 
                    key={product._id} 
                    className="group/product relative bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/30 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => router.push(`/product/${product._id}`)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Image
                      src={getValidImageUrl(product.image)}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover mx-auto group-hover/product:scale-110 transition-transform duration-300 shadow-lg"
                    />
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-semibold ${textColors.title} truncate`}>
                        {product.name}
                      </p>
                      <p className="text-orange-500 dark:text-orange-400 font-bold text-lg">
                        ₹{product.offerPrice || product.price}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/0 to-orange-500/0 group-hover/product:from-orange-500/10 group-hover/product:to-red-500/10 rounded-xl transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Image
                className="max-w-48 lg:max-w-64 drop-shadow-2xl group-hover/banner:scale-110 transition-transform duration-700"
                src={assets.md_controller_image}
                alt="banner_secondary_product"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Floating Elements */}
      <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-orange-400/20 via-red-400/20 to-pink-400/20 dark:from-orange-500/30 dark:via-red-500/30 dark:to-pink-500/30 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-500/30 dark:via-purple-500/30 dark:to-pink-500/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-yellow-500/20 dark:to-orange-500/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.8s' }} />
    </div>
  );
};

export default Banner;