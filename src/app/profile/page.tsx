// File: src/app/profile/page.tsx
// Component: ProfilePage
// Type: Client Component (user data, settings, verification)
// Dependencies: lucide-react

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Star, Calendar, MapPin, Phone, Mail, Camera, Edit3, Shield, Award, TrendingUp, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

type TabType = 'overview' | 'activity' | 'reviews' | 'settings';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  bio: string;
  location: string;
  joinDate: string;
  
  // Stats
  stats: {
    tasksCompleted: number;
    tasksPosted: number;
    rating: number;
    reviewCount: number;
    responseTime: string;
    completionRate: number;
    earnings: string;
    helpedPeople: number;
  };
  
  // Verification status
  verification: {
    phone: boolean;
    email: boolean;
    identity: boolean;
    backgroundCheck: boolean;
    trustedRunner: boolean;
  };
  
  // Settings
  settings: {
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
    privacy: {
      showLocation: boolean;
      showPhone: boolean;
      showStats: boolean;
    };
    availability: {
      active: boolean;
      maxDistance: number;
      categories: string[];
    };
  };
  
  // Recent activity
  recentTasks: Array<{
    id: string;
    title: string;
    type: 'completed' | 'posted';
    date: string;
    rating?: number;
    perk: string;
    category: string;
  }>;
  
  // Reviews
  reviews: Array<{
    id: string;
    from: string;
    rating: number;
    comment: string;
    date: string;
    taskTitle: string;
  }>;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: ''
  });

  // Mock user data
  const [user, setUser] = useState<UserProfile>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+44 7700 900123',
    bio: 'Reliable helper with 2+ years experience. I specialize in delivery tasks and emergency errands around London. Always punctual and professional!',
    location: 'Camden, London',
    joinDate: 'October 2024',
    
    stats: {
      tasksCompleted: 47,
      tasksPosted: 12,
      rating: 4.8,
      reviewCount: 45,
      responseTime: '8 min',
      completionRate: 96,
      earnings: '£340',
      helpedPeople: 32
    },
    
    verification: {
      phone: true,
      email: true,
      identity: true,
      backgroundCheck: true,
      trustedRunner: true
    },
    
    settings: {
      notifications: {
        push: true,
        email: true,
        sms: false
      },
      privacy: {
        showLocation: true,
        showPhone: false,
        showStats: true
      },
      availability: {
        active: true,
        maxDistance: 10,
        categories: ['delivery', 'shopping', 'transport']
      }
    },
    
    recentTasks: [
      {
        id: '1',
        title: 'Emergency Document Delivery',
        type: 'completed',
        date: '2 hours ago',
        rating: 5,
        perk: '£35 cash',
        category: 'Delivery'
      },
      {
        id: '2',
        title: 'Airport Pickup Service',
        type: 'posted',
        date: '1 day ago',
        perk: '£45 cash',
        category: 'Transport'
      },
      {
        id: '3',
        title: 'Prescription Pickup',
        type: 'completed',
        date: '2 days ago',
        rating: 5,
        perk: '£30 PayPal',
        category: 'Personal Care'
      },
      {
        id: '4',
        title: 'Business Cards Printing',
        type: 'completed',
        date: '3 days ago',
        rating: 4,
        perk: '£25 Amazon card',
        category: 'Business'
      }
    ],
    
    reviews: [
      {
        id: '1',
        from: 'Sarah Johnson',
        rating: 5,
        comment: 'Absolutely fantastic! John delivered my passport to the embassy with 30 minutes to spare. Professional, reliable, and great communication throughout.',
        date: '2 hours ago',
        taskTitle: 'Emergency Document Delivery'
      },
      {
        id: '2',
        from: 'Mike Chen',
        rating: 5,
        comment: 'Quick and efficient pickup from pharmacy. Exactly what I needed when I was stuck at work. Will definitely use again!',
        date: '2 days ago',
        taskTitle: 'Prescription Pickup'
      },
      {
        id: '3',
        from: 'Emma Wilson',
        rating: 4,
        comment: 'Good service for printing business cards. Delivery was on time and quality was great. Minor delay but kept me informed.',
        date: '3 days ago',
        taskTitle: 'Business Cards Printing'
      }
    ]
  });

  const getVerificationBadge = () => {
    if (user.verification.trustedRunner) {
      return { label: 'Trusted Runner', color: 'bg-green-100 text-green-800 border-green-200', icon: Shield };
    } else if (Object.values(user.verification).filter(Boolean).length >= 3) {
      return { label: 'Verified User', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle };
    } else {
      return { label: 'Basic User', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle };
    }
  };

  const handleEdit = () => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      location: user.location
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: '',
      lastName: '',
      bio: '',
      location: ''
    });
  };

  const badge = getVerificationBadge();
  const BadgeIcon = badge.icon;

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: Star },
    { id: 'activity' as const, name: 'Activity', icon: TrendingUp },
    { id: 'reviews' as const, name: 'Reviews', icon: Award },
    { id: 'settings' as const, name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt="Profile" 
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover" 
                  />
                ) : (
                  <span className="text-indigo-600 font-bold text-2xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <Camera size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Last Name"
                    />
                  </div>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Location"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Bio"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                      <BadgeIcon size={14} className="inline mr-1" />
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {user.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Joined {user.joinDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" />
                      {user.stats.rating} ({user.stats.reviewCount} reviews)
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{user.stats.tasksCompleted}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{user.stats.completionRate}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{user.stats.responseTime}</div>
                      <div className="text-xs text-gray-600">Response</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{user.stats.earnings}</div>
                      <div className="text-xs text-gray-600">Earned</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TabIcon size={16} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Verification Status */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Verification Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'phone', label: 'Phone Verified', icon: Phone },
                      { key: 'email', label: 'Email Verified', icon: Mail },
                      { key: 'identity', label: 'ID Verified', icon: CheckCircle },
                      { key: 'backgroundCheck', label: 'Background Check', icon: Shield },
                      { key: 'trustedRunner', label: 'Trusted Runner', icon: Award }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className={`p-4 rounded-lg border ${
                        user.verification[key as keyof typeof user.verification]
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon size={20} className={
                            user.verification[key as keyof typeof user.verification]
                              ? 'text-green-600'
                              : 'text-gray-400'
                          } />
                          <div>
                            <h4 className="font-medium text-gray-900">{label}</h4>
                            <p className={`text-sm ${
                              user.verification[key as keyof typeof user.verification]
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}>
                              {user.verification[key as keyof typeof user.verification] ? 'Verified' : 'Not verified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">Email</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone size={20} className="text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">Phone</h4>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                {user.recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        task.type === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {task.type === 'completed' ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <TrendingUp size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.type === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {task.type === 'completed' ? 'Completed' : 'Posted'}
                          </span>
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{task.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {task.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-sm text-gray-600">{task.rating}</span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-900">{task.perk}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Reviews</h3>
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-yellow-500" />
                    <span className="font-medium text-gray-900">{user.stats.rating}</span>
                    <span className="text-gray-600">({user.stats.reviewCount} reviews)</span>
                  </div>
                </div>
                
                {user.reviews.map((review) => (
                  <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.from}</h4>
                        <p className="text-sm text-gray-600">{review.taskTitle}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'push', label: 'Push Notifications', desc: 'Get notified about new tasks and messages' },
                      { key: 'email', label: 'Email Notifications', desc: 'Receive email updates about your tasks' },
                      { key: 'sms', label: 'SMS Notifications', desc: 'Get text messages for urgent updates' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.settings.notifications[key as keyof typeof user.settings.notifications]}
                            onChange={(e) => setUser(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                notifications: {
                                  ...prev.settings.notifications,
                                  [key]: e.target.checked
                                }
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'showLocation', label: 'Show Location', desc: 'Display your general location to other users' },
                      { key: 'showPhone', label: 'Show Phone Number', desc: 'Allow other users to see your phone number' },
                      { key: 'showStats', label: 'Show Statistics', desc: 'Display your completion stats publicly' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.settings.privacy[key as keyof typeof user.settings.privacy]}
                            onChange={(e) => setUser(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                privacy: {
                                  ...prev.settings.privacy,
                                  [key]: e.target.checked
                                }
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Actions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
                  <div className="space-y-3">
                    <button className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-gray-900">Change Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </button>
                    <button className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-gray-900">Download Data</h4>
                      <p className="text-sm text-gray-600">Get a copy of your TaskForPerks data</p>
                    </button>
                    <button className="w-full p-4 text-left border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm">Permanently delete your account and all data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;