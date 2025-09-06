import toast from 'react-hot-toast';

// Custom notification utility for consistent styling and better UX
export const notify = {
  // Success notifications
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#10B981',
      },
      ...options,
    });
  },

  // Error notifications
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#EF4444',
      },
      ...options,
    });
  },

  // Warning notifications
  warning: (message, options = {}) => {
    return toast.error(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#F59E0B',
        color: 'white',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#F59E0B',
      },
      ...options,
    });
  },

  // Loading notifications
  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: 'white',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '8px',
      },
      ...options,
    });
  },

  // Dismiss notification
  dismiss: (id) => {
    return toast.dismiss(id);
  },

  // Custom notification with product details
  productAdded: (productName, price) => {
    return notify.success(
      `✅ Product "${productName}" added successfully!\n💰 Price: ₹${price}`,
      {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          fontWeight: '600',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        }
      }
    );
  },

  productDeleted: (productName) => {
    return notify.success(
      `🗑️ Product "${productName}" deleted successfully!`,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          color: 'white',
          fontWeight: '600',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
        }
      }
    );
  }
};
