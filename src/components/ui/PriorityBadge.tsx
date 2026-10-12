import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
  isEmergency?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  isEmergency,
  className = '',
}) => {
  if (isEmergency || priority.toUpperCase() === 'URGENT') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5" />
        SAFETY HAZARD / URGENT
      </span>
    );
  }

  switch (priority.toUpperCase()) {
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          High Priority
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          Medium Priority
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30 ${className}`}>
          <ArrowDown className="w-3.5 h-3.5" />
          Low Priority
        </span>
      );
  }
};
