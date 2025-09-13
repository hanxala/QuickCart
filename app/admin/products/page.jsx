'use client';

import { useEffect, useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { notify } from '@/lib/notifications';
import { getValidImageUrl } from '@/lib/imageUtils';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [bulkLoading, setBulkLoading] = useState(false);

  const categories = ['Laptop', 'Smartphone', 'Headphone', 'Earphone', 'Camera', 'Accessories'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || product.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle different data types
      if (sortField === 'price' || sortField === 'offerPrice' || sortField === 'stock') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, filterCategory, sortField, sortDirection]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sorting functions
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection functions
  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  // Single product deletion
  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p._id === productId);
    const productName = product ? product.name : 'this product';
    
    if (!confirm(`🗑️ Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      notify.loading(`🔄 Deleting "${productName}"...`, {
        id: 'delete-product-loading',
        duration: Infinity,
      });
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      notify.dismiss('delete-product-loading');

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        setSelectedProducts(prev => prev.filter(id => id !== productId));
        notify.success(`✅ "${productName}" deleted successfully!`);
      } else {
        notify.error(`❌ Failed to delete product: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      notify.dismiss('delete-product-loading');
      notify.error('❌ Network error: Failed to delete product.');
    }
  };

  // Bulk deletion
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      notify.error('Please select products to delete');
      return;
    }

    const productNames = products
      .filter(p => selectedProducts.includes(p._id))
      .map(p => p.name)
      .join(', ');

    if (!confirm(`🗑️ Are you sure you want to delete ${selectedProducts.length} product(s)?\n\nProducts: ${productNames}\n\nThis action cannot be undone!`)) {
      return;
    }

    setBulkLoading(true);
    let deleted = 0;
    let failed = 0;

    try {
      notify.loading(`🔄 Deleting ${selectedProducts.length} products...`, {
        id: 'bulk-delete-loading',
        duration: Infinity,
      });

      for (const productId of selectedProducts) {
        try {
          const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            deleted++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      notify.dismiss('bulk-delete-loading');
      
      if (deleted > 0) {
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
      }

      if (failed === 0) {
        notify.success(`✅ Successfully deleted ${deleted} products!`);
      } else {
        notify.error(`⚠️ Deleted ${deleted} products, ${failed} failed.`);
      }
    } catch (error) {
      notify.dismiss('bulk-delete-loading');
      notify.error('❌ Bulk deletion failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortField('createdAt');
    setSortDirection('desc');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {products.length} total products • {filteredProducts.length} showing
            {selectedProducts.length > 0 && ` • ${selectedProducts.length} selected`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {products.filter(p => (p.stock || 0) > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {products.filter(p => (p.stock || 0) === 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(products.map(p => p.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FunnelIcon className="h-5 w-5 mr-2 inline" />
            Filters
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort Field */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>

            {/* Sort Direction */}
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center justify-center"
            >
              {sortDirection === 'asc' ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center justify-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
              >
                {bulkLoading ? 'Deleting...' : `Delete Selected (${selectedProducts.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m0 0l-2-2m2 2l2-2M4 13l2-2m0 0l2-2m-2 2l-2-2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first product.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="p-6">
            {/* Select All */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  Select all ({filteredProducts.length})
                </span>
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm transition ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Products Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleSelectProduct(product._id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-gray-700"
                        />
                      </div>
                      
                      {/* Stock Status Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        {(product.stock || 0) === 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Out of Stock
                          </span>
                        ) : (product.stock || 0) <= 5 ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Low Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            In Stock ({product.stock})
                          </span>
                        )}
                      </div>
                      
                      <Image
                        className="w-full h-48 object-cover"
                        src={getValidImageUrl(product.image, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjAgODBDMTM2LjU2OSA4MCAxNTAgOTMuNDMxNSAxNTAgMTEwQzE1MCAxMjYuNTY5IDEzNi41NjkgMTQwIDEyMCAxNDBDMTAzLjQzMSAxNDAgOTAgMTI2LjU2OSA5MCAxMTBDOTAgOTMuNDMxNSAxMDMuNDMxIDgwIDEyMCA4MFoiIGZpbGw9IiM5QjlCOUIiLz4KPHBhdGggZD0iTTEyMCAxMTBDMTIzLjMxNCAxMTAgMTI2IDEwNy4zMTQgMTI2IDEwNEMxMjYgMTAwLjY4NiAxMjMuMzE0IDk4IDEyMCA5OEMxMTYuNjg2IDk4IDExNCAxMDAuNjg2IDExNCAxMDRDMTE0IDEwNy4zMTQgMTE2LjY4NiAxMTAgMTIwIDExMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==')}
                        alt={product.name}
                        width={300}
                        height={200}
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          ₹{product.offerPrice}
                          {product.price !== product.offerPrice && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/product/${product._id}`}
                          className="flex-1 px-3 py-2 text-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="flex-1 px-3 py-2 text-center text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 transition">
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleSelectProduct(product._id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-4 w-4 mr-4"
                      />
                      <div className="flex-shrink-0 h-16 w-16 mr-4">
                        <Image
                          className="h-16 w-16 rounded-lg object-cover"
                          src={getValidImageUrl(product.image, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyNkMzMC40MTgzIDI2IDM0IDI5LjU4MTcgMzQgMzRDMzQgMzguNDE4MyAzMC40MTgzIDQyIDI2IDQyQzIxLjU4MTcgNDIgMTggMzguNDE4MyAxOCAzNEMxOCAyOS41ODE3IDIxLjU4MTcgMjYgMjYgMjZaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNiAzNEMyNi44ODQgMzQgMjcuNiAzMy4zMjggMjcuNiAzMi40QzI3LjYgMzEuNDcyIDI2Ljg4NCAzMC44IDI2IDMwLjhDMjUuMTE2IDMwLjggMjQuNCAzMS40NzIgMjQuNCAzMi40QzI0LjQgMzMuMzI4IDI1LjExNiAzNCAyNiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==')}
                          alt={product.name}
                          width={64}
                          height={64}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {product.category} • Created {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                ₹{product.offerPrice}
                                {product.price !== product.offerPrice && (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                                    ₹{product.price}
                                  </span>
                                )}
                              </span>
                              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                                (product.stock || 0) === 0 
                                  ? 'bg-red-100 text-red-800'
                                  : (product.stock || 0) <= 5
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {(product.stock || 0) === 0 
                                  ? 'Out of Stock' 
                                  : `Stock: ${product.stock}`
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/product/${product._id}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="View Product"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="Edit Product"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete Product"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
