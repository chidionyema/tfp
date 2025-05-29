#!/bin/bash

# TaskForPerks MVP Structure Setup Script
# Building from existing structure - won't overwrite existing files

echo "🚀 Setting up TaskForPerks MVP structure from current state..."
echo "📁 Current structure detected: app/, components/ui/, tasks/, profile/, dashboard/, login/"

# Function to create file only if it doesn't exist
create_if_not_exists() {
    if [ ! -f "$1" ]; then
        echo "Creating $1..."
        mkdir -p "$(dirname "$1")"
        cat > "$1"
    else
        echo "✅ $1 already exists, skipping..."
    fi
}

# Function to create directory only if it doesn't exist
create_dir_if_not_exists() {
    if [ ! -d "$1" ]; then
        echo "Creating directory $1..."
        mkdir -p "$1"
    else
        echo "✅ Directory $1 already exists, skipping..."
    fi
}

echo ""
echo "📂 Creating missing app routes..."

# Missing app routes (keeping existing dashboard, login, profile, tasks)
create_dir_if_not_exists "src/app/(auth)/forgot-password"
create_dir_if_not_exists "src/app/(auth)/verify-phone"
create_dir_if_not_exists "src/app/tasks/[id]"
create_dir_if_not_exists "src/app/tasks/[id]/track"
create_dir_if_not_exists "src/app/tasks/[id]/review"
create_dir_if_not_exists "src/app/tasks/my-tasks"
create_dir_if_not_exists "src/app/messages"
create_dir_if_not_exists "src/app/messages/[conversationId]"
create_dir_if_not_exists "src/app/profile/settings"
create_dir_if_not_exists "src/app/profile/earnings"
create_dir_if_not_exists "src/app/disputes"
create_dir_if_not_exists "src/app/disputes/create"
create_dir_if_not_exists "src/app/disputes/[id]"
create_dir_if_not_exists "src/app/admin/dashboard"
create_dir_if_not_exists "src/app/admin/tasks"
create_dir_if_not_exists "src/app/admin/users"
create_dir_if_not_exists "src/app/admin/disputes"
create_dir_if_not_exists "src/app/admin/settings"

echo ""
echo "🧩 Creating missing component directories..."

# Component directories (keeping existing ui/)
create_dir_if_not_exists "src/components/layout"
create_dir_if_not_exists "src/components/task"
create_dir_if_not_exists "src/components/messaging"
create_dir_if_not_exists "src/components/maps"
create_dir_if_not_exists "src/components/profile"
create_dir_if_not_exists "src/components/admin"
create_dir_if_not_exists "src/components/forms"

echo ""
echo "🛠️ Creating utility directories..."

create_dir_if_not_exists "src/lib"
create_dir_if_not_exists "src/hooks"
create_dir_if_not_exists "src/context"
create_dir_if_not_exists "src/styles"

echo ""
echo "📄 Creating missing page files..."

# Auth pages
create_if_not_exists "src/app/(auth)/forgot-password/page.tsx" << 'EOF'
// File: src/app/(auth)/forgot-password/page.tsx
"use client";

import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Demo: Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      console.log('Demo: Password reset email would be sent to:', email);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to {email}
          </p>
          <Link 
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white text-center">
          <Link href="/" className="text-2xl font-bold mb-2 block">TaskForPerks</Link>
          <p className="opacity-90">Reset your password</p>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/login" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 text-sm">
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
EOF

# Task detail page
create_if_not_exists "src/app/tasks/[id]/page.tsx" << 'EOF'
// File: src/app/tasks/[id]/page.tsx
// Task Detail & Negotiation Page

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Star, User, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const mockTask = {
    id: taskId,
    title: 'Emergency Document Delivery',
    description: 'Need passport collected from Camden and delivered to US Embassy before 3 PM today.',
    location: 'Camden → Mayfair',
    urgency: 'emergency',
    perk: '£35 PayPal',
    requesterName: 'Sarah K.',
    requesterRating: 4.8,
    successRate: 96
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-indigo-600">TaskForPerks</h1>
            <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              🚀 DEMO MODE
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{mockTask.title}</h1>
              <p className="text-gray-600 mb-4">{mockTask.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {mockTask.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  ~90 minutes
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{mockTask.perk}</div>
              <div className="text-sm text-green-600">{mockTask.successRate}% success</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium">{mockTask.requesterName}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star size={14} className="text-yellow-500" />
                    {mockTask.requesterRating} rating
                  </div>
                </div>
              </div>
              <button 
                onClick={() => alert('Demo: Task claimed!')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Claim This Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
EOF

# Task creation page
create_if_not_exists "src/app/tasks/create/page.tsx" << 'EOF'
// File: src/app/tasks/create/page.tsx
"use client";

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TaskCreatePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'medium',
    perk: '',
    category: 'delivery'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Demo: Task created successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-indigo-600">Create New Task</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Task Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Emergency document delivery needed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Detailed description of what needs to be done..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="shopping">Shopping</option>
                    <option value="transport">Transport</option>
                    <option value="personal">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Perk Offer</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What will you offer?
              </label>
              <input
                type="text"
                value={formData.perk}
                onChange={(e) => setFormData({...formData, perk: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="£35 PayPal or £40 Amazon card"
                required
              />
              <p className="text-sm text-gray-600 mt-2">
                💡 Tip: Tier 1-2 perks (cash, popular gift cards) have 95%+ success rates
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Post Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreatePage;
EOF

# Messages page
create_if_not_exists "src/app/messages/page.tsx" << 'EOF'
// File: src/app/messages/page.tsx
"use client";

import React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MessagesPage = () => {
  const router = useRouter();

  const mockConversations = [
    {
      id: '1',
      name: 'Sarah K.',
      lastMessage: 'Documents collected! On my way to embassy now.',
      time: '2 min ago',
      unread: true,
      task: 'Emergency Document Delivery'
    },
    {
      id: '2',
      name: 'Mike R.',
      lastMessage: 'Perfect! I can pick up the charger in 20 minutes.',
      time: '15 min ago',
      unread: false,
      task: 'Laptop Charger Emergency'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-indigo-600">Messages</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="divide-y">
            {mockConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => router.push(`/messages/${conv.id}`)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <MessageCircle size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{conv.name}</h3>
                        {conv.unread && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{conv.task}</p>
                      <p className="text-sm text-gray-500">{conv.lastMessage}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{conv.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
EOF

echo ""
echo "🧩 Creating missing UI components..."

# Missing UI components that don't exist yet
create_if_not_exists "src/components/ui/Modal.tsx" << 'EOF'
// File: src/components/ui/Modal.tsx
"use client";

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white rounded-xl shadow-xl ${sizeClasses[size]} w-full`}>
          {title && (
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
EOF

create_if_not_exists "src/components/ui/LoadingSpinner.tsx" << 'EOF'
// File: src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'gray' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'indigo' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    indigo: 'border-indigo-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
};

export default LoadingSpinner;
EOF

echo ""
echo "📚 Creating utility files..."

create_if_not_exists "src/lib/types.ts" << 'EOF'
// File: src/lib/types.ts
// TypeScript type definitions for TaskForPerks

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  joinDate: string;
  tasksCompleted: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedDuration: string;
  requirements?: string[];
  photos?: string[];
  requesterId: string;
  helperId?: string;
  perks: Perk[];
  tier: number;
  successRate: number;
}

export interface Perk {
  id: string;
  type: 'cash' | 'gift_card' | 'tech_item' | 'service' | 'credits';
  value: number;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  successRate: number;
  availability: 'instant' | 'within_24h' | 'custom';
}

export interface Negotiation {
  id: string;
  taskId: string;
  offers: NegotiationOffer[];
  status: 'open' | 'accepted' | 'rejected' | 'expired';
}

export interface NegotiationOffer {
  id: string;
  fromUserId: string;
  proposedPerks: Perk[];
  message?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}
EOF

create_if_not_exists "src/lib/constants.ts" << 'EOF'
// File: src/lib/constants.ts
// App constants and configuration

export const URGENCY_LEVELS = {
  low: { label: 'Low', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'orange' },
  emergency: { label: 'Emergency', color: 'red' }
} as const;

export const TASK_CATEGORIES = {
  delivery: 'Delivery',
  shopping: 'Shopping',
  transport: 'Transport',
  personal: 'Personal Care',
  business: 'Business',
  tech: 'Tech Support'
} as const;

export const PERK_TIERS = {
  1: { label: 'Tier 1', successRate: 95, color: 'green' },
  2: { label: 'Tier 2', successRate: 90, color: 'blue' },
  3: { label: 'Tier 3', successRate: 85, color: 'yellow' },
  4: { label: 'Tier 4', successRate: 75, color: 'orange' },
  5: { label: 'Tier 5', successRate: 65, color: 'red' }
} as const;

export const API_ROUTES = {
  TASKS: '/api/tasks',
  USERS: '/api/users',
  MESSAGES: '/api/messages',
  NEGOTIATIONS: '/api/negotiations'
} as const;
EOF

echo ""
echo "🎣 Creating custom hooks..."

create_if_not_exists "src/hooks/useAuth.ts" << 'EOF'
// File: src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user in localStorage
    const userData = localStorage.getItem('taskforperks-demo-user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('taskforperks-demo-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskforperks-demo-user');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };
};
EOF

create_if_not_exists "src/hooks/useTasks.ts" << 'EOF'
// File: src/hooks/useTasks.ts
"use client";

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in real app, this would fetch from your API
    setTimeout(() => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Emergency Document Delivery',
          description: 'Need passport collected and delivered to embassy',
          location: 'Camden → Mayfair',
          category: 'delivery',
          urgency: 'emergency',
          status: 'open',
          createdAt: '2024-01-15T10:30:00Z',
          estimatedDuration: '90 minutes',
          requesterId: 'user1',
          perks: [{
            id: 'p1',
            type: 'cash',
            value: 35,
            description: '£35 PayPal',
            tier: 1,
            successRate: 98,
            availability: 'instant'
          }],
          tier: 1,
          successRate: 96
        }
      ];
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    // Simulate API call
    console.log('Creating task:', taskData);
    return { success: true, id: 'new-task-id' };
  };

  const claimTask = async (taskId: string) => {
    // Simulate API call
    console.log('Claiming task:', taskId);
    return { success: true };
  };

  return {
    tasks,
    loading,
    createTask,
    claimTask
  };
};
EOF

echo ""
echo "🌐 Creating context providers..."

create_if_not_exists "src/context/AuthContext.tsx" << 'EOF'
// File: src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
EOF

echo ""
echo "🎨 Creating layout components..."

create_if_not_exists "src/components/layout/Header.tsx" << 'EOF'
// File: src/components/layout/Header.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('taskforperks-demo-user');
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              TaskForPerks
            </Link>
            <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              🚀 DEMO MODE
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-indigo-600" />
                </div>
                <span className="text-sm">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
EOF

echo ""
echo "📋 Creating task components..."

create_if_not_exists "src/components/task/TaskCard.tsx" << 'EOF'
// File: src/components/task/TaskCard.tsx
import React from 'react';
import { MapPin, Clock, Star, TrendingUp } from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showClaimButton?: boolean;
  onClaim?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  showClaimButton = true, 
  onClaim 
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(task.urgency)}`}>
              {task.urgency}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {task.successRate}% success
            </span>
          </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{task.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{task.estimatedDuration}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-lg font-bold text-indigo-600 mb-1">
            {task.perks[0]?.description}
          </div>
          <div className="text-xs text-gray-500">
            Tier {task.tier} • {task.perks[0]?.successRate}% rate
          </div>
        </div>
      </div>
      
      {showClaimButton && (
        <div className="flex justify-end pt-4 border-t">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClaim?.();
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Claim Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
EOF

create_if_not_exists "src/components/task/TaskFilters.tsx" << 'EOF'
// File: src/components/task/TaskFilters.tsx
import React from 'react';
import { Filter, Search } from 'lucide-react';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (urgency: string) => void;
  locationFilter: string;
  onLocationChange: (location: string) => void;
  taskCount: number;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  locationFilter,
  onLocationChange,
  taskCount
}) => {
  const categories = ['all', 'delivery', 'shopping', 'transport', 'personal', 'business'];
  const urgencyLevels = ['all', 'emergency', 'high', 'medium', 'low'];
  const locationRanges = ['2km', '5km', '10km', '20km'];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="font-medium text-gray-900">Filters:</span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {urgencyLevels.map(urgency => (
              <option key={urgency} value={urgency}>
                {urgency === 'all' ? 'All Urgency' : urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {locationRanges.map(range => (
              <option key={range} value={range}>Within {range}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 ml-2">
            {taskCount} tasks
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
EOF

echo ""
echo "📱 Creating additional utility files..."

create_if_not_exists "src/lib/utils.ts" << 'EOF'
// File: src/lib/utils.ts
// Utility functions for TaskForPerks

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export const formatCurrency = (amount: number, currency: string = '£'): string => {
  return `${currency}${amount}`;
};

export const getSuccessRateColor = (rate: number): string => {
  if (rate >= 95) return 'text-green-600';
  if (rate >= 85) return 'text-blue-600';
  if (rate >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

export const getTierBadgeColor = (tier: number): string => {
  if (tier <= 2) return 'bg-green-100 text-green-800';
  if (tier <= 4) return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
EOF

create_if_not_exists "src/styles/components.css" << 'EOF'
/* File: src/styles/components.css */
/* Component-specific styles for TaskForPerks */

/* Task Card Animations */
.task-card-enter {
  opacity: 0;
  transform: translateY(20px);
}

.task-card-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}

/* Notification Animations */
.notification-slide-in {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Success Rate Indicators */
.success-rate-high {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.success-rate-medium {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-200;
}

.success-rate-low {
  @apply bg-red-100 text-red-800 border border-red-200;
}

/* Urgency Badges */
.urgency-emergency {
  @apply bg-red-100 text-red-800 border border-red-200;
  animation: pulse 2s infinite;
}

.urgency-high {
  @apply bg-orange-100 text-orange-800 border border-orange-200;
}

.urgency-medium {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-200;
}

.urgency-low {
  @apply bg-green-100 text-green-800 border border-green-200;
}

/* Tier Badges */
.tier-1, .tier-2 {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.tier-3, .tier-4 {
  @apply bg-blue-100 text-blue-800 border border-blue-200;
}

.tier-5 {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-200;
}

/* Loading States */
.skeleton {
  @apply bg-gray-200 animate-pulse rounded;
}

/* Chat Bubbles */
.chat-bubble-sent {
  @apply bg-indigo-600 text-white rounded-lg rounded-br-sm;
}

.chat-bubble-received {
  @apply bg-gray-100 text-gray-900 rounded-lg rounded-bl-sm;
}

/* Form Focus States */
.form-input-focus {
  @apply focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;
}

/* Button Variants */
.btn-primary {
  @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500;
}

.btn-ghost {
  @apply text-gray-700 hover:bg-gray-100 focus:ring-indigo-500;
}

/* Status Indicators */
.status-open {
  @apply bg-blue-100 text-blue-800;
}

.status-claimed {
  @apply bg-yellow-100 text-yellow-800;
}

.status-in-progress {
  @apply bg-orange-100 text-orange-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.status-cancelled {
  @apply bg-gray-100 text-gray-800;
}
EOF

echo ""
echo "🎯 Creating final setup files..."

# Create a simple README for the structure
create_if_not_exists "src/README.md" << 'EOF'
# TaskForPerks MVP Structure

This directory contains the complete TaskForPerks MVP implementation.

## Structure Overview

- `app/` - Next.js 14+ App Router pages
- `components/` - Reusable React components
- `lib/` - Utility functions and type definitions
- `hooks/` - Custom React hooks
- `context/` - React context providers
- `styles/` - Additional CSS styles

## Key Components Created

### Pages
- Landing page ✅
- Login/Register ✅
- Dashboard ✅
- Task creation, detail, tracking
- Messages, Profile, Admin panels

### Components
- TaskCard, TaskFilters, TaskNegotiation
- UI components (Button, Modal, etc.)
- Layout components (Header, etc.)

### Utilities
- Type definitions
- Custom hooks (useAuth, useTasks)
- Helper functions

## Getting Started

1. Ensure all dependencies are installed
2. Run `npm run dev` to start development server
3. Navigate between pages using the demo navigation

## Demo Features

All authentication and API calls are mocked for demonstration purposes.
Look for "DEMO MODE" indicators throughout the app.
EOF

echo ""
echo "✅ TaskForPerks MVP structure setup complete!"
echo ""
echo "📊 Summary:"
echo "   • Created missing app routes and pages"
echo "   • Added reusable UI components"
echo "   • Set up utility functions and types"
echo "   • Created custom hooks and context providers"
echo "   • Added layout and task-specific components"
echo "   • All existing files preserved"
echo ""
echo "🚀 Next steps:"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Test the complete user flow: Landing → Login → Dashboard → Tasks"
echo "   3. Customize components as needed for your demo"
echo ""
echo "📁 Key files created:"
echo "   • src/app/tasks/[id]/page.tsx - Task detail & negotiation"
echo "   • src/app/tasks/create/page.tsx - Task creation"
echo "   • src/components/task/TaskCard.tsx - Reusable task display"
echo "   • src/components/layout/Header.tsx - Main navigation"
echo "   • src/lib/types.ts - TypeScript definitions"
echo "   • src/hooks/useAuth.ts - Authentication logic"
echo ""