'use client'
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AddProduct() {
  const { userId, router } = useAppContext();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    price: '',
    offerPrice: '',
    stock: '',
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Books',
    'Toys & Games',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Automotive',
    'Health & Household',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: ['price', 'offerPrice', 'stock'].includes(name) ? parseFloat(value) || '' : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Create preview URLs
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  const uploadImages = async () => {
    if (files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        console.log('📷 Uploading image:', file.name);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Image uploaded successfully:', result.data?.url || result.url);
          
          if (result.data?.isPlaceholder || result.isPlaceholder) {
            toast.info('Using placeholder image (Cloudinary not configured)');
          }
          
          return result.data?.url || result.url;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('❌ Error uploading image:', error);
        toast.error(`Failed to upload ${file.name}`);
        throw error;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('✅ All images uploaded:', uploadedUrls);
      return uploadedUrls;
    } catch (error) {
      console.error('❌ Failed to upload images:', error);
      toast.error('Failed to upload one or more images');
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 Form submitted with data:', product);
    console.log('🖼️ Files selected:', files.length, files.map(f => f.name));

    // Validate form
    for (const key in product) {
      if (!product[key] && key !== 'offerPrice') {
        console.error('❌ Validation failed for field:', key);
        toast.error(`Please enter product ${key}`);
        return;
      }
    }
    
    // Set default stock if not provided
    if (!product.stock) {
      setProduct(prev => ({ ...prev, stock: 0 }));
    }

    if (!product.offerPrice) {
      setProduct(prev => ({ ...prev, offerPrice: product.price }));
    }

    if (files.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    try {
      setLoading(true);

      // Upload images to Cloudinary
      const imageUrls = await uploadImages();

      if (imageUrls.length === 0) {
        toast.error('Failed to upload images');
        setLoading(false);
        return;
      }

      // Create product - try main API first, then fallback
      console.log('📦 Creating product...', product);
      
      let response;
      let data;
      let usedFallback = false;
      
      try {
        // Try main products API first
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...product,
            userId: userId || user?.id || 'fallback-user',
            image: imageUrls,
          }),
        });
        
        data = await response.json();
        
        if (!data.success) {
          console.log('⚠️ Main products API failed, trying fallback...');
          
          // Try fallback API
          response = await fetch('/api/products/fallback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...product,
              userId: userId || user?.id || 'fallback-user',
              image: imageUrls,
            }),
          });
          
          data = await response.json();
          usedFallback = true;
        }
        
      } catch (error) {
        console.log('⚠️ Main API error, trying fallback...', error);
        
        // Try fallback API on any error
        try {
          response = await fetch('/api/products/fallback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...product,
              userId: userId || user?.id || 'fallback-user',
              image: imageUrls,
            }),
          });
          
          data = await response.json();
          usedFallback = true;
        } catch (fallbackError) {
          throw new Error('Both main and fallback APIs failed');
        }
      }

      if (data.success) {
        const message = usedFallback 
          ? 'Product added successfully (using fallback storage)'
          : 'Product added successfully';
        toast.success(message);
        router.push('/admin/products');
      } else {
        console.error('❌ Product creation failed:', data);
        toast.error(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
                placeholder="Enter product description"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={product.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price ($)</label>
                <input
                  type="number"
                  name="offerPrice"
                  value={product.offerPrice}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="product-images"
                accept="image/*"
              />
              <label
                htmlFor="product-images"
                className="cursor-pointer block w-full text-center"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-gray-600">
                  Click to upload product images
                </span>
              </label>

              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover w-full h-24 rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        onClick={() => {
                          setImageUrls(imageUrls.filter((_, i) => i !== index));
                          setFiles(files.filter((_, i) => i !== index));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-orange-300"
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}