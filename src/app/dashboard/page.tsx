// File: src/components/DashboardPage.tsx
// Purpose: World-class dashboard with advanced animations and visual design

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Star,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Filter,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { BackgroundCheck } from "@/components/BackgroundCheck";
import { BackgroundCheckData } from "@/types/backgroundCheck";
import TaskCard from "@/components/task/TaskCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { MOCK_TASKS, UI_CONFIG, BADGE_CONFIGS } from "@/constants/dashboardConstants";

// --- 0. Define Theme type and time-based color schemes ---
export type Theme = "night" | "morning" | "afternoon" | "evening";

const timeThemes: Record<Theme, { gradient: string; accent: string; text: string }> = {
  night: {
    gradient: "from-slate-900 via-purple-900 to-slate-900",
    accent: "from-purple-600 to-blue-600",
    text: "Good evening",
  },
  morning: {
    gradient: "from-blue-50 via-indigo-50 to-purple-50",
    accent: "from-orange-400 to-pink-400",
    text: "Good morning",
  },
  afternoon: {
    gradient: "from-blue-50 via-sky-50 to-cyan-50",
    accent: "from-blue-500 to-cyan-500",
    text: "Good afternoon",
  },
  evening: {
    gradient: "from-orange-50 via-amber-50 to-yellow-50",
    accent: "from-orange-500 to-red-500",
    text: "Good evening",
  },
};

const getTimeBasedTheme = (): Theme => {
  const hour = new Date().getHours();
  if (hour < 6) return "night";       // 12 AM - 6 AM
  if (hour < 12) return "morning";    // 6 AM - 12 PM
  if (hour < 18) return "afternoon";  // 12 PM - 6 PM
  return "evening";                   // 6 PM - 12 AM
};

// --- 1. Define the possible DBS levels (for both tasks and helpers) ---
type DbsLevel = "none" | "basic" | "standard" | "enhanced";

// We’ll assign a numeric rank to each level for easy comparison:
const DBS_RANK: Record<DbsLevel, number> = {
  none: 0,
  basic: 1,
  standard: 2,
  enhanced: 3,
};

// --- 2. Extend the Task interface to include a dbsRequirement field (local copy) ---
interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: "emergency" | "high" | "medium" | "low";
  estimatedDuration: string;
  successRate: string | number;
  perks: Array<{
    value?: number;
    description?: string;
    successRate?: string | number;
  }>;
  tier: string | number;

  // Instead of a boolean, each task now specifies exactly which DBS level it requires:
  dbsRequirement: DbsLevel;
}

// --- 3. Define the helper’s user stats, now including a `dbClearance` level (local copy) ---
interface UserStats {
  tasksCompleted: number;
  rating: number;
  earnings: string;
  helpedPeople: number;

  // This is the helper’s current DBS clearance level. e.g. "none", "basic", "standard", or "enhanced":
  dbClearance: DbsLevel;
}

// --- 4. Type for negotiation-modal props ---
interface NegotiationModalProps {
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

const SPRING_CONFIG = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  };
  
  const EASING = [0.25, 0.1, 0.25, 1];
  
  const animations = {
    pageTransition: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: SPRING_CONFIG,
    },
    cardHover: {
      whileHover: {
        scale: 1.02,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2, ease: EASING },
      },
      whileTap: { scale: 0.98 },
    },
    buttonPress: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { duration: 0.1 },
    },
    slideIn: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { ...SPRING_CONFIG, delay: 0.1 },
    },
    staggerChildren: {
      animate: {
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },
    shimmer: {
      animate: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: {
          duration: 2,
          ease: "linear",
          repeat: Infinity,
        },
      },
    },
  };

/**
 * NegotiationModal
 *
 * When a helper already has sufficient DBS clearance (i.e. `dbClearance >= dbsRequirement`),
 * we show this overlay so they can review any negotiation/fee details and then accept.
 * For now, it’s a minimal “Review & Accept” screen with a confirm button.
 */
const NegotiationModal: React.FC<NegotiationModalProps> = ({
  taskTitle,
  onClose,
  onConfirm,
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Darkened backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4 sm:items-center">
        <motion.div
          className="relative w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-xl hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close negotiation"
          >
            <X size={20} />
          </motion.button>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Negotiate & Accept
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
              You already have the required background clearance for{" "}
              <span className="font-medium">{taskTitle}</span>. Review the
              details below and click “Accept & Negotiate” to move forward.
            </p>

            {/* PLACEHOLDER: Insert any negotiation fields here (e.g. fee slider, time frames, etc.) */}
            <div className="space-y-4 mb-6">
              {/* Example: Show a default rate, allow the helper to propose changes */}
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Proposed Fee (£):
                </label>
                <input
                  type="number"
                  defaultValue={20}
                  min={0}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Notes / Comments (Optional):
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Any clarifications, timing constraints, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                Accept &amp; Negotiate
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- 5. Main DashboardPage component ---
const DashboardPage: React.FC = () => {
  const [userRole, setUserRole] = useState<"requester" | "helper">("helper");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tasksDisplayed, setTasksDisplayed] = useState<number>(6);

  // 5a) Track which theme (morning/evening/etc.) we’re on, so we can re-render every minute.
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTimeBasedTheme());

  // Instead of a single boolean, we track exactly which DBS clearance this helper has:
  const [helperDbsClearance, setHelperDbsClearance] = useState<DbsLevel>("none");

  // “BackgroundCheckData” is whatever the BackgroundCheck component returns
  const [backgroundCheckData, setBackgroundCheckData] =
    useState<BackgroundCheckData | null>(null);

  // When we click “Claim Task” but the helper lacks required clearance, we store that task here to open BackgroundCheck modal:
  const [pendingTaskClaim, setPendingTaskClaim] = useState<Task | null>(null);

  // Controls whether the BackgroundCheck modal is visible:
  const [showBackgroundCheck, setShowBackgroundCheck] = useState<boolean>(false);

  // New: tracks whether the Negotiation modal is open, and which task is being negotiated:
  const [showNegotiationModal, setShowNegotiationModal] =
    useState<boolean>(false);
  const [negotiationTask, setNegotiationTask] = useState<Task | null>(null);

  const router = useRouter();

  // Build userStats from helperDbsClearance
  const userStats: UserStats = {
    tasksCompleted: 47,
    rating: 4.8,
    earnings: "£340",
    helpedPeople: 32,
    dbClearance: helperDbsClearance,
  };

  // 5b) Update currentTheme every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme(getTimeBasedTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Adapt MOCK_TASKS into our Task[] shape, including a dbsRequirement field:
  // (Here, for illustration, we randomly assign a requirement. In a real app, your
  // database or API would supply the correct `dbsRequirement` per task.)
  const adaptedTasks: Task[] = MOCK_TASKS.map((task, idx) => ({
    ...task,
    // For demonstration, alternate requirements in a pattern
    dbsRequirement:
      idx % 4 === 0
        ? "enhanced"
        : idx % 4 === 1
        ? "standard"
        : idx % 4 === 2
        ? "basic"
        : "none",
    urgency: task.urgency as "emergency" | "high" | "medium" | "low",
    estimatedDuration: "30-60 mins",
    successRate: "96%",
    perks: task.perks.map((perk) => ({
      ...perk,
      description: `£${perk.value}`,
      successRate: "96%",
    })),
    tier: "Standard",
  }));

  // Simple filtering by searchQuery only
  const filteredTasks = adaptedTasks.filter((task) => {
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q)
    );
  });

  const displayedTasks = filteredTasks.slice(0, tasksDisplayed);
  const hasMoreTasks = filteredTasks.length > tasksDisplayed;

  const loadMoreTasks = useCallback(async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTasksDisplayed((prev) => prev + 6);
  }, []);

  const { sentinelRef } = useInfiniteScroll({
    callback: loadMoreTasks,
    isLoading: false,
    hasMore: hasMoreTasks,
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  // --- 6. handleBackgroundCheckSubmit: when the helper completes a new background check ---
  const handleBackgroundCheckSubmit = async (data: BackgroundCheckData) => {
    // Suppose BackgroundCheckData includes a field `level: DbsLevel` to indicate which clearance they now have.
    setBackgroundCheckData(data);

    // Update the helper’s clearance based on what they just completed:
    // (You may have your own logic in BackgroundCheck to know “basic” vs “standard” vs “enhanced”.)
    if (data.personalInfo.level
        && DBS_RANK[data.personalInfo.level
        ] > DBS_RANK[helperDbsClearance]) {
      setHelperDbsClearance(data.personalInfo.level
      );
    }

    setShowBackgroundCheck(false);

    // After obtaining the new clearance, if there was a pending task that triggered this modal:
    if (pendingTaskClaim) {
      // Check again: does this new clearance satisfy the task?
      const required = pendingTaskClaim.dbsRequirement;
      if (DBS_RANK[data.personalInfo.level
      ] >= DBS_RANK[required]) {
        // Now we can move into negotiation/accept flow:
        setNegotiationTask(pendingTaskClaim);
        setShowNegotiationModal(true);
      }
      // Clear the “pendingTaskClaim” either way:
      setPendingTaskClaim(null);
    }
  };

  // --- 7. handleClaimTask: when the user clicks the “Claim Task” button on a TaskCard ---
  const handleClaimTask = async (
    task: Task
  ) => {
    const helperRank = DBS_RANK[userStats.dbClearance];
    const requiredRank = DBS_RANK[task.dbsRequirement];

    // 1) If helper’s clearance < task’s requirement, open BackgroundCheck modal:
    if (helperRank < requiredRank) {
      setPendingTaskClaim(task);
      setShowBackgroundCheck(true);
      return;
    }

    // 2) If helper’s clearance >= task’s requirement, open Negotiation modal:
    // (We store the task in state so the NegotiationModal knows which title to show.)
    setNegotiationTask(task);
    setShowNegotiationModal(true);
  };

  // --- 8. When helper CONFIRMS negotiation, here is where you’d call your API / finalize the claim ---
  const handleConfirmNegotiation = () => {
    if (negotiationTask) {
      // Example: call an API to finalize the claim, passing negotiation details.
      // For now, we’ll just show confetti as confirmation.

      if (typeof window !== "undefined") {
        import("canvas-confetti").then((mod) => {
          const confetti = mod.default;
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#3b82f6", "#1d4ed8", "#1e40af"],
          });
        });
      }

      setShowNegotiationModal(false);
      setNegotiationTask(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  const navigate = {
    createTask: () => router.push("/tasks/create"),
    messages: () => alert("Navigate to messages"),
    earnings: () => alert("Navigate to earnings"),
  };

  // Simulate loading initial content
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // --- 9. Remaining UI components (StatCard, VerificationBadge, Shimmer, etc.) ---
  const StatCard = ({
    value,
    label,
    color = "gray",
    icon,
    size = "normal",
    trend,
  }: {
    value: string;
    label: string;
    color?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    size?: "normal" | "large";
    trend?: { value: number; isPositive: boolean };
  }) => {
    const Icon = icon;
    const colorKey = color as keyof typeof UI_CONFIG.colors;
    const colorClass = UI_CONFIG.colors[colorKey] || UI_CONFIG.colors.gray;

    return (
      <motion.div
        className={`
          backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl
          ${size === "large" ? "p-6" : "p-4"} hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all
        `}
        {...animations.cardHover}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {Icon && (
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <Icon size={size === "large" ? 24 : 20} className={colorClass} />
              </motion.div>
            )}
            <div className={`font-bold ${colorClass} ${size === "large" ? "text-3xl" : "text-xl"}`}>
              {value}
            </div>
            {trend && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-xs px-2 py-1 rounded-full ${
                  trend.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </motion.div>
            )}
          </div>
          <div className={`text-gray-600 dark:text-gray-400 ${size === "large" ? "text-sm" : "text-xs"} font-medium`}>
            {label}
          </div>
        </div>
      </motion.div>
    );
  };

  const VerificationBadge = ({ status }: { status: string }) => {
    const badgeKey = status as keyof typeof BADGE_CONFIGS;
    const config = BADGE_CONFIGS[badgeKey] || BADGE_CONFIGS.none;
    const Icon = config.icon;

    return (
      <motion.div
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${config.bg} border border-white/20`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={SPRING_CONFIG}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={status === "in_progress" ? { rotate: 360 } : {}}
          transition={status === "in_progress" ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          <Icon size={14} className={config.color} />
        </motion.div>
        <span className={config.color}>{config.text}</span>
      </motion.div>
    );
  };

  const ShimmerBar = ({
    width = "100%",
    height = "h-4",
    className = "",
  }: {
    width?: string;
    height?: string;
    className?: string;
  }) => (
    <motion.div
      className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg ${className}`}
      style={{ width, backgroundSize: "400% 100%" }}
      {...animations.shimmer}
    />
  );

  const SkeletonCard = ({ index }: { index: number }) => (
    <motion.div
      className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full"
            style={{ backgroundSize: "400% 100%" }}
            {...animations.shimmer}
          />
          <div className="flex-1 space-y-2">
            <ShimmerBar width="70%" />
            <ShimmerBar width="45%" height="h-3" />
          </div>
        </div>
        <ShimmerBar width="100%" height="h-3" />
        <ShimmerBar width="60%" height="h-3" />
        <div className="flex justify-between items-center pt-2">
          <ShimmerBar width="80px" height="h-8" className="rounded-full" />
          <ShimmerBar width="60px" height="h-8" className="rounded-lg" />
        </div>
      </div>
    </motion.div>
  );

  const SmartProgressBar = ({
    progress,
    label,
    color = "blue",
  }: {
    progress: number;
    label: string;
    color?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  // Header component
  const Header = () => (
    <motion.header
      className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={SPRING_CONFIG}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
            <motion.h1
              className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              TaskForPerks
            </motion.h1>
            <motion.div
              className="px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-800 dark:text-orange-200 rounded-lg text-xs font-medium border border-orange-200/50"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={12} className="inline mr-1" />
              DEMO
            </motion.div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              {...animations.buttonPress}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={() => setShowSidebar(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all"
              aria-label="Open menu"
              {...animations.buttonPress}
            >
              <Menu size={20} />
            </motion.button>
          </div>
        </div>

        <motion.div
          className="flex bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-1 mt-3 border border-white/20"
          role="tablist"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { role: "helper", label: "Find Tasks" },
            { role: "requester", label: "My Tasks" },
          ].map(({ role, label }) => (
            <motion.button
              key={role}
              onClick={() => setUserRole(role as "helper" | "requester")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                userRole === role
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-lg backdrop-blur-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-600/50"
              }`}
              role="tab"
              aria-selected={userRole === role}
              aria-label={label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.header>
  );

  // PerformanceStats component
  const PerformanceStats = () => (
    <motion.div
      className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
      {...animations.cardHover}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
            "linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="relative">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
            Your Performance
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap size={16} className="text-yellow-500" />
            </motion.div>
          </h3>

          {/* Progress indicators */}
          <div className="text-right">
            <SmartProgressBar progress={87} label="Weekly Goal" color="green" />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          variants={animations.staggerChildren}
          initial="initial"
          animate="animate"
        >
          <StatCard
            value="£35"
            label="Today"
            color="green"
            icon={DollarSign}
            size="large"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            value="£180"
            label="This Week"
            color="blue"
            icon={TrendingUp}
            size="large"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            value="4.8★"
            label="Rating"
            color="purple"
            icon={Star}
            size="large"
            trend={{ value: 3, isPositive: true }}
          />
        </motion.div>
      </div>
    </motion.div>
  );

  // TaskList component
  const TaskList = () => (
    <motion.div
      className="space-y-4"
      variants={animations.staggerChildren}
      initial="initial"
      animate="animate"
    >
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} index={i} />)
      ) : (
        <>
          {displayedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <TaskCard
                task={task}
                onClick={() => handleTaskClick(task)}
                onClaim={() => handleClaimTask(task)}
                showClaimButton={true}
              />
            </motion.div>
          ))}
          {hasMoreTasks && <div ref={sentinelRef} className="h-4" />}
          {!hasMoreTasks && displayedTasks.length > 6 && (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You&apos;ve seen all available tasks
              </p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );

  // Main render
  return (
    <motion.div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : `bg-gradient-to-br ${timeThemes[currentTheme].gradient}`
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div className="fixed inset-0 z-50" {...animations.pageTransition}>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSidebar(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl overflow-y-auto border-l border-white/20"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={SPRING_CONFIG}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <motion.button onClick={() => setShowSidebar(false)} {...animations.buttonPress}>
                    <X size={20} />
                  </motion.button>
                </div>

                {/* User profile card */}
                <motion.div
                  className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      JD
                    </motion.div>
                    <div>
                      <h3 className="font-semibold">John Doe</h3>
                      <VerificationBadge status={backgroundCheckData ? "completed" : "none"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard value={userStats.tasksCompleted.toString()} label="Tasks Done" />
                    <StatCard value={userStats.rating.toString()} label="Rating" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Bar */}
      {userRole === "helper" && (
        <motion.div
          className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              />
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 rounded-xl border border-white/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              {...animations.buttonPress}
            >
              <Filter size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="px-4 py-4 pb-20 max-w-7xl mx-auto">
        {userRole === "requester" ? (
          <motion.div
            className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white backdrop-blur-sm"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-3">Need help with something?</h2>
            <p className="text-indigo-100 mb-4 text-sm">
              Post a task and get help from our community of verified helpers
            </p>
            <motion.button
              onClick={navigate.createTask}
              className="w-full bg-white text-indigo-600 py-3 px-4 rounded-xl font-medium"
              {...animations.buttonPress}
            >
              <Plus size={20} className="inline mr-2" />
              Post New Task
            </motion.button>
          </motion.div>
        ) : (
          <div>
            <PerformanceStats />
            <TaskList />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-white/20 px-4 py-2 z-30"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { icon: Activity, label: "Tasks", active: true },
            { icon: Users, label: "Messages", active: false },
            { icon: Plus, label: "Post", active: false },
            { icon: DollarSign, label: "Earnings", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <motion.button
              key={label}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>

      {/* Background Check Modal */}
      <AnimatePresence>
        {showBackgroundCheck && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowBackgroundCheck(false)}
            />
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
              <motion.div
                className="relative w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={SPRING_CONFIG}
              >
                {/* Close button */}
                <motion.button
                  onClick={() => setShowBackgroundCheck(false)}
                  className="absolute right-4 top-4 z-10 p-2 rounded-xl hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
                {/* BackgroundCheck component: passes onSubmit back to handleBackgroundCheckSubmit */}
                <BackgroundCheck onSubmit={handleBackgroundCheckSubmit} className="w-full" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Negotiation & Accept Modal */}
      <AnimatePresence>
        {showNegotiationModal && negotiationTask && (
          <NegotiationModal
            taskTitle={negotiationTask.title}
            onClose={() => {
              setShowNegotiationModal(false);
              setNegotiationTask(null);
            }}
            onConfirm={handleConfirmNegotiation}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardPage;
