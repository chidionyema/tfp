// File: src/components/ui/UserVerificationBadge.tsx
// Component: UserVerificationBadge
// Type: Server Component (no state, pure display)
// Dependencies: lucide-react

import React from 'react';
import { Shield, ShieldCheck, Star, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface VerificationStatus {
  phone: boolean;
  email: boolean;
  identity: boolean;
  backgroundCheck: boolean;
  trustedRunner: boolean;
}

interface UserStats {
  tasksCompleted: number;
  rating: number;
  reviewCount: number;
  joinDate: string;
  responseTime: string;
}

interface UserVerificationBadgeProps {
  verification: VerificationStatus;
  stats: UserStats;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  showStats?: boolean;
  className?: string;
}

const UserVerificationBadge: React.FC<UserVerificationBadgeProps> = ({
  verification,
  stats,
  size = 'md',
  showDetails = false,
  showStats = false,
  className = ""
}) => {
  const getTrustLevel = () => {
    const verificationCount = Object.values(verification).filter(Boolean).length;
    if (verification.trustedRunner) return 'trusted';
    if (verificationCount >= 4) return 'verified';
    if (verificationCount >= 2) return 'basic';
    return 'new';
  };

  const trustLevel = getTrustLevel();

  const trustConfig = {
    trusted: {
      label: 'Trusted Runner',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: ShieldCheck,
      iconColor: 'text-green-600'
    },
    verified: {
      label: 'Verified User',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Shield,
      iconColor: 'text-blue-600'
    },
    basic: {
      label: 'Basic Verification',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: CheckCircle,
      iconColor: 'text-yellow-600'
    },
    new: {
      label: 'New User',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertTriangle,
      iconColor: 'text-gray-600'
    }
  };

  const config = trustConfig[trustLevel];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  const verificationItems = [
    { key: 'phone', label: 'Phone Verified', icon: CheckCircle },
    { key: 'email', label: 'Email Verified', icon: CheckCircle },
    { key: 'identity', label: 'ID Verified', icon: Shield },
    { key: 'backgroundCheck', label: 'Background Checked', icon: ShieldCheck },
    { key: 'trustedRunner', label: 'Trusted Runner Status', icon: Star }
  ];

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getResponseTimeColor = (responseTime: string) => {
    if (responseTime.includes('min')) return 'text-green-600';
    if (responseTime.includes('hour')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {/* Main Badge */}
      <div className={`inline-flex items-center gap-2 border rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
        <IconComponent size={iconSizes[size]} className={config.iconColor} />
        <span>{config.label}</span>
      </div>

      {/* User Stats */}
      {showStats && (
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          {stats.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="font-medium">{formatRating(stats.rating)}</span>
              <span className="text-gray-500">({stats.reviewCount})</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            <span>{stats.tasksCompleted} completed</span>
          </div>
          
          <div className={`flex items-center gap-1 ${getResponseTimeColor(stats.responseTime)}`}>
            <Clock size={14} />
            <span>{stats.responseTime} response</span>
          </div>
        </div>
      )}

      {/* Detailed Verification Status */}
      {showDetails && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Status</h4>
          <div className="space-y-2">
            {verificationItems.map((item) => {
              const ItemIcon = item.icon;
              const isVerified = verification[item.key as keyof VerificationStatus];
              
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <ItemIcon 
                    size={14} 
                    className={isVerified ? 'text-green-500' : 'text-gray-400'} 
                  />
                  <span className={`text-sm ${isVerified ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {!isVerified && (
                    <span className="text-xs text-gray-400 ml-auto">Not verified</span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Additional Stats */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Member since:</span>
                <p className="font-medium text-gray-900">{stats.joinDate}</p>
              </div>
              <div>
                <span className="text-gray-500">Response time:</span>
                <p className={`font-medium ${getResponseTimeColor(stats.responseTime)}`}>
                  {stats.responseTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Preset configurations for common use cases
export const TrustedRunnerBadge: React.FC<{ stats: UserStats; className?: string }> = ({ stats, className }) => (
  <UserVerificationBadge
    verification={{
      phone: true,
      email: true,
      identity: true,
      backgroundCheck: true,
      trustedRunner: true
    }}
    stats={stats}
    size="md"
    showStats={true}
    className={className}
  />
);

export const NewUserBadge: React.FC<{ stats: UserStats; className?: string }> = ({ stats, className }) => (
  <UserVerificationBadge
    verification={{
      phone: false,
      email: true,
      identity: false,
      backgroundCheck: false,
      trustedRunner: false
    }}
    stats={stats}
    size="sm"
    className={className}
  />
);

export const VerifiedUserBadge: React.FC<{ stats: UserStats; showDetails?: boolean; className?: string }> = ({ 
  stats, 
  showDetails = false, 
  className 
}) => (
  <UserVerificationBadge
    verification={{
      phone: true,
      email: true,
      identity: true,
      backgroundCheck: false,
      trustedRunner: false
    }}
    stats={stats}
    size="md"
    showDetails={showDetails}
    showStats={true}
    className={className}
  />
);

export default UserVerificationBadge;