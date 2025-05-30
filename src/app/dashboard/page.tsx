"use client";
import React, { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import { Plus, ChevronRight, TrendingUp, Users, DollarSign, Activity, Star, Menu, X, Search, Filter, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface UserStats {
  tasksCompleted: number;
  rating: number;
  reviewCount: number;
  joinDate: string;
  responseTime: string;
  earnings: string;
  helpedPeople: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: string;
  status: string;
  createdAt: string;
  estimatedDuration: string;
  requesterId: string;
  perks: Array<{
    id: string;
    type: string;
    value: number;
    description: string;
    tier: number;
    successRate: number;
    availability: string;
  }>;
  tier: number;
  successRate: number;
}

// Infinite scroll hook
interface UseInfiniteScrollProps {
  callback: () => void;
  isLoading: boolean;
  hasMore: boolean;
  rootMargin?: string;
  threshold?: number;
}

const useInfiniteScroll = ({
  callback,
  isLoading,
  hasMore,
  rootMargin = '100px',
  threshold = 0.1
}: UseInfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && !isLoading && hasMore) {
        callback();
      }
    },
    [callback, isLoading, hasMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    
    if (!sentinel) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { sentinelRef };
};

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<'requester' | 'helper'>('helper');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [locationFilter, setLocationFilter] = useState('5km');
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tasksDisplayed, setTasksDisplayed] = useState(6);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState('');

  const userStats: UserStats = {
    tasksCompleted: 47, rating: 4.8, reviewCount: 45, joinDate: 'Oct 2024',
    responseTime: '8 min', earnings: '£340', helpedPeople: 32
  };

  const [allTasks] = useState<Task[]>([
    { id: '1', title: 'Emergency Document Delivery', description: 'Need passport collected from home and delivered to embassy before 3PM today.', location: 'Camden, London • 1.2 km', category: 'delivery', urgency: 'emergency', status: 'open', createdAt: '2024-01-15T10:30:00Z', estimatedDuration: '45 min', requesterId: 'user1', perks: [{ id: 'p1', type: 'cash', value: 35, description: '£35 cash', tier: 1, successRate: 98, availability: 'instant' }, { id: 'p2', type: 'gift_card', value: 40, description: '£40 Amazon card', tier: 1, successRate: 96, availability: 'instant' }], tier: 1, successRate: 96 },
    { id: '2', title: 'Laptop Charger Emergency', description: 'MacBook Pro charger needed urgently for client presentation. Specific model required.', location: 'Canary Wharf, London • 2.1 km', category: 'shopping', urgency: 'high', status: 'open', createdAt: '2024-01-15T09:45:00Z', estimatedDuration: '30 min', requesterId: 'user2', perks: [{ id: 'p3', type: 'cash', value: 25, description: '£25 PayPal', tier: 1, successRate: 94, availability: 'instant' }], tier: 1, successRate: 94 },
    { id: '3', title: 'Prescription Pickup & Delivery', description: 'Collect prescription from Boots pharmacy and deliver to office in Westminster.', location: 'Westminster, London • 3.5 km', category: 'personal', urgency: 'medium', status: 'open', createdAt: '2024-01-15T09:00:00Z', estimatedDuration: '40 min', requesterId: 'user3', perks: [{ id: 'p4', type: 'cash', value: 30, description: '£30 cash', tier: 2, successRate: 92, availability: 'instant' }], tier: 2, successRate: 92 },
    { id: '4', title: 'Pet Walking Service', description: 'Need someone to walk my golden retriever for 1 hour in Hyde Park.', location: 'Hyde Park, London • 0.8 km', category: 'personal', urgency: 'low', status: 'open', createdAt: '2024-01-15T08:30:00Z', estimatedDuration: '60 min', requesterId: 'user4', perks: [{ id: 'p5', type: 'cash', value: 20, description: '£20 cash', tier: 1, successRate: 95, availability: 'instant' }], tier: 1, successRate: 95 },
    { id: '5', title: 'Grocery Shopping', description: 'Weekly grocery shopping from Tesco. List provided.', location: 'Shoreditch, London • 2.3 km', category: 'shopping', urgency: 'medium', status: 'open', createdAt: '2024-01-15T08:00:00Z', estimatedDuration: '90 min', requesterId: 'user5', perks: [{ id: 'p6', type: 'cash', value: 35, description: '£35 + groceries', tier: 2, successRate: 93, availability: 'instant' }], tier: 2, successRate: 93 },
    { id: '6', title: 'Office Setup Help', description: 'Need help setting up desk and tech equipment in new office space.', location: 'King&apos;s Cross, London • 3.1 km', category: 'handyman', urgency: 'low', status: 'open', createdAt: '2024-01-15T07:30:00Z', estimatedDuration: '120 min', requesterId: 'user6', perks: [{ id: 'p7', type: 'cash', value: 50, description: '£50 cash', tier: 2, successRate: 90, availability: 'instant' }], tier: 2, successRate: 90 },
    { id: '7', title: 'Event Photography', description: 'Professional photographer needed for small corporate event.', location: 'Paddington, London • 2.8 km', category: 'creative', urgency: 'medium', status: 'open', createdAt: '2024-01-15T07:00:00Z', estimatedDuration: '180 min', requesterId: 'user7', perks: [{ id: 'p8', type: 'cash', value: 120, description: '£120 cash', tier: 2, successRate: 88, availability: 'instant' }], tier: 2, successRate: 88 },
    { id: '8', title: 'Furniture Assembly', description: 'IKEA wardrobe assembly required urgently.', location: 'Islington, London • 4.1 km', category: 'handyman', urgency: 'high', status: 'open', createdAt: '2024-01-15T06:30:00Z', estimatedDuration: '150 min', requesterId: 'user8', perks: [{ id: 'p9', type: 'cash', value: 80, description: '£80 cash', tier: 2, successRate: 91, availability: 'instant' }], tier: 2, successRate: 91 },
    { id: '9', title: 'Language Tutoring', description: 'Spanish conversation practice session needed.', location: 'Greenwich, London • 6.2 km', category: 'education', urgency: 'low', status: 'open', createdAt: '2024-01-15T06:00:00Z', estimatedDuration: '60 min', requesterId: 'user9', perks: [{ id: 'p10', type: 'cash', value: 40, description: '£40 PayPal', tier: 1, successRate: 96, availability: 'instant' }], tier: 1, successRate: 96 },
    { id: '10', title: 'Car Washing', description: 'Need my car washed and detailed before important meeting.', location: 'Kensington, London • 2.5 km', category: 'personal', urgency: 'medium', status: 'open', createdAt: '2024-01-15T05:30:00Z', estimatedDuration: '60 min', requesterId: 'user10', perks: [{ id: 'p11', type: 'cash', value: 30, description: '£30 cash', tier: 1, successRate: 97, availability: 'instant' }], tier: 1, successRate: 97 },
    { id: '11', title: 'Home Cleaning', description: 'Deep cleaning needed for 2-bedroom apartment.', location: 'Brixton, London • 4.8 km', category: 'personal', urgency: 'low', status: 'open', createdAt: '2024-01-15T05:00:00Z', estimatedDuration: '180 min', requesterId: 'user11', perks: [{ id: 'p12', type: 'cash', value: 70, description: '£70 cash', tier: 2, successRate: 89, availability: 'instant' }], tier: 2, successRate: 89 },
    { id: '12', title: 'Birthday Cake Pickup', description: 'Collect custom birthday cake from bakery in Notting Hill.', location: 'Notting Hill, London • 3.2 km', category: 'delivery', urgency: 'high', status: 'open', createdAt: '2024-01-15T04:30:00Z', estimatedDuration: '30 min', requesterId: 'user12', perks: [{ id: 'p13', type: 'cash', value: 25, description: '£25 cash', tier: 1, successRate: 96, availability: 'instant' }], tier: 1, successRate: 96 },
    { id: '13', title: 'Tech Support', description: 'Help setting up smart home devices and WiFi troubleshooting.', location: 'Hampstead, London • 5.1 km', category: 'handyman', urgency: 'medium', status: 'open', createdAt: '2024-01-15T04:00:00Z', estimatedDuration: '90 min', requesterId: 'user13', perks: [{ id: 'p14', type: 'cash', value: 45, description: '£45 cash', tier: 2, successRate: 92, availability: 'instant' }], tier: 2, successRate: 92 },
    { id: '14', title: 'Garden Maintenance', description: 'Weeding and basic garden tidy up required.', location: 'Richmond, London • 7.2 km', category: 'handyman', urgency: 'low', status: 'open', createdAt: '2024-01-15T03:30:00Z', estimatedDuration: '120 min', requesterId: 'user14', perks: [{ id: 'p15', type: 'cash', value: 55, description: '£55 cash', tier: 2, successRate: 88, availability: 'instant' }], tier: 2, successRate: 88 },
    { id: '15', title: 'Airport Pickup', description: 'Pick up relative from Heathrow Terminal 3 arrivals.', location: 'Heathrow Airport • 12.1 km', category: 'delivery', urgency: 'high', status: 'open', createdAt: '2024-01-15T03:00:00Z', estimatedDuration: '90 min', requesterId: 'user15', perks: [{ id: 'p16', type: 'cash', value: 60, description: '£60 cash', tier: 2, successRate: 94, availability: 'instant' }], tier: 2, successRate: 94 }
  ]);

  const myActiveTasks = [
    { id: 'active1', title: 'Business Cards Printing', status: 'in_progress', helper: 'Sarah M.', timeRemaining: '25 min', perk: '£30 PayPal' },
    { id: 'active2', title: 'Grocery Shopping', status: 'accepted', helper: 'Mike R.', timeRemaining: '45 min', perk: '£35 Amazon card' }
  ];

  const isPolling = true; // Mock polling status

  useEffect(() => {
    // Mock dark mode initialization
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
  };
  const router = useRouter();
  // Navigation functions
  const navigate = {
    createTask: () => router.push('/tasks/create'),
    messages: () => alert('Navigate to messages'),
    earnings: () => alert('Navigate to earnings'),
    profile: () => alert('Navigate to profile'),
    task: (id: string) => router.push(`/tasks/${id}`),
    trackTask: (id: string) => router.push(`/tasks/${id}/track`)
  };

  const handleClaimTask = async (task: Task, event: MouseEvent<HTMLButtonElement>) => {
    alert(`Demo: Claiming task "${task.title}"\n\nIn the real app, this would:\n• Open negotiation interface\n• Start real-time chat\n• Set up task tracking`);
    
    // Check for reduced motion preference
    const reducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reducedMotion) return;

    if (typeof window !== "undefined") {
      // Haptic feedback
      navigator.vibrate?.(10);
      
      // Confetti effect
      const { default: confetti } = await import("canvas-confetti");
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { 
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight
        }
      });
    }
  };

  // Filter functions
  const clearFilters = () => { 
    setSearchQuery(''); 
    setSelectedCategory('all'); 
    setSelectedUrgency('all'); 
    setShowFilters(false); 
  };
  
  const clearSingleFilter = (filterType: 'search' | 'category' | 'urgency') => {
    const actions = { 
      search: () => setSearchQuery(''), 
      category: () => setSelectedCategory('all'), 
      urgency: () => setSelectedUrgency('all') 
    };
    actions[filterType]();
  };

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && 
           (selectedCategory === 'all' || task.category === selectedCategory) && 
           (selectedUrgency === 'all' || task.urgency === selectedUrgency);
  });

  const displayedTasks = filteredTasks.slice(0, tasksDisplayed);
  const hasMoreTasks = filteredTasks.length > tasksDisplayed;
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all';

  const loadMoreTasks = useCallback(async () => {
    if (loadingMore || !hasMoreTasks) return;
    
    setLoadingMore(true);
    setLoadingAnnouncement('Loading more tasks');
    await new Promise(resolve => setTimeout(resolve, 800));
    setTasksDisplayed(prev => prev + 6);
    setLoadingMore(false);
    setLoadingAnnouncement('');
  }, [loadingMore, hasMoreTasks]);

  // Initialize infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    callback: loadMoreTasks,
    isLoading: loadingMore,
    hasMore: hasMoreTasks,
    rootMargin: '200px',
    threshold: 0.1
  });

  const activeFilters = [
    { key: 'search', label: `"${searchQuery}"`, active: !!searchQuery, type: 'search' as const },
    { key: 'category', label: selectedCategory, active: selectedCategory !== 'all', type: 'category' as const },
    { key: 'urgency', label: selectedUrgency, active: selectedUrgency !== 'all', type: 'urgency' as const }
  ].filter(filter => filter.active);

  // Component helpers
  const TaskSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-pulse" role="status" aria-label="Loading task">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
      </div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    </div>
  );

  const StatCard = ({ value, label, color = "gray" }: { value: string; label: string; color?: string }) => (
    <div className="text-center">
      <div className={`text-lg font-bold ${color === 'green' ? 'text-green-600 dark:text-green-400' : color === 'blue' ? 'text-blue-600 dark:text-blue-400' : color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );

  
const ActionButton = ({ icon: Icon, label, onClick, color = "blue" }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>; // <<< MODIFIED LINE
    label: string;
    onClick: () => void;
    color?: string
  }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
      color === 'green' ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' :
      color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30' :
      'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
    }`}>
      <div className="flex items-center space-x-3">
        <Icon className={`${
          color === 'green' ? 'text-green-600 dark:text-green-400' :
          color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
          'text-blue-600 dark:text-blue-400'
        }`} size={20} /> {/* This line (294) will now be type-correct */}
        <span className={`font-medium ${
          color === 'green' ? 'text-green-900 dark:text-green-100' :
          color === 'purple' ? 'text-purple-900 dark:text-purple-100' :
          'text-blue-900 dark:text-blue-100'
        }`}>{label}</span>
      </div>
      <ChevronRight className={`${
        color === 'green' ? 'text-green-600 dark:text-green-400' :
        color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
        'text-blue-600 dark:text-blue-400'
      }`} size={16} />
    </button>
  );

  const FilterChip = ({ filter }: { filter: typeof activeFilters[0] }) => (
    <div className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs">
      <span>{filter.label}</span>
      <button onClick={() => clearSingleFilter(filter.type)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200" aria-label={`Remove ${filter.type} filter`}>
        <X size={12} />
      </button>
    </div>
  );

  const TaskCard = ({ task, onClaim }: { 
    task: Task;
    onClaim: (task: Task, event: MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate.task(task.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{task.title}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.urgency === 'emergency' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
          task.urgency === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' :
          task.urgency === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
        }`}>
          {task.urgency}
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-500">{task.location}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when claiming
            onClaim(task, e);
          }}
          className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors text-xs"
        >
          Claim £{task.perks[0]?.value || 0}
        </button>
      </div>
    </div>
  );

  const TaskFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Categories</option>
          <option value="delivery">Delivery</option>
          <option value="shopping">Shopping</option>
          <option value="personal">Personal</option>
          <option value="handyman">Handyman</option>
          <option value="creative">Creative</option>
          <option value="education">Education</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urgency</label>
        <select 
          value={selectedUrgency} 
          onChange={(e) => setSelectedUrgency(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Urgency</option>
          <option value="emergency">Emergency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance</label>
        <select 
          value={locationFilter} 
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="1km">Within 1km</option>
          <option value="5km">Within 5km</option>
          <option value="10km">Within 10km</option>
          <option value="all">Any distance</option>
        </select>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTasks.length} tasks
      </div>
    </div>
  );

  const TrustedRunnerBadge = () => (
    <div className="flex items-center gap-1">
      <Star className="w-3 h-3 text-yellow-500 fill-current" />
      <span className="text-xs text-gray-600 dark:text-gray-400">Trusted Runner</span>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{loadingAnnouncement}</div>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">TaskForPerks</h1>
              <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-xs font-medium">DEMO</div>
              {isPolling && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg" aria-label="Toggle dark mode">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200" aria-label="Notifications">
                <Activity size={20} />
              </button>
              <button onClick={() => setShowSidebar(true)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200" aria-label="Open menu">
                <Menu size={20} />
              </button>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mt-3" role="tablist" aria-label="User role selection">
            {[{ role: 'helper', label: 'Find Tasks' }, { role: 'requester', label: 'My Tasks' }].map(({ role, label }) => (
              <button 
                key={role} 
                role="tab" 
                aria-selected={userRole === role} 
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

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
                <button onClick={() => setShowSidebar(false)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">JD</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">John Doe</h3>
                    <TrustedRunnerBadge />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <StatCard value={userStats.tasksCompleted.toString()} label="Tasks Done" />
                  <StatCard value={userStats.rating.toString()} label="Rating" />
                </div>
                <div className="space-y-2 text-sm">
                  {[['Earnings', userStats.earnings], ['Response', userStats.responseTime], ['Helped', userStats.helpedPeople.toString()]].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <ActionButton icon={Users} label="Messages" onClick={() => { navigate.messages(); setShowSidebar(false); }} color="green" />
                <ActionButton icon={TrendingUp} label="Earnings" onClick={() => { navigate.earnings(); setShowSidebar(false); }} color="purple" />
                <ActionButton icon={Star} label="Profile" onClick={() => { navigate.profile(); setShowSidebar(false); }} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Today&apos;s Opportunities</h3>
                <div className="space-y-3">
                  {[{ icon: Activity, color: 'red', title: '12 Emergency', subtitle: 'High-value perks' }, { icon: DollarSign, color: 'green', title: '£850+ Available', subtitle: 'Cash perks near you' }].map(({ icon: Icon, color, title, subtitle }, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 py-4 pb-20">
        {userRole === 'requester' ? (
          <div>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-4 text-white mb-6">
              <h2 className="text-lg font-bold mb-2">Need help with something?</h2>
              <p className="text-sm opacity-90 mb-4">Post a task and get it done in minutes</p>
              <button onClick={navigate.createTask} className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Plus size={20} />
                Post New Task
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Active Tasks</h3>
              {myActiveTasks.length > 0 ? (
                <div className="space-y-3">
                  {myActiveTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors" onClick={() => navigate.trackTask(task.id)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'}`}>
                          {task.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Helper: {task.helper}</span>
                        <div className="text-right">
                          <div className="text-gray-600 dark:text-gray-400">{task.timeRemaining} left</div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{task.perk}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <button onClick={navigate.createTask} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Post Your First Task
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[{ color: 'green', text: 'Task "Document Delivery" completed by Sarah M.', time: '2 hours ago' }, { color: 'blue', text: 'New helper interest in "Airport Pickup"', time: '4 hours ago' }, { color: 'yellow', text: 'Payment processed for "Grocery Shopping"', time: '1 day ago' }].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.color === 'green' ? 'bg-green-500' :
                      activity.color === 'blue' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{activity.text}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Search & Filters */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                  aria-label="Search tasks" 
                />
                <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                  aria-label="Toggle filters" 
                  aria-expanded={showFilters}
                >
                  <Filter size={20} />
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map((filter) => (
                  <FilterChip key={filter.key} filter={filter} />
                ))}
                {activeFilters.length > 1 && (
                  <button onClick={clearFilters} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1">
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
              <div className="mb-4">
                <TaskFilters />
              </div>
            )}

            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4">
                <StatCard value="£35" label="Today" color="green" />
                <StatCard value="£180" label="This Week" color="blue" />
                <StatCard value="4.8★" label="Rating" color="purple" />
              </div>
            </div>

            {/* Task List */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Available Tasks ({filteredTasks.length})
              </h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => <TaskSkeleton key={index} />)
              ) : (
                <>
                  {displayedTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onClaim={handleClaimTask} 
                    />
                  ))}

                  {/* Infinite scroll trigger */}
                  {hasMoreTasks && (
                    <div ref={sentinelRef} className="h-4 flex items-center justify-center">
                      {loadingMore && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                          <span className="text-sm">Loading more tasks...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {loadingMore && (
                    <div className="space-y-3 mt-3">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <TaskSkeleton key={`loading-${index}`} />
                      ))}
                    </div>
                  )}

                  {!hasMoreTasks && !loading && displayedTasks.length > 6 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2 text-2xl">✨</div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">You&apos;ve seen all available tasks</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">New tasks appear automatically when posted</p>
                    </div>
                  )}
                </>
              )}
              
              {!loading && filteredTasks.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="text-gray-400 mb-4 text-3xl">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {hasActiveFilters ? 'Try adjusting your search filters.' : 'New tasks posted every few minutes!'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 lg:hidden transition-colors" role="navigation" aria-label="Main navigation">
        <div className="flex justify-around">
          {[
            { icon: Activity, label: 'Tasks', onClick: () => alert('Navigate to dashboard'), active: true },
            { icon: Users, label: 'Messages', onClick: navigate.messages },
            { icon: Plus, label: 'Post', onClick: navigate.createTask },
            { icon: DollarSign, label: 'Earnings', onClick: navigate.earnings }
          ].map(({ icon: Icon, label, onClick, active }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex flex-col items-center p-2 transition-colors ${
                active 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label={label}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardPage;