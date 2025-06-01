"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Activity, Users, DollarSign, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Component imports
import { DashboardHeader } from "@/components/dashboard/Header";
import { SearchToolbar } from "@/components/dashboard/SearchToolbar";
import { SidebarProfile } from "@/components/dashboard/SidebarProfile";
import { RequesterDashboard } from "@/components/task/RequesterDashboard";
import { HelperDashboard } from "@/components/task/HelperDashboard";
import { ClaimsReviewModal } from "@/components/modals/ClaimsReviewModal";
import { NegotiationModal } from "@/components/modals/NegotiationModal";
import { BackgroundCheck } from "@/components/BackgroundCheck";

// Type imports
import { BackgroundCheckData } from "@/types/backgroundCheck";
import { Task, DbsRequirement, PerkItem as OriginalPerkItem } from "@/types/task";
import { MOCK_TASKS } from "@/constants/dashboardConstants";

// Define GeoPoint based on its usage
interface GeoPoint {
  address: string;
  lat: number;
  lng: number;
}

// Enhanced task status management
type TaskStatus = "open" | "claimed" | "negotiating" | "accepted" | "in_progress" | "completed" | "disputed" | "cancelled" | "expired";
type ClaimStatus = "pending" | "approved" | "rejected" | "withdrawn" | "expired";

interface TaskClaim {
  id: string;
  taskId: string;
  helperId: string;
  helperName: string;
  helperRating: number;
  helperCompletedTasks: number;
  proposedFee: number;
  notes: string;
  status: ClaimStatus;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  responseTime: string;
  availability: string;
}

interface EnhancedTask extends Omit<Task, 'status' | 'location' | 'perks'> {
  status: TaskStatus;
  location: GeoPoint;
  claims: TaskClaim[];
  acceptedClaimId?: string;
  maxClaims: number;
  claimExpiryHours: number;
  autoAcceptBestClaim: boolean;
  autoAcceptCriteria: {
    minRating: number;
    maxFee: number;
    prioritizeRating: boolean;
  };
  updatedAt?: string;
  perks: OriginalPerkItem[];
}

interface UserStats {
  tasksCompleted: number;
  rating: number;
  earnings: string;
  helpedPeople: number;
  dbClearance: DbsRequirement;
}

const DBS_RANK: Record<DbsRequirement, number> = { none: 0, basic: 1, standard: 2, enhanced: 3 };

// Helper type for perks from MOCK_TASKS
interface PerkFromMock {
  value?: number;
  id?: string;
  description?: string;
  [key: string]: unknown;
}

const DashboardPage = () => {
  // State management
  const [userRole, setUserRole] = useState<"requester" | "helper">("helper");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasksDisplayed, setTasksDisplayed] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [helperDbsClearance, setHelperDbsClearance] = useState<DbsRequirement>("none");
  const [backgroundCheckData, setBackgroundCheckData] = useState<BackgroundCheckData | null>(null);
  const [pendingTaskClaim, setPendingTaskClaim] = useState<EnhancedTask | null>(null);
  const [showBackgroundCheck, setShowBackgroundCheck] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationTask, setNegotiationTask] = useState<EnhancedTask | null>(null);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showClaimsReview, setShowClaimsReview] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<EnhancedTask | null>(null);
  const [requesterTasks, setRequesterTasks] = useState<EnhancedTask[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const userStats: UserStats = {
    tasksCompleted: 47,
    rating: 4.8,
    earnings: "£340",
    helpedPeople: 32,
    dbClearance: helperDbsClearance,
  };

  // Transform MOCK_TASKS to EnhancedTask format
  const adaptedTasks: EnhancedTask[] = MOCK_TASKS.map((task, idx) => {
    const { location: originalLocation, perks: originalPerks, ...restOfMockTask } = task;

    return {
      ...restOfMockTask,
      dbsRequirement: (idx % 4 === 0 ? "enhanced" : idx % 4 === 1 ? "standard" : idx % 4 === 2 ? "basic" : "none") as DbsRequirement,
      urgency: task.urgency as "emergency" | "high" | "medium" | "low",
      estimatedDuration: "30-60 mins",
      successRate: 96,
      perks: originalPerks.map((p: PerkFromMock, perkIdx) => {
        const perkValue = typeof p.value === 'number' ? p.value : 0;
        return {
          ...p,
          id: p.id || `mock-perk-${task.id}-${perkIdx}`,
          description: p.description || `Payment perk of £${perkValue}`,
          name: `£${perkValue}`,
          estimatedValue: perkValue,
          type: "payment" as const,
          updatedAt: new Date().toISOString(),
          value: perkValue,
        } as OriginalPerkItem;
      }),
      tier: 1,
      mode: "physical" as const,
      status: (Math.random() > 0.8 ? "claimed" : "open") as TaskStatus,
      createdAt: new Date().toISOString(),
      requesterId: "user-123",
      location: {
        address: originalLocation || "Location not specified",
        lat: 51.5074,
        lng: -0.1278
      },
      claims: [],
      maxClaims: 5,
      claimExpiryHours: 24,
      autoAcceptBestClaim: false,
      autoAcceptCriteria: {
        minRating: 4.5,
        maxFee: 50,
        prioritizeRating: true
      }
    } as EnhancedTask;
  });

  // Generate requester tasks with claims
  const generateRequesterTasks = useCallback((): EnhancedTask[] => {
    return adaptedTasks.slice(0, 8).map((baseTask, idx) => {
      const statuses: TaskStatus[] = ['open', 'claimed', 'accepted', 'in_progress', 'completed'];
      const status = statuses[idx % statuses.length];
      
      const claims: TaskClaim[] = [];
      if (status === 'claimed' || status === 'accepted') {
        const numClaims = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < numClaims; i++) {
          claims.push({
            id: `claim-${baseTask.id}-${i}`,
            taskId: baseTask.id,
            helperId: `helper-${i}`,
            helperName: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'][i] || 'Helper',
            helperRating: 3.5 + Math.random() * 1.5,
            helperCompletedTasks: Math.floor(Math.random() * 50) + 10,
            proposedFee: 15 + Math.floor(Math.random() * 20),
            notes: [
              "I have extensive experience with this type of task and can complete it efficiently.",
              "Available to start immediately. I live nearby so travel won't be an issue.",
              "I've done similar work before and have all the necessary tools.",
              "Happy to help! I have great reviews and can start this weekend."
            ][i] || "Happy to help with this task!",
            status: status === 'accepted' && i === 0 ? 'approved' : 'pending',
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            responseTime: ['Usually responds in 2 hours', 'Usually responds in 1 hour', 'Usually responds in 30 minutes'][Math.floor(Math.random() * 3)],
            availability: ['Available this weekend', 'Available weekday evenings', 'Flexible schedule', 'Available immediately'][Math.floor(Math.random() * 4)]
          });
        }
      }

      return {
        ...baseTask,
        status,
        claims,
        acceptedClaimId: status === 'accepted' ? claims.find(c => c.status === 'approved')?.id : undefined
      };
    });
  }, [adaptedTasks]);

  // Effects
  useEffect(() => {
    if (userRole === 'requester') {
      setRequesterTasks(generateRequesterTasks());
    }
  }, [userRole, generateRequesterTasks]);

  // Filter tasks for helper view
  const filteredTasks = adaptedTasks.filter((task) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
    const isAvailable = task.status === "open" || task.claims.some(c => c.helperId === "current-user" && c.status === "pending");
    return matchesSearch && isAvailable;
  });

  const displayedTasks = filteredTasks.slice(0, tasksDisplayed);
  const hasMoreTasks = filteredTasks.length > tasksDisplayed;

  // Load more tasks
  const loadMoreTasks = useCallback(async () => {
    if (isLoadingMore || !hasMoreTasks) return;
    
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTasksDisplayed((prev) => prev + 6);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreTasks]);

  useEffect(() => {
    setTasksDisplayed(6);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case '/':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
        }
      }
      if (e.key === 'Escape') {
        if (showSidebar) setShowSidebar(false);
        if (showBackgroundCheck) setShowBackgroundCheck(false);
        if (showNegotiationModal) setShowNegotiationModal(false);
        if (searchFocused) searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSidebar, showBackgroundCheck, showNegotiationModal, searchFocused]);

  // Dark mode management
  const toggleDarkMode = () => {
    const newDarkModeState = !darkMode;
    setDarkMode(newDarkModeState);
    document.documentElement.classList.toggle("dark", newDarkModeState);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", newDarkModeState.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved) {
        const isDark = saved === "true";
        setDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Event handlers
  const handleBackgroundCheckSubmit = async (data: BackgroundCheckData) => {
    setBackgroundCheckData(data);
    if (data.personalInfo.level && DBS_RANK[data.personalInfo.level as DbsRequirement] > DBS_RANK[helperDbsClearance]) {
      setHelperDbsClearance(data.personalInfo.level as DbsRequirement);
    }
    setShowBackgroundCheck(false);

    if (pendingTaskClaim) {
      const required = pendingTaskClaim.dbsRequirement;
      if (DBS_RANK[data.personalInfo.level as DbsRequirement] >= DBS_RANK[required]) {
        setNegotiationTask(pendingTaskClaim);
        setShowNegotiationModal(true);
      }
      setPendingTaskClaim(null);
    }
  };

  const handleClaimTask = async (task: EnhancedTask) => {
    setClaimError(null);

    if (task.status !== "open") {
      setClaimError("This task is no longer available");
      return;
    }

    const helperRank = DBS_RANK[userStats.dbClearance];
    const requiredRank = DBS_RANK[task.dbsRequirement];

    if (helperRank < requiredRank) {
      setPendingTaskClaim(task);
      setShowBackgroundCheck(true);
      return;
    }

    const activeClaims = task.claims.filter(c => c.status === 'pending').length;
    if (activeClaims >= task.maxClaims) {
      setClaimError("Maximum number of claims reached for this task");
      return;
    }

    setNegotiationTask(task);
    setShowNegotiationModal(true);
  };

  const handleSubmitClaim = async (task: EnhancedTask, claimData: { fee: number; notes: string }) => {
    try {
      const claimRequest = {
        taskId: task.id,
        proposedFee: claimData.fee,
        notes: claimData.notes,
        taskVersion: task.updatedAt || task.createdAt,
      };

      console.log("Submitting claim request (simulated):", claimRequest);

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1 && task.status !== 'open') {
             reject(new Error("Task was just claimed or modified by another helper or requester"));
          } else {
            const updatedTask = { ...task, status: 'claimed' as TaskStatus, updatedAt: new Date().toISOString() };
            resolve(updatedTask);
          }
        }, 1000);
      });

      setJustClaimed(task.id);
      setTimeout(() => setJustClaimed(null), 3000);

      if (typeof window !== "undefined") {
        import("canvas-confetti").then((mod) => {
          mod.default({ 
            particleCount: 100, 
            spread: 70, 
            origin: { x: 0.5, y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b']
          });
        });
      }

      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

    } catch (error) {
      setClaimError(error instanceof Error ? error.message : "Failed to submit claim");
    } finally {
      setShowNegotiationModal(false);
      setNegotiationTask(null);
    }
  };

  const handleConfirmNegotiation = (claimData: { fee: number; notes: string }) => {
    if (negotiationTask) {
      handleSubmitClaim(negotiationTask, claimData);
    }
  };

  const handleViewClaims = (task: EnhancedTask) => {
    setReviewingTask(task);
    setShowClaimsReview(true);
  };

  const handleAcceptClaim = async (claimId: string) => {
    try {
      console.log('Accepting claim:', claimId);
      
      setRequesterTasks(prev => prev.map(task => {
        if (task.id === reviewingTask?.id) {
          return {
            ...task,
            status: 'accepted' as TaskStatus,
            acceptedClaimId: claimId,
            claims: task.claims.map(claim => ({
              ...claim,
              status: claim.id === claimId ? 'approved' as ClaimStatus : 'rejected' as ClaimStatus
            }))
          };
        }
        return task;
      }));

      setShowClaimsReview(false);
      setReviewingTask(null);

      if (typeof window !== "undefined") {
        import("canvas-confetti").then((mod) => {
          mod.default({ 
            particleCount: 50, 
            spread: 60, 
            origin: { x: 0.5, y: 0.6 }
          });
        });
      }

    } catch (error) {
      console.error('Failed to accept claim:', error);
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      console.log('Rejecting claim:', claimId);
      
      setRequesterTasks(prev => prev.map(task => {
        if (task.id === reviewingTask?.id) {
          const updatedClaims = task.claims.map(claim => 
            claim.id === claimId ? { ...claim, status: 'rejected' as ClaimStatus } : claim
          );
          
          const pendingClaimsStill = updatedClaims.filter(c => c.status === 'pending');
          const newStatus = pendingClaimsStill.length > 0 ? 'claimed' : (task.claims.some(c => c.status === 'approved') ? task.status : 'open');
          
          return {
            ...task,
            status: newStatus as TaskStatus,
            claims: updatedClaims
          };
        }
        return task;
      }));
      
      if (reviewingTask) {
        setReviewingTask(prev => {
            if (!prev) return null;
            const updatedClaims = prev.claims.map(c => c.id === claimId ? {...c, status: 'rejected' as ClaimStatus} : c);
            const pendingClaimsStill = updatedClaims.filter(c => c.status === 'pending');
            const newStatus = pendingClaimsStill.length > 0 ? 'claimed' : (prev.claims.some(c => c.status === 'approved' && c.id !== claimId) ? prev.status : 'open');
            return {
                ...prev,
                claims: updatedClaims,
                status: newStatus as TaskStatus
            };
        });
      }

    } catch (error) {
      console.error('Failed to reject claim:', error);
    }
  };

  const handleMessageHelper = (helperId: string) => {
    console.log('Opening message thread with helper:', helperId);
    // router.push(`/messages/${helperId}`);
  };

  const handleEditTask = (task: EnhancedTask) => {
    router.push(`/tasks/${task.id}/edit`);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <DashboardHeader
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenSidebar={() => setShowSidebar(true)}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* Sidebar */}
      <SidebarProfile
        showSidebar={showSidebar}
        onCloseSidebar={() => setShowSidebar(false)}
        userStats={userStats}
        backgroundCheckData={backgroundCheckData}
      />

      {/* Search Bar (Helper only) */}
      {userRole === "helper" && (
        <SearchToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchFocused={searchFocused}
          onSearchFocus={() => setSearchFocused(true)}
          onSearchBlur={() => setSearchFocused(false)}
          searchInputRef={searchInputRef}
        />
      )}

      {/* Main Content */}
      <main className="px-3 py-3 pb-[72px] sm:px-4 sm:py-4 sm:pb-20 min-h-[calc(100vh-120px)]">
        {userRole === "requester" ? (
          <RequesterDashboard
            requesterTasks={requesterTasks}
            onViewClaims={handleViewClaims}
            onEditTask={handleEditTask}
          />
        ) : (
          <HelperDashboard
            loading={loading}
            filteredTasks={filteredTasks}
            displayedTasks={displayedTasks}
            searchQuery={searchQuery}
            justClaimed={justClaimed}
            claimError={claimError}
            hasMoreTasks={hasMoreTasks}
            isLoadingMore={isLoadingMore}
            onClearSearch={() => setSearchQuery('')}
            onClearError={() => setClaimError(null)}
            onTaskClick={(taskId) => router.push(`/tasks/${taskId}`)}
            onTaskClaim={handleClaimTask}
            onLoadMore={loadMoreTasks}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t px-2 py-2 sm:px-4 sm:py-2 pb-safe-bottom">
        <div className="flex justify-around max-w-md mx-auto h-12 items-center">
          {[
            { icon: Activity, label: "Tasks", active: true },
            { icon: Users, label: "Messages" },
            { icon: Plus, label: "Post" },
            { icon: DollarSign, label: "Earnings" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex flex-col items-center justify-center p-1 min-w-12 h-12 touch-manipulation rounded-lg ${
                active ? "text-indigo-600" : "text-gray-400"
              } hover:text-indigo-500 transition-colors`}
            >
              <Icon size={16} className="sm:size-5" />
              <span className="text-xs mt-0.5 leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {showBackgroundCheck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl relative max-h-[85vh] overflow-hidden">
              <button
                onClick={() => setShowBackgroundCheck(false)}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 p-2 touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={18} className="sm:size-5" />
              </button>
              <div className="overflow-y-auto max-h-[85vh] overscroll-contain">
                <BackgroundCheck onSubmit={handleBackgroundCheckSubmit} className="w-full" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClaimsReview && reviewingTask && (
          <ClaimsReviewModal
            task={reviewingTask}
            onClose={() => {
              setShowClaimsReview(false);
              setReviewingTask(null);
            }}
            onAcceptClaim={handleAcceptClaim}
            onRejectClaim={handleRejectClaim}
            onMessage={handleMessageHelper}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNegotiationModal && negotiationTask && (
          <NegotiationModal
            taskTitle={negotiationTask.title}
            task={negotiationTask}
            onClose={() => {
              setShowNegotiationModal(false);
              setNegotiationTask(null);
            }}
            onConfirm={handleConfirmNegotiation}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;