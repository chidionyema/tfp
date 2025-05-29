// File: src/app/dashboard/page.tsx
// Mobile-First Dashboard using TaskFilters and TaskCard components

"use client";

import React, { useState } from 'react';
import { Plus, ChevronRight, TrendingUp, Users, DollarSign, Activity, Star, Menu, X, Search, Filter } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Demo indicator */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-indigo-600">TaskForPerks</h1>
              <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                DEMO
              </div>
            </div>

            {/* Right side - Menu and Notifications */}
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Role Toggle - Mobile */}
          <div className="flex bg-gray-100 rounded-lg p-1 mt-3">
            <button
              onClick={() => setUserRole('helper')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                userRole === 'helper' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Find Tasks
            </button>
            <button
              onClick={() => setUserRole('requester')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                userRole === 'requester' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              My Tasks
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Stats - Mobile */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
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
                    <div className="text-xl font-bold text-gray-900">{userStats.tasksCompleted}</div>
                    <div className="text-xs text-gray-600">Tasks Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{userStats.rating}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Earnings:</span>
                    <span className="font-medium">{userStats.earnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response:</span>
                    <span className="font-medium">{userStats.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Helped:</span>
                    <span className="font-medium">{userStats.helpedPeople}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Mobile */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => {
                    handleViewMessages();
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="text-green-600" size={20} />
                    <span className="font-medium text-green-900">Messages</span>
                  </div>
                  <ChevronRight className="text-green-600" size={16} />
                </button>
                
                <button 
                  onClick={() => {
                    handleViewEarnings();
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="text-purple-600" size={20} />
                    <span className="font-medium text-purple-900">Earnings</span>
                  </div>
                  <ChevronRight className="text-purple-600" size={16} />
                </button>

                <button 
                  onClick={() => {
                    router.push('/profile');
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-900">Profile</span>
                  </div>
                  <ChevronRight className="text-blue-600" size={16} />
                </button>
              </div>

              {/* Today's Stats - Mobile */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Today&apos;s Opportunities</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">12 Emergency</div>
                      <div className="text-xs text-gray-600">High-value perks</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">£850+ Available</div>
                      <div className="text-xs text-gray-600">Cash perks near you</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 pb-20">
        {userRole === 'requester' ? (
          /* Requester View - Mobile First */
          <div>
            {/* Post New Task CTA - Mobile */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-4 text-white mb-6">
              <h2 className="text-lg font-bold mb-2">Need help with something?</h2>
              <p className="text-sm opacity-90 mb-4">Post a task and get it done in minutes</p>
              <button 
                onClick={handlePostNewTask}
                className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Post New Task
              </button>
            </div>

            {/* Active Tasks - Mobile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Active Tasks</h3>
              {myActiveTasks.length > 0 ? (
                <div className="space-y-3">
                  {myActiveTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleActiveTaskClick(task.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Helper: {task.helper}</span>
                        <div className="text-right">
                          <div className="text-gray-600">{task.timeRemaining} left</div>
                          <div className="font-medium text-gray-900">{task.perk}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4 text-sm">No active tasks. Post your first task!</p>
                  <button 
                    onClick={handlePostNewTask}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Post Your First Task
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity - Mobile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Task &quot;Document Delivery&quot; completed by Sarah M.</span>
                    <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">New helper interest in &quot;Airport Pickup&quot;</span>
                    <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Payment processed for &quot;Grocery Shopping&quot;</span>
                    <div className="text-xs text-gray-500 mt-1">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Helper View - Mobile First */
          <div>
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Filter size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="mb-4">
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
              </div>
            )}

            {/* Quick Earnings Stats - Mobile */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">£35</div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">£180</div>
                  <div className="text-xs text-gray-600">This Week</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">4.8★</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Task Count */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Tasks ({filteredTasks.length})
              </h2>
              {(searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedUrgency('all');
                    setShowFilters(false);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Available Tasks - Mobile optimized TaskCards */}
            <div className="space-y-3">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-400 mb-4 text-3xl">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all'
                      ? 'Try adjusting your search filters.'
                      : 'New tasks posted every few minutes!'
                    }
                  </p>
                  {(searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedUrgency('all');
                        setShowFilters(false);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden">
        <div className="flex justify-around">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center p-2 text-indigo-600"
          >
            <Activity size={20} />
            <span className="text-xs mt-1">Tasks</span>
          </button>
          <button
            onClick={handleViewMessages}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <Users size={20} />
            <span className="text-xs mt-1">Messages</span>
          </button>
          <button
            onClick={handlePostNewTask}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <Plus size={20} />
            <span className="text-xs mt-1">Post</span>
          </button>
          <button
            onClick={handleViewEarnings}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <DollarSign size={20} />
            <span className="text-xs mt-1">Earnings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;