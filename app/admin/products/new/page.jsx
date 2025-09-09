'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { notify } from '@/lib/notifications';

import { productCategories, allCategories, productTemplates } from '@/lib/categories';

const categories = allCategories;

// Product templates are now imported from @/lib/categories

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    category: '',
    stock: '',
    images: ['']
  });
  const [errors, setErrors] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);

  // Apply template based on category
  const applyTemplate = (category) => {
    const template = productTemplates[category] || productTemplates['default'];
    setFormData(prev => ({
      ...prev,
      name: prev.name, // Keep the name if already entered
      description: template.description,
      price: template.price,
      offerPrice: template.offerPrice,
      stock: template.stock,
      category: category
    }));
    notify.success(`✨ Applied ${category} template!`);
    setShowTemplates(false);
  };

  // Enhanced form change handler with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-apply template when category changes
    if (name === 'category' && value && productTemplates[value]) {
      applyTemplate(value);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file, index) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notify.error('❌ Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      notify.error('❌ Image size must be less than 5MB');
      return;
    }

    try {
      notify.loading(`🔄 Uploading image...`, {
        id: 'image-upload-loading',
        duration: Infinity,
      });

      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      const result = await response.json();
      notify.dismiss('image-upload-loading');

      if (response.ok && result.data) {
        handleImageChange(index, result.data.url);
        notify.success('✅ Image uploaded successfully!');
      } else {
        notify.error(`❌ Upload failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      notify.dismiss('image-upload-loading');
      notify.error('❌ Network error during upload');
    }
  };

  // Validate image URL format
  const validateImageUrl = (url) => {
    if (!url || !url.trim()) return true; // Allow empty URLs
    
    const trimmedUrl = url.trim();
    
    // Check for local file paths
    if (trimmedUrl.includes(':\\') || 
        trimmedUrl.includes('Phone Link') ||
        trimmedUrl.startsWith('"') ||
        trimmedUrl.startsWith("'") ||
        trimmedUrl.match(/^[A-Za-z]:\\/)) {
      return false;
    }
    
    // Allow HTTP/HTTPS URLs and data URLs
    return trimmedUrl.startsWith('http') || 
           trimmedUrl.startsWith('data:') || 
           trimmedUrl.startsWith('/');
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    const price = parseFloat(formData.price) || 0;
    const offerPrice = parseFloat(formData.offerPrice) || 0;
    if (price > 0 && offerPrice > 0) {
      return Math.round(((price - offerPrice) / price) * 100);
    }
    return 0;
  };

  // Validate individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 3 ? 'Product name must be at least 3 characters' : '';
      case 'description':
        return value.trim().length < 10 ? 'Description must be at least 10 characters' : '';
      case 'price':
        return parseFloat(value) <= 0 ? 'Price must be greater than 0' : '';
      case 'offerPrice':
        const price = parseFloat(formData.price) || 0;
        const offer = parseFloat(value) || 0;
        if (offer <= 0) return 'Offer price must be greater than 0';
        if (offer > price) return 'Offer price cannot be greater than original price';
        return '';
      case 'category':
        return !value ? 'Please select a category' : '';
      case 'stock':
        return parseInt(value) < 0 ? 'Stock cannot be negative' : '';
      default:
        return '';
    }
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'images') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    // Validate images
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      newErrors.images = 'Please provide at least one product image';
    } else {
      // Check for invalid image URLs
      const invalidImages = validImages.filter(img => !validateImageUrl(img));
      if (invalidImages.length > 0) {
        newErrors.images = `Invalid image URL(s) detected. Please use web URLs (http/https) or upload files directly. Avoid local file paths like "C:\\..." or "D:\\..."`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    
    // Clear image validation error if URL is now valid
    if (validateImageUrl(value) && errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      notify.error('⚠️ Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      // Filter out empty image URLs
      const validImages = formData.images.filter(img => img.trim() !== '');

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        offerPrice: parseFloat(formData.offerPrice),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        image: validImages
      };

      // Show loading message with product name
      notify.loading(`✨ Creating "${productData.name}"...`, {
        id: 'add-product-loading',
        duration: Infinity,
      });
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      notify.dismiss('add-product-loading');
      
      if (response.ok) {
        notify.success(`🎉 "${productData.name}" created successfully!`);
        
        // Show success options
        const addAnother = confirm(
          `🎉 Product created successfully!\n\n"${productData.name}" is now live in your store and ready for customers to purchase!\n\nWould you like to add another product?`
        );
        
        if (addAnother) {
          // Reset form but keep category
          setFormData({
            name: '',
            description: productTemplates[formData.category]?.description || '',
            price: '',
            offerPrice: '',
            category: formData.category,
            stock: '',
            images: ['']
          });
          setErrors({});
          setStep(1);
          notify.info('📋 Ready for next product!');
        } else {
          router.push('/admin/products');
        }
      } else {
        notify.error(`❌ Failed to add product: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      notify.dismiss('add-product-loading');
      notify.error('❌ Network error: Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
            <p className="text-blue-100">
              Create amazing products for your QuickCart store
            </p>
          </div>
          <div className="text-6xl opacity-20">
            📦
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Start Templates</h2>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
          </button>
        </div>
        
        {showTemplates && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => applyTemplate(category.value)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
              >
                <div className="text-2xl mb-2">{category.emoji}</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {category.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                📝 Basic Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter the essential details for your product
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., iPhone 15 Pro Max"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {productCategories.map(group => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Product Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Describe your product features, specifications, and benefits..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                💰 Pricing & Stock
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Set competitive prices and manage inventory
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Original Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="9999.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Offer Price */}
              <div>
                <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price (₹) *
                  {getDiscountPercentage() > 0 && (
                    <span className="ml-2 text-green-600 font-medium text-xs">
                      {getDiscountPercentage()}% OFF
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="offerPrice"
                  name="offerPrice"
                  value={formData.offerPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.offerPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="7999.00"
                />
                {errors.offerPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.offerPrice}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="100"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Leave empty for unlimited stock
                </p>
              </div>
            </div>

            {/* Price Preview */}
            {formData.price && formData.offerPrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Customer will pay:</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{formData.offerPrice}
                      </span>
                      {formData.price !== formData.offerPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ₹{formData.price}
                        </span>
                      )}
                    </div>
                  </div>
                  {getDiscountPercentage() > 0 && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getDiscountPercentage()}% OFF
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                🖼️ Product Images
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Add high-quality images to showcase your product
              </p>
            </div>
            
            <div className="space-y-6">
              {formData.images.map((image, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Image {index + 1}
                    </span>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                        title="Remove this image"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                  
                  {/* File Upload Option */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      📎 Upload Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file, index);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max size: 5MB • Formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                  
                  {/* Manual URL Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      🔗 Or Enter Image URL
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        image && !validateImageUrl(image) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {image && !validateImageUrl(image) && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠️ This looks like a local file path. Please upload the file or use a web URL instead.
                      </p>
                    )}
                  </div>
                  
                  {/* Image Preview */}
                  {image && validateImageUrl(image) && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Preview:</p>
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {errors.images && (
                <p className="text-red-500 text-sm">{errors.images}</p>
              )}
              
              <button
                type="button"
                onClick={addImageField}
                className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
              >
                📎 Add Another Image
              </button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Pro Tips:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• <strong>Upload files directly</strong> for automatic optimization and hosting</li>
                  <li>• Use high-quality images (at least 800x800 pixels)</li>
                  <li>• Show multiple angles of your product</li>
                  <li>• Include detail shots of important features</li>
                  <li>• First image will be the main display image</li>
                  <li>• ⚠️ Avoid local file paths like "C:\\..." - they won't work online</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              ← Cancel
            </button>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-6 py-3 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
              >
                👁️ Preview
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-8 py-3 rounded-lg text-white font-medium transition ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Product...
                  </>
                ) : (
                  <>
                    ✨ Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Preview</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ❌
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {formData.images[0] && (
                  <img
                    src={formData.images[0]}
                    alt="Product preview"
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {formData.name || 'Product Name'}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {formData.description || 'Product description will appear here.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{formData.offerPrice || '0'}
                      </span>
                      {formData.price && formData.price !== formData.offerPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ₹{formData.price}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {formData.stock || 'Unlimited'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
