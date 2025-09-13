'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { getValidImageUrl } from '@/lib/imageUtils';

export default function BannerForm({ banner, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    category: '',
    searchTerm: '',
    featuredProducts: [],
    backgroundImage: null,
    backgroundColor: 'gradient-dark',
    textColor: 'auto',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && data.products) {
          setAvailableProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        buttonText: banner.buttonText || '',
        category: banner.category || '',
        searchTerm: banner.searchTerm || '',
        featuredProducts: banner.featuredProducts || [],
        backgroundImage: banner.backgroundImage || null,
        backgroundColor: banner.backgroundColor || 'gradient-dark',
        textColor: banner.textColor || 'auto',
        isActive: banner.isActive !== false
      });
    }
  }, [banner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/banners';
      const method = banner ? 'PUT' : 'POST';
      
      const requestData = banner 
        ? { ...formData, id: banner._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(banner ? 'Banner updated successfully' : 'Banner created successfully');
        onClose();
      } else {
        toast.error(data.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'audio', label: 'Audio' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'phones', label: 'Phones' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'beauty', label: 'Beauty' }
  ];

  const backgroundOptions = [
    { value: 'gradient-blue', label: 'Blue Gradient', preview: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900' },
    { value: 'gradient-dark', label: 'Dark Gradient', preview: 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' },
    { value: 'gradient-orange', label: 'Orange Gradient', preview: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900 dark:via-red-900 dark:to-pink-900' },
    { value: 'gradient-green', label: 'Green Gradient', preview: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900' },
    { value: 'gradient-purple', label: 'Purple Gradient', preview: 'bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 dark:from-purple-900 dark:via-violet-900 dark:to-pink-900' }
  ];

  const textColorOptions = [
    { value: 'auto', label: 'Auto (Adaptive)' },
    { value: 'light', label: 'Light Text' },
    { value: 'dark', label: 'Dark Text' }
  ];

  const addFeaturedProduct = (productId) => {
    if (formData.featuredProducts.length >= 3) {
      toast.error('Maximum 3 featured products allowed');
      return;
    }
    if (!formData.featuredProducts.includes(productId)) {
      setFormData(prev => ({
        ...prev,
        featuredProducts: [...prev.featuredProducts, productId]
      }));
    }
  };

  const removeFeaturedProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      featuredProducts: prev.featuredProducts.filter(id => id !== productId)
    }));
  };

  const getFeaturedProductDetails = (productId) => {
    return availableProducts.find(p => p._id === productId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {banner ? 'Edit Banner' : 'Create New Banner'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Level Up Your Gaming Experience"
                className="input w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Main heading that will be displayed prominently
              </p>
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner Subtitle *
              </label>
              <textarea
                id="subtitle"
                name="subtitle"
                required
                rows="3"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="e.g., From immersive sound to precise controls—everything you need to win"
                className="input w-full resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supporting text that describes the offer or benefit
              </p>
            </div>

            {/* Button Text */}
            <div>
              <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Button Text *
              </label>
              <input
                type="text"
                id="buttonText"
                name="buttonText"
                required
                value={formData.buttonText}
                onChange={handleChange}
                placeholder="e.g., Buy now, Shop Now, Get Started"
                className="input w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Text that will appear on the call-to-action button
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Category to navigate to when button is clicked
                </p>
              </div>

              {/* Search Term */}
              <div>
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Term
                </label>
                <input
                  type="text"
                  id="searchTerm"
                  name="searchTerm"
                  value={formData.searchTerm}
                  onChange={handleChange}
                  placeholder="e.g., gaming, headphones, macbook"
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Search term for product filtering (optional)
                </p>
              </div>
            </div>

            {/* Featured Products Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Featured Products (Max 3)
              </label>
              
              {/* Selected Products */}
              {formData.featuredProducts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Selected Products:</h4>
                  <div className="flex flex-wrap gap-3">
                    {formData.featuredProducts.map((productId) => {
                      const product = getFeaturedProductDetails(productId);
                      return product ? (
                        <div key={productId} className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-2">
                          <Image
                            src={getValidImageUrl(product.image)}
                            alt={product.name}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                          />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                            {product.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFeaturedProduct(productId)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {/* Product Selector */}
              {formData.featuredProducts.length < 3 && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Products</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.featuredProducts.length}/3 selected
                    </span>
                  </div>
                  
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading products...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                      {availableProducts
                        .filter(product => !formData.featuredProducts.includes(product._id))
                        .slice(0, 20)
                        .map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => addFeaturedProduct(product._id)}
                            className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition group"
                          >
                            <Image
                              src={getValidImageUrl(product.image)}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="rounded object-cover mb-2 group-hover:scale-105 transition-transform"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300 text-center truncate w-full">
                              {product.name}
                            </span>
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              ₹{product.offerPrice || product.price}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Featured products will be displayed prominently in the banner
              </p>
            </div>

            {/* Background & Styling Options */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Design & Styling</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Background Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Style
                  </label>
                  <div className="space-y-2">
                    {backgroundOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundColor"
                          value={option.value}
                          checked={formData.backgroundColor === option.value}
                          onChange={handleChange}
                          className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 focus:ring-orange-500"
                        />
                        <div className="ml-3 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded ${option.preview} border border-gray-300 dark:border-gray-600`}></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color Style
                  </label>
                  <select
                    id="textColor"
                    name="textColor"
                    value={formData.textColor}
                    onChange={handleChange}
                    className="input w-full"
                  >
                    {textColorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Auto adapts to light/dark mode, or choose fixed color
                  </p>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Banner
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only active banners will be displayed on the homepage
            </p>

            {/* Preview Section */}
            {(formData.title || formData.subtitle) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Live Preview
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 text-center">
                  <p className="text-orange-600 dark:text-orange-400 text-sm mb-2 font-medium">
                    Limited Time Offer!
                  </p>
                  {formData.title && (
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {formData.title}
                    </h4>
                  )}
                  {formData.subtitle && (
                    <p className="text-gray-700 dark:text-gray-200 text-sm mb-4">
                      {formData.subtitle}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      type="button"
                      className="bg-orange-600 dark:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                    >
                      {formData.buttonText || 'Button Text'}
                    </button>
                    {(formData.category || formData.searchTerm) && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        → {formData.category || 'category'} / {formData.searchTerm || 'search'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
