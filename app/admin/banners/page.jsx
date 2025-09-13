'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import BannerForm from '@/components/admin/BannerForm';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banners');
      const data = await response.json();
      
      if (data.success) {
        setBanners(data.banners || []);
      } else {
        toast.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      const response = await fetch(`/api/banners?id=${bannerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBanner(null);
    fetchBanners();
  };

  const handlePreview = (banner) => {
    setPreviewBanner(banner);
  };

  const closePreview = () => {
    setPreviewBanner(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Banner Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your homepage banners and promotional content
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Banner
        </button>
      </div>

      {/* Banners List */}
      {banners.length > 0 ? (
        <div className="space-y-6">
          {banners.map((banner) => (
            <div key={banner._id || banner.order} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {banner.subtitle}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Button:</span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded">
                        {banner.buttonText}
                      </span>
                    </div>
                    
                    {banner.category && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          {banner.category}
                        </span>
                      </div>
                    )}
                    
                    {banner.searchTerm && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Search:</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                          {banner.searchTerm}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        banner.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handlePreview(banner)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    title="Preview"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  
                  {banner._id && (
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No banners yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first banner to start promoting products
          </p>
          <button
            onClick={handleAdd}
            className="btn-primary"
          >
            Create First Banner
          </button>
        </div>
      )}

      {/* Banner Form Modal */}
      {showForm && (
        <BannerForm
          banner={editingBanner}
          onClose={handleFormClose}
        />
      )}

      {/* Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Banner Preview
                </h3>
                <button
                  onClick={closePreview}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              {/* Preview Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center theme-transition">
                <p className="text-orange-600 dark:text-orange-400 mb-2 font-medium">
                  Limited Time Offer!
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {previewBanner.title}
                </h1>
                <p className="text-gray-700 dark:text-gray-200 mb-6">
                  {previewBanner.subtitle}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button className="btn-primary px-8">
                    {previewBanner.buttonText}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    → {previewBanner.category || 'Category'} / {previewBanner.searchTerm || 'Search'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
