'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

const AdminNotifications = () => {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const eventSourceRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Connect to SSE endpoint
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/admin/notifications');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setConnectionStatus('Connected');
          console.log('✅ Connected to admin notifications');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'heartbeat') {
              return; // Ignore heartbeat messages
            }

            if (data.type === 'connected') {
              console.log('📡 SSE Connection established');
              return;
            }

            // Add new notification
            setNotifications(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 notifications

            // Show browser notification if permission granted
            if (Notification.permission === 'granted' && data.type !== 'connected') {
              new Notification(data.title, {
                body: data.message,
                icon: '/favicon.ico',
                tag: data.id
              });
            }

            console.log('🔔 New notification:', data);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          setIsConnected(false);
          setConnectionStatus('Error - Reconnecting...');
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectSSE();
            }
          }, 5000);
        };

        eventSource.onclose = () => {
          setIsConnected(false);
          setConnectionStatus('Disconnected');
          console.log('❌ SSE Connection closed');
        };

      } catch (error) {
        console.error('Failed to connect to notifications:', error);
        setConnectionStatus('Connection Failed');
      }
    };

    connectSSE();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isLoaded, user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '🛒';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'user': return '👤';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'error': return 'bg-red-100 border-red-300 text-red-800';
      case 'success': return 'bg-green-100 border-green-300 text-green-800';
      case 'user': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'info': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        title="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Live Notifications</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">{connectionStatus}</span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No notifications yet</p>
                <p className="text-sm">You'll see real-time updates here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <div key={notification.id || index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Additional data */}
                        {notification.data && Object.keys(notification.data).length > 0 && (
                          <div className="mt-2">
                            {notification.data.orderId && (
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                                Order #{notification.data.orderId.slice(-8)}
                              </span>
                            )}
                            {notification.data.amount && (
                              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-2">
                                ₹{notification.data.amount}
                              </span>
                            )}
                            {notification.data.stock !== undefined && (
                              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                Stock: {notification.data.stock}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearNotifications}
                className="w-full text-sm text-gray-600 hover:text-gray-800 py-1"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
