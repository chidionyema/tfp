// File: src/components/ui/NotificationBell.tsx
// Component: NotificationBell
// Type: Client Component (uses useState, onClick handlers)
// Dependencies: lucide-react

"use client";

import React, { useState } from 'react';
import { Bell, X, Clock, MapPin, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface Notification {
  id: number;
  type: 'task_accepted' | 'new_offer' | 'task_completed' | 'helper_nearby' | 'payment_reminder';
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

interface NotificationBellProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className = "",
  onNotificationClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'task_accepted',
      title: 'Task Accepted!',
      message: 'Sarah accepted your document delivery task',
      timestamp: '2 min ago',
      unread: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'new_offer',
      title: 'New Counter-Offer',
      message: 'Someone offered £25 cash instead of your AirPods',
      timestamp: '5 min ago',
      unread: true,
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'task_completed',
      title: 'Task Completed',
      message: 'Your grocery delivery has been completed',
      timestamp: '1 hour ago',
      unread: false,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 4,
      type: 'helper_nearby',
      title: 'Helper Nearby',
      message: 'Marcus is 2 minutes away from pickup location',
      timestamp: '2 hours ago',
      unread: false,
      icon: MapPin,
      color: 'text-indigo-600'
    },
    {
      id: 5,
      type: 'payment_reminder',
      title: 'Payment Due',
      message: 'Don\'t forget to provide the agreed perk to your helper',
      timestamp: '3 hours ago',
      unread: false,
      icon: AlertTriangle,
      color: 'text-amber-600'
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    onNotificationClick?.(notification);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 top-12 w-80 max-w-sm bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent 
                          size={20} 
                          className={`mt-0.5 ${notification.color}`} 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              notification.unread ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {notification.timestamp}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;