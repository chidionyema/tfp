// File: src/app/dashboard/page.tsx
// Updated Dashboard using TaskFilters and TaskCard components

"use client";

import React, { useState } from 'react';
import { Plus, ChevronRight, TrendingUp, Users, DollarSign, Activity, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/ui/NotificationBell';
import { TrustedRunnerBadge } from '@/components/ui/UserVerificationBadge';
import TaskFilters from '@/components/task/TaskFilters';
import TaskCard from '@/components/task/TaskCard';
import { Task } from '@/lib/types';

interface UserStats {
  tasksCompleted: number;
  rating: number;
  reviewCount: number;
  joinDate: string;
  responseTime: string;
  earnings: string;
  helpedPeople: number;
}

const DashboardPage = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'requester' | 'helper'>('helper');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [locationFilter, setLocationFilter] = useState('5km');

  // Mock user stats
  const userStats: UserStats = {
    tasksCompleted: 47,
    rating: 4.8,
    reviewCount: 45,
    joinDate: 'Oct 2024',
    responseTime: '8 min',
    earnings: '£340',
    helpedPeople: 32
  };

  // Mock tasks data - converted to match Task interface from types
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Emergency Document Delivery',
      description: 'Need passport collected from home and delivered to embassy before 3PM today.',
      location: 'Camden, London • 1.2 km',
      category: 'delivery',
      urgency: 'emergency',
      status: 'open',
      createdAt: '2024-01-15T10:30:00Z',
      estimatedDuration: '45 min',
      requesterId: 'user1',
      perks: [{
        id: 'p1',
        type: 'cash',
        value: 35,
        description: '£35 cash',
        tier: 1,
        successRate: 98,
        availability: 'instant'
      }, {
        id: 'p2',
        type: 'gift_card',
        value: 40,
        description: '£40 Amazon card',
        tier: 1,
        successRate: 96,
        availability: 'instant'
      }],
      tier: 1,
      successRate: 96
    },
    {
      id: '2',
      title: 'Laptop Charger Emergency',
      description: 'MacBook Pro charger needed urgently for client presentation. Specific model required.',
      location: 'Canary Wharf, London • 2.1 km',
      category: 'shopping',
      urgency: 'high',
      status: 'open',
      createdAt: '2024-01-15T09:45:00Z',
      estimatedDuration: '30 min',
      requesterId: 'user2',
      perks: [{
        id: 'p3',
        type: 'cash',
        value: 25,
        description: '£25 PayPal',
        tier: 1,
        successRate: 94,
        availability: 'instant'
      }],
      tier: 1,
      successRate: 94
    },
    {
      id: '3',
      title: 'Prescription Pickup & Delivery',
      description: 'Collect prescription from Boots pharmacy and deliver to office in Westminster.',
      location: 'Westminster, London • 3.5 km',
      category: 'personal',
      urgency: 'medium',
      status: 'open',
      createdAt: '2024-01-15T09:00:00Z',
      estimatedDuration: '40 min',
      requesterId: 'user3',
      perks: [{
        id: 'p4',
        type: 'cash',
        value: 30,
        description: '£30 cash',
        tier: 2,
        successRate: 92,
        availability: 'instant'
      }],
      tier: 2,
      successRate: 92
    },
    {
      id: '4',
      title: 'Airport Pickup Service',
      description: 'Flight landing at Heathrow T5 at 4:30PM. Need reliable pickup to Central London.',
      location: 'Heathrow Airport • 35 km',
      category: 'transport',
      urgency: 'high',
      status: 'open',
      createdAt: '2024-01-15T08:30:00Z',
      estimatedDuration: '90 min',
      requesterId: 'user4',
      perks: [{
        id: 'p5',
        type: 'cash',
        value: 40,
        description: '£40 cash',
        tier: 2,
        successRate: 93,
        availability: 'instant'
      }],
      tier: 2,
      successRate: 93
    }
  ];

  const myActiveTasks = [
    {
      id: 'active1',
      title: 'Business Cards Printing',
      status: 'in_progress',
      helper: 'Sarah M.',
      timeRemaining: '25 min',
      perk: '£30 PayPal'
    },
    {
      id: 'active2', 
      title: 'Grocery Shopping',
      status: 'accepted',
      helper: 'Mike R.',
      timeRemaining: '45 min',
      perk: '£35 Amazon card'
    }
  ];

  // Navigation handlers
  const handlePostNewTask = () => {
    router.push('/tasks/create');
  };

  const handleViewMessages = () => {
    router.push('/messages');
  };

  const handleViewEarnings = () => {
    router.push('/profile/earnings');
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const handleClaimTask = (task: Task) => {
    alert(`Demo: Claiming task "${task.title}"\n\nIn the real app, this would:\n• Open negotiation interface\n• Start real-time chat\n• Set up task tracking`);
    // In real app: router.push(`/tasks/${task.id}/negotiate`);
  };

  const handleActiveTaskClick = (taskId: string) => {
    // Navigate to task tracking page
    router.push(`/tasks/${taskId}/track`);
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'all' || task.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-indigo-600">TaskForPerks</h1>
              
              {/* Demo Mode Indicator */}
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                🚀 DEMO MODE
              </div>
              
              {/* Role Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserRole('helper')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    userRole === 'helper' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Find Tasks
                </button>
                <button
                  onClick={() => setUserRole('requester')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    userRole === 'requester' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  My Tasks
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-medium text-sm">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {userRole === 'requester' ? (
              /* Requester View */
              <div>
                {/* Post New Task CTA */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-6 text-white mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Need help with something?</h2>
                      <p className="opacity-90">Post a task and get it done in minutes with our optimized perk system</p>
                    </div>
                    <button 
                      onClick={handlePostNewTask}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Post New Task
                    </button>
                  </div>
                </div>

                {/* Active Tasks */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Active Tasks</h3>
                  {myActiveTasks.length > 0 ? (
                    <div className="space-y-4">
                      {myActiveTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleActiveTaskClick(task.id)}
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">Helper: {task.helper}</p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                            </div>
                            <p className="text-sm text-gray-600">{task.timeRemaining} remaining</p>
                            <p className="text-sm font-medium text-gray-900">{task.perk}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No active tasks. Post your first task to get started!</p>
                      <button 
                        onClick={handlePostNewTask}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Post Your First Task
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Task &quot;Document Delivery&quot; completed by Sarah M.</span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New helper interest in &quot;Airport Pickup&quot;</span>
                      <span className="text-xs text-gray-500">4 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Payment processed for &quot;Grocery Shopping&quot;</span>
                      <span className="text-xs text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Helper View - Now using reusable components */
              <div>
                {/* Quick Actions Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={handleViewMessages}
                      className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="text-green-600" size={20} />
                        </div>
                        <span className="font-medium text-green-900">View Messages</span>
                      </div>
                      <ChevronRight className="text-green-600" size={16} />
                    </button>
                    
                    <button 
                      onClick={handleViewEarnings}
                      className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="text-purple-600" size={20} />
                        </div>
                        <span className="font-medium text-purple-900">View Earnings</span>
                      </div>
                      <ChevronRight className="text-purple-600" size={16} />
                    </button>

                    <button 
                      onClick={() => router.push('/profile')}
                      className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Star className="text-blue-600" size={20} />
                        </div>
                        <span className="font-medium text-blue-900">My Profile</span>
                      </div>
                      <ChevronRight className="text-blue-600" size={16} />
                    </button>
                  </div>
                </div>

                {/* Task Filters - Now using reusable component */}
                <TaskFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedUrgency={selectedUrgency}
                  onUrgencyChange={setSelectedUrgency}
                  locationFilter={locationFilter}
                  onLocationChange={setLocationFilter}
                  taskCount={filteredTasks.length}
                />

                {/* Available Tasks - Now using TaskCard components */}
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task.id)}
                      onClaim={() => handleClaimTask(task)}
                      showClaimButton={true}
                    />
                  ))}
                  
                  {filteredTasks.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                      <div className="text-gray-400 mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all'
                          ? 'Try adjusting your search filters.'
                          : 'New tasks are posted every few minutes. Check back soon!'
                        }
                      </p>
                      {(searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setSelectedUrgency('all');
                          }}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">JD</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">John Doe</h3>
                  <TrustedRunnerBadge stats={userStats} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userStats.tasksCompleted}</div>
                  <div className="text-xs text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userStats.rating}</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Earnings:</span>
                  <span className="font-medium">{userStats.earnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{userStats.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">People Helped:</span>
                  <span className="font-medium">{userStats.helpedPeople}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Opportunities</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">12 Emergency Tasks</div>
                    <div className="text-xs text-gray-600">High-value perks available</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">£850+ Available</div>
                    <div className="text-xs text-gray-600">In cash perks near you</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">94% Success Rate</div>
                    <div className="text-xs text-gray-600">For Tier 1-2 perks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Earnings */}
            {userRole === 'helper' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Earnings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Document Delivery</span>
                    <span className="font-medium text-green-600">£35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tech Rescue</span>
                    <span className="font-medium text-green-600">£25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prescription Pickup</span>
                    <span className="font-medium text-green-600">£30</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-medium">
                      <span>This Week:</span>
                      <span className="text-green-600">£180</span>
                    </div>
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

export default DashboardPage;