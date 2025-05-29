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
