// File: src/components/DashboardPage.tsx
// Purpose: Refactored Dashboard using existing TaskCard and TaskFilters components

"use client";
import React, { useState, useEffect, useCallback, MouseEvent } from 'react';
import { Plus, ChevronRight, TrendingUp, Users, DollarSign, Activity, Star, Menu, X, Moon, Sun, Shield, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BackgroundCheck, BackgroundCheckData } from '@/components//BackgroundCheck';
import TaskCard from '@/components/task/TaskCard';
import TaskFilters from '@/components/task/TaskFilters';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MOCK_TASKS, MOCK_ACTIVE_TASKS, UI_CONFIG, BADGE_CONFIGS } from '@/constants/dashboardConstants';

interface UserStats {
  tasksCompleted: number;
  rating: number;
  earnings: string;
  helpedPeople: number;
  backgroundCheckStatus: 'none' | 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface ActiveTask {
  id: string;
  title: string;
  status: string;
  helper: string;
  timeRemaining: string;
  perk: string;
}

// Updated Task interface to match TaskCard expectations
interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: 'emergency' | 'high' | 'medium' | 'low';
  estimatedDuration: string;
  successRate: string | number;
  perks: Array<{ 
    value?: number; 
    description?: string;
    successRate?: string | number;
  }>;
  tier: string | number;
  requiresBackgroundCheck?: boolean;
}

// Define valid color keys type
type ColorKeys = keyof typeof UI_CONFIG.colors;
type BadgeKeys = keyof typeof BADGE_CONFIGS;

const DashboardPage = () => {
  // Core state
  const [userRole, setUserRole] = useState<'requester' | 'helper'>('helper');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [locationFilter, setLocationFilter] = useState('5km');
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasksDisplayed, setTasksDisplayed] = useState(6);
  
  // Background check state
  const [showBackgroundCheck, setShowBackgroundCheck] = useState(false);
  const [backgroundCheckData, setBackgroundCheckData] = useState<BackgroundCheckData | null>(null);
  const [pendingTaskClaim, setPendingTaskClaim] = useState<Task | null>(null);

  const router = useRouter();
  
  const userStats: UserStats = {
    tasksCompleted: 47,
    rating: 4.8,
    earnings: '£340',
    helpedPeople: 32,
    backgroundCheckStatus: backgroundCheckData ? 'completed' : 'none'
  };

  // Convert MOCK_TASKS to match TaskCard interface
  const adaptedTasks: Task[] = MOCK_TASKS.map(task => ({
    ...task,
    urgency: task.urgency as 'emergency' | 'high' | 'medium' | 'low',
    estimatedDuration: '30-60 mins', // Add default duration
    successRate: '96%', // Add default success rate
    tier: 'Standard', // Add default tier
    perks: task.perks.map(perk => ({
      ...perk,
      description: `£${perk.value}`,
      successRate: '96%'
    }))
  }));

  // Filtered and paginated tasks
  const filteredTasks = adaptedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'all' || task.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const displayedTasks = filteredTasks.slice(0, tasksDisplayed);
  const hasMoreTasks = filteredTasks.length > tasksDisplayed;

  // Load more tasks
  const loadMoreTasks = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setTasksDisplayed(prev => prev + 6);
  }, []);

  const { sentinelRef } = useInfiniteScroll({
    callback: loadMoreTasks,
    isLoading: false,
    hasMore: hasMoreTasks,
  });

  // Handlers
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleBackgroundCheckSubmit = async (data: BackgroundCheckData) => {
    setBackgroundCheckData(data);
    setShowBackgroundCheck(false);
    
    if (pendingTaskClaim) {
      alert(`🎉 Verification complete! Claiming "${pendingTaskClaim.title}"`);
      setPendingTaskClaim(null);
    }
  };

  const handleClaimTask = async (task: Task, event?: MouseEvent<HTMLButtonElement>) => {
    if (task.requiresBackgroundCheck && userStats.backgroundCheckStatus !== 'completed') {
      setPendingTaskClaim(task);
      setShowBackgroundCheck(true);
      return;
    }

    alert(`Claiming "${task.title}" for £${task.perks[0]?.value || 0}`);
    
    // Add confetti effect with proper positioning if event is provided
    if (typeof window !== "undefined") {
      const { default: confetti } = await import("canvas-confetti");
      confetti({
        particleCount: 40,
        spread: 45,
        origin: event ? { 
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight
        } : { x: 0.5, y: 0.5 }
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  const navigate = {
    createTask: () => router.push('/tasks/create'),
    messages: () => alert('Navigate to messages'),
    earnings: () => alert('Navigate to earnings'),
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Helper components
  const StatCard = ({ value, label, color = "gray", icon }: { 
    value: string; 
    label: string; 
    color?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
  }) => {
    const Icon = icon;
    const colorKey = color as ColorKeys;
    const colorClass = UI_CONFIG.colors[colorKey] || UI_CONFIG.colors.gray;
    
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {Icon && <Icon size={16} className={colorClass} />}
          <div className={`text-lg font-bold ${colorClass}`}>{value}</div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      </div>
    );
  };

  const VerificationBadge = ({ status }: { status: string }) => {
    const badgeKey = status as BadgeKeys;
    const config = BADGE_CONFIGS[badgeKey] || BADGE_CONFIGS.none;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        <Icon size={12} className={config.color} />
        <span className={config.color}>{config.text}</span>
      </div>
    );
  };

  const ActiveTasksPreview = () => {
    if (!MOCK_ACTIVE_TASKS || MOCK_ACTIVE_TASKS.length === 0) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
            Active Tasks ({MOCK_ACTIVE_TASKS.length})
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View All
          </button>
        </div>
        <div className="space-y-2">
          {MOCK_ACTIVE_TASKS.slice(0, 2).map((task: ActiveTask) => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Due in {task.timeRemaining}</p>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'in_progress' && (
                  <AlertTriangle size={14} className="text-yellow-600" />
                )}
                {task.status === 'completed' && (
                  <CheckCircle2 size={14} className="text-green-600" />
                )}
                <span className="text-sm font-medium text-indigo-600">{task.perk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const VerificationPrompt = () => {
    if (userStats.backgroundCheckStatus === 'completed') return null;
    
    const verifiedTasksCount = adaptedTasks.filter(task => task.requiresBackgroundCheck).length;
    const totalValue = adaptedTasks
      .filter(task => task.requiresBackgroundCheck)
      .reduce((sum, task) => sum + (task.perks[0]?.value || 0), 0);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">🔓 Unlock Premium Tasks</h3>
            <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
              Complete verification to access <strong>{verifiedTasksCount} premium tasks</strong> worth <strong>£{totalValue}+</strong>
            </p>
            <button 
              onClick={() => setShowBackgroundCheck(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Start Verification (2 min)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Header = () => (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">TaskForPerks</h1>
            <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-xs font-medium">DEMO</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setShowSidebar(true)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <Menu size={20} />
            </button>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mt-3">
          {[{ role: 'helper', label: 'Find Tasks' }, { role: 'requester', label: 'My Tasks' }].map(({ role, label }) => (
            <button 
              key={role}
              onClick={() => setUserRole(role as 'helper' | 'requester')} 
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                userRole === role 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );

  const Sidebar = () => showSidebar && (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
            <button onClick={() => setShowSidebar(false)} className="p-2 text-gray-600 dark:text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">JD</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">John Doe</h3>
                <VerificationBadge status={userStats.backgroundCheckStatus} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard value={userStats.tasksCompleted.toString()} label="Tasks Done" />
              <StatCard value={userStats.rating.toString()} label="Rating" />
            </div>
          </div>

          {userStats.backgroundCheckStatus !== 'completed' && (
            <button 
              onClick={() => { setShowBackgroundCheck(true); setShowSidebar(false); }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 mb-3"
            >
              <div className="flex items-center space-x-3">
                <Shield className="text-orange-600 dark:text-orange-400" size={20} />
                <span className="font-medium text-orange-900 dark:text-orange-100">Complete Verification</span>
              </div>
              <ChevronRight className="text-orange-600 dark:text-orange-400" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const TaskList = () => (
    <div className="space-y-4">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        ))
      ) : (
        <>
          {displayedTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              onClick={() => handleTaskClick(task)}
              onClaim={() => handleClaimTask(task)}
              showClaimButton={true}
            />
          ))}
          {hasMoreTasks && <div ref={sentinelRef} className="h-4" />}
          {!hasMoreTasks && displayedTasks.length > 6 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 text-sm">You&apos;ve seen all available tasks</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <Sidebar />

      <main className="px-4 py-4 pb-20 max-w-7xl mx-auto">
        {userRole === 'requester' ? (
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-4 text-white">
            <h2 className="text-lg font-bold mb-2">Need help with something?</h2>
            <button onClick={navigate.createTask} className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Plus size={20} />
              Post New Task
            </button>
          </div>
        ) : (
          <div>
            <VerificationPrompt />
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                  Your Performance
                </h3>
                <Star size={16} className="text-yellow-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <StatCard value="£35" label="Today" color="green" icon={DollarSign} />
                <StatCard value="£180" label="This Week" color="blue" icon={TrendingUp} />
                <StatCard value="4.8★" label="Rating" color="purple" icon={Star} />
              </div>
            </div>

            <ActiveTasksPreview />

            {/* Use TaskFilters component */}
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

            <TaskList />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 lg:hidden">
        <div className="flex justify-around">
          {[
            { icon: Activity, label: 'Tasks', active: true },
            { icon: Users, label: 'Messages' },
            { icon: Plus, label: 'Post' },
            { icon: DollarSign, label: 'Earnings' }
          ].map(({ icon: Icon, label, active }) => (
            <button key={label} className={`flex flex-col items-center p-2 ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Background Check Modal */}
      {showBackgroundCheck && (
        <BackgroundCheck
          onSubmit={handleBackgroundCheckSubmit}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        />
      )}
    </div>
  );
};

export default DashboardPage;